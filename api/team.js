const { prisma } = require('./_lib/db');
const { requireAuth } = require('./_lib/auth');

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;

  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const members = await prisma.teamMember.findMany({
      include: { assignedLeads: true },
      orderBy: { joinedAt: 'asc' },
    });

    const team = members.map((m) => {
      const leads = m.assignedLeads || [];
      return {
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        joinedAt: m.joinedAt,
        active: !m.deactivatedAt,
        assignedLeadCount: leads.length,
        soldCount: leads.filter((l) => l.status === 'SOLD').length,
        openCount: leads.filter((l) => !['SOLD', 'LOST'].includes(l.status)).length,
      };
    });

    return res.status(200).json({ team });
  } catch (err) {
    console.error('api/team error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
