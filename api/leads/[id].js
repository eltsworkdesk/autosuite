const { prisma } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');

const VALID_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'APPT_SCHEDULED', 'NEGOTIATING', 'SOLD', 'LOST'];

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;

  try {
    const { id } = req.query;

    if (req.method === 'PATCH') {
      const { status } = req.body || {};
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      const lead = await prisma.lead.update({ where: { id }, data: { status } });
      return res.status(200).json({ lead });
    }

    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('api/leads/[id] error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
