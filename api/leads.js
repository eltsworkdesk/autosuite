const { prisma } = require('./_lib/db');
const { requireAuth } = require('./_lib/auth');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { carId, carName, name, email, phone } = req.body || {};
    if (!carName || !name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const lead = await prisma.lead.create({
      data: { carId: carId || null, carName, name, email, phone },
    });
    return res.status(201).json({ id: lead.id });
  }

  if (req.method === 'GET') {
    if (!requireAuth(req, res)) return;
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
    return res.status(200).json({ leads });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
