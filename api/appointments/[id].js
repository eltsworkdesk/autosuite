const { prisma } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { broadcast } = require('../_lib/events');

const VALID_STATUSES = ['scheduled', 'completed', 'no_show', 'cancelled'];

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;

  try {
    const { id } = req.query;

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
    console.error('api/appointments/[id] error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
