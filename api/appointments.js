const { prisma } = require('./_lib/db');
const { requireAuth } = require('./_lib/auth');

const VALID_TYPES = ['test-drive', 'inspection', 'consultation', 'maintenance'];

module.exports = async (req, res) => {
  try {
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

      return res.status(201).json({ appointment });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('api/appointments error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
