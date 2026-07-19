const { prisma } = require('./_lib/db');
const { requireAuth } = require('./_lib/auth');
const { broadcast } = require('./_lib/events');

const VALID_ROUTING = ['round-robin', 'territory', 'skill-based'];

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;

  try {
    // Demo has exactly one dealership; a real multi-tenant build would key
    // this off the authenticated user's dealershipId.
    const dealership = await prisma.dealership.findFirst();
    if (!dealership) return res.status(404).json({ error: 'No dealership configured' });

    if (req.method === 'GET') {
      return res.status(200).json({ dealership: { ...dealership, settings: JSON.parse(dealership.settings || '{}') } });
    }

    if (req.method === 'PATCH') {
      const { name, email, phone, address, timezone, leadRouting } = req.body || {};
      const data = {};
      if (name !== undefined) data.name = name;
      if (email !== undefined) data.email = email;
      if (phone !== undefined) data.phone = phone;
      if (address !== undefined) data.address = address;
      if (timezone !== undefined) data.timezone = timezone;
      if (leadRouting !== undefined) {
        if (!VALID_ROUTING.includes(leadRouting)) return res.status(400).json({ error: 'Invalid leadRouting' });
        data.leadRouting = leadRouting;
      }
      if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const updated = await prisma.dealership.update({ where: { id: dealership.id }, data });
      broadcast('dealership.updated', { id: updated.id, name: updated.name });
      return res.status(200).json({ dealership: { ...updated, settings: JSON.parse(updated.settings || '{}') } });
    }

    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('api/dealership error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
