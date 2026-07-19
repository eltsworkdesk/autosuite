const { prisma } = require('./_lib/db');
const { requireAuth } = require('./_lib/auth');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      if (!requireAuth(req, res)) return;
      const applications = await prisma.financeApplication.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json({ applications });
    }

    if (req.method === 'POST') {
      const { name, email, phone, carName, vehicleId, downPayment, loanTerm, apr, monthlyPayment } = req.body || {};

      if (!name || !email || !phone || !carName || monthlyPayment === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const lead = await prisma.lead.create({
        data: {
          carId: vehicleId || null,
          carName,
          name,
          email,
          phone,
          source: 'financing-calculator',
        },
      });

      const application = await prisma.financeApplication.create({
        data: {
          leadId: lead.id,
          vehicleId: vehicleId || null,
          downPayment: Math.round(downPayment) || 0,
          loanTerm: parseInt(loanTerm) || 60,
          apr: parseFloat(apr) || 0,
          monthlyPayment: Math.round(monthlyPayment),
        },
      });

      return res.status(201).json({ id: application.id, leadId: lead.id });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('api/finance error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
