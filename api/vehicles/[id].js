const { prisma } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { broadcast } = require('../_lib/events');

const VALID_STATUSES = ['draft', 'active', 'featured', 'sold'];

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;

  try {
    const { id } = req.query;

    if (req.method === 'PATCH') {
      const { price, mileage, status, color, dealerNotes, history } = req.body || {};
      const data = {};

      if (price !== undefined) data.price = parseInt(price);
      if (mileage !== undefined) data.mileage = parseInt(mileage);
      if (color !== undefined) data.color = color;
      if (dealerNotes !== undefined) data.dealerNotes = dealerNotes;
      if (history !== undefined) data.history = history;
      if (status !== undefined) {
        if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
        data.status = status;
      }
      if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const vehicle = await prisma.vehicle.update({ where: { id }, data });
      broadcast('vehicle.updated', { id: vehicle.id, status: vehicle.status, price: vehicle.price });
      return res.status(200).json({ vehicle });
    }

    if (req.method === 'DELETE') {
      await prisma.vehicle.delete({ where: { id } });
      broadcast('vehicle.deleted', { id });
      return res.status(204).end();
    }

    res.setHeader('Allow', 'PATCH, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('api/vehicles/[id] error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
