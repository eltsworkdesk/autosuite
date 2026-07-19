const { prisma } = require('./_lib/db');
const { requireAuth } = require('./_lib/auth');
const { broadcast } = require('./_lib/events');

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;

  try {
    if (req.method === 'GET') {
      const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json({
        customers: customers.map((c) => ({
          ...c,
          preferredMakes: JSON.parse(c.preferredMakes || '[]'),
          purchaseHistory: JSON.parse(c.purchaseHistory || '[]'),
        })),
      });
    }

    if (req.method === 'POST') {
      const { name, email, phone, address, preferredMakes, referralCode } = req.body || {};
      if (!name || !email) {
        return res.status(400).json({ error: 'Missing required fields: name, email' });
      }

      const customer = await prisma.customer.create({
        data: {
          name,
          email,
          phone: phone || null,
          address: address || null,
          preferredMakes: JSON.stringify(Array.isArray(preferredMakes) ? preferredMakes : []),
          referralCode: referralCode || null,
        },
      });

      broadcast('customer.created', { id: customer.id, name: customer.name });
      return res.status(201).json({ customer });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('api/customers error:', err);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A customer with this email already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
