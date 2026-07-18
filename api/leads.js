const { prisma } = require('./_lib/db');
const { requireAuth } = require('./_lib/auth');

const VALID_SOURCES = ['test-drive-modal', 'trade-in-estimator'];

module.exports = async (req, res) => {
  console.log(`[leads.js] ${req.method} request received`);
  try {
    if (req.method === 'POST') {
      const { carId, carName, name, email, phone, source } = req.body || {};
      if (!carName || !name || !email || !phone) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const lead = await prisma.lead.create({
        data: {
          carId: carId || null,
          carName,
          name,
          email,
          phone,
          source: VALID_SOURCES.includes(source) ? source : 'test-drive-modal',
        },
      });
      return res.status(201).json({ id: lead.id });
    }

    if (req.method === 'GET') {
      console.log(`[leads.js] GET: checking auth...`);
      if (!requireAuth(req, res)) {
        console.log(`[leads.js] GET: auth failed`);
        return;
      }
      console.log(`[leads.js] GET: auth passed, fetching leads...`);
      const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
      console.log(`[leads.js] GET: found ${leads.length} leads, sending response...`);
      return res.status(200).json({ leads });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('api/leads error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
