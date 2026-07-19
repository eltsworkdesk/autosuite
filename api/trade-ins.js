const { prisma } = require('./_lib/db');
const { requireAuth } = require('./_lib/auth');

const VALID_CONDITIONS = ['excellent', 'good', 'fair', 'poor'];

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      if (!requireAuth(req, res)) return;
      const estimates = await prisma.tradeInEstimate.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json({
        estimates: estimates.map((e) => ({ ...e, estimateRange: JSON.parse(e.estimateRange) })),
      });
    }

    if (req.method === 'POST') {
      const { name, email, phone, yearMakeModel, mileage, condition, estimateLow, estimateHigh } = req.body || {};

      if (!name || !email || !phone || !yearMakeModel) {
        return res.status(400).json({ error: 'Missing required fields: name, email, phone, yearMakeModel' });
      }

      const lead = await prisma.lead.create({
        data: {
          carName: yearMakeModel,
          name,
          email,
          phone,
          source: 'trade-in-estimator',
        },
      });

      const estimate = await prisma.tradeInEstimate.create({
        data: {
          leadId: lead.id,
          yearMakeModel,
          mileage: parseInt(mileage) || 0,
          condition: VALID_CONDITIONS.includes(condition) ? condition : 'good',
          estimateRange: JSON.stringify({ low: estimateLow || 0, high: estimateHigh || 0 }),
          status: 'estimated',
        },
      });

      return res.status(201).json({ id: estimate.id, leadId: lead.id });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('api/trade-ins error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
