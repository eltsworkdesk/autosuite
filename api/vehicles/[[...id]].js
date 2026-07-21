const { prisma } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { broadcast } = require('../_lib/events');

const VALID_STATUSES = ['draft', 'active', 'featured', 'sold'];

// Handles both /api/vehicles and /api/vehicles/:id (Vercel optional
// catch-all) — merged into one function to stay under the Hobby plan's
// serverless function count limit.
module.exports = async (req, res) => {
  const idParam = req.query.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  try {
    if (!id) {
      if (req.method === 'GET') {
        const { status } = req.query || {};
        const where = status && VALID_STATUSES.includes(status) ? { status } : {};
        const vehicles = await prisma.vehicle.findMany({ where, orderBy: { createdAt: 'desc' } });
        return res.status(200).json({
          vehicles: vehicles.map((v) => ({ ...v, images: JSON.parse(v.images || '[]') })),
        });
      }

      if (req.method === 'POST') {
        if (!requireAuth(req, res)) return;
        const { vin, make, model, year, price, mileage, color, body, engine, transmission, drivetrain, mpg, images, status } = req.body || {};

        if (!vin || !make || !model || !year || !price) {
          return res.status(400).json({ error: 'Missing required fields: vin, make, model, year, price' });
        }

        const vehicle = await prisma.vehicle.create({
          data: {
            vin,
            make,
            model,
            year: parseInt(year),
            price: parseInt(price),
            mileage: parseInt(mileage) || 0,
            color: color || 'Unknown',
            body: body || 'Sedan',
            engine: engine || 'N/A',
            transmission: transmission || 'Automatic',
            drivetrain: drivetrain || 'FWD',
            mpg: mpg ? parseFloat(mpg) : null,
            images: JSON.stringify(images || []),
            status: VALID_STATUSES.includes(status) ? status : 'active',
          },
        });
        broadcast('vehicle.created', { id: vehicle.id, make: vehicle.make, model: vehicle.model, price: vehicle.price });
        return res.status(201).json({ vehicle });
      }

      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!requireAuth(req, res)) return;

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
    console.error('api/vehicles error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
