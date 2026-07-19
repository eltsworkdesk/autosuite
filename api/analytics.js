const { prisma } = require('./_lib/db');
const { requireAuth } = require('./_lib/auth');

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;

  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const [leads, vehicles, appointments] = await Promise.all([
      prisma.lead.findMany(),
      prisma.vehicle.findMany(),
      prisma.appointment.findMany(),
    ]);

    const totalLeads = leads.length;
    const contacted = leads.filter((l) => !['NEW'].includes(l.status)).length;
    const qualified = leads.filter((l) => ['QUALIFIED', 'APPT_SCHEDULED', 'NEGOTIATING', 'SOLD'].includes(l.status)).length;
    const testDriveBooked = leads.filter((l) => ['APPT_SCHEDULED', 'NEGOTIATING', 'SOLD'].includes(l.status)).length;
    const sold = leads.filter((l) => l.status === 'SOLD').length;

    const soldVehicles = vehicles.filter((v) => v.status === 'sold');
    const totalSales = soldVehicles.reduce((sum, v) => sum + v.price, 0);
    const avgSalePrice = soldVehicles.length > 0 ? Math.round(totalSales / soldVehicles.length) : 0;

    const conversionRate = totalLeads > 0 ? parseFloat(((sold / totalLeads) * 100).toFixed(1)) : 0;

    const bySource = leads.reduce((acc, l) => {
      acc[l.source] = (acc[l.source] || 0) + 1;
      return acc;
    }, {});

    const byBody = vehicles.reduce((acc, v) => {
      acc[v.body] = (acc[v.body] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({
      totalSales,
      avgSalePrice,
      conversionRate,
      funnel: { leads: totalLeads, contacted, qualified, testDriveBooked, sold },
      leadSources: bySource,
      vehiclesByType: byBody,
      appointmentsThisWeek: appointments.length,
    });
  } catch (err) {
    console.error('api/analytics error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
