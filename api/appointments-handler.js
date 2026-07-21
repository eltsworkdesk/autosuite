const { prisma } = require('./_lib/db');
const { requireAuth } = require('./_lib/auth');
const { broadcast } = require('./_lib/events');

const VALID_TYPES = ['test-drive', 'inspection', 'consultation', 'maintenance'];
const VALID_STATUSES = ['scheduled', 'completed', 'no_show', 'cancelled'];

// Handles both /api/appointments and /api/appointments/:id (Vercel optional
// catch-all) — merged into one function to stay under the Hobby plan's
// serverless function count limit.
module.exports = async (req, res) => {
  const idParam = req.query.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  try {
    if (!id) {
      if (req.method === 'GET') {
        if (!requireAuth(req, res)) return;
        const appointments = await prisma.appointment.findMany({
          orderBy: { dateTime: 'asc' },
          include: { lead: true, vehicle: true },
        });
        return res.status(200).json({ appointments });
      }

      if (req.method === 'POST') {
        const { leadId, vehicleId, type, dateTime, notes } = req.body || {};

        if (!leadId || !dateTime) {
          return res.status(400).json({ error: 'Missing required fields: leadId, dateTime' });
        }

        const appointment = await prisma.appointment.create({
          data: {
            leadId,
            vehicleId: vehicleId || null,
            type: VALID_TYPES.includes(type) ? type : 'test-drive',
            dateTime: new Date(dateTime),
            notes: notes || null,
          },
        });

        // Reflect the scheduled test drive on the lead's pipeline stage.
        await prisma.lead.update({
          where: { id: leadId },
          data: { status: 'APPT_SCHEDULED', appointmentId: appointment.id },
        }).catch(() => {}); // Lead status update is best-effort; appointment creation already succeeded.

        broadcast('appointment.created', { id: appointment.id, dateTime: appointment.dateTime, type: appointment.type });
        return res.status(201).json({ appointment });
      }

      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!requireAuth(req, res)) return;

    if (req.method === 'PATCH') {
      const { status, dateTime, notes } = req.body || {};
      const data = {};

      if (status !== undefined) {
        if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
        data.status = status;
      }
      if (dateTime !== undefined) data.dateTime = new Date(dateTime);
      if (notes !== undefined) data.notes = notes;
      if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const appointment = await prisma.appointment.update({ where: { id }, data });
      broadcast('appointment.updated', { id: appointment.id, status: appointment.status });
      return res.status(200).json({ appointment });
    }

    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('api/appointments error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
