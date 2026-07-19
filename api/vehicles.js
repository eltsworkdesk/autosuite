const { prisma } = require('./_lib/db');
const { requireAuth } = require('./_lib/auth');
const { broadcast } = require('./_lib/events');

const VALID_STATUSES = ['draft', 'active', 'featured', 'sold'];

module.exports = async (req, res) => {
  try {
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
  } catch (err) {
    console.error('api/vehicles error:', err);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A vehicle with this VIN already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
