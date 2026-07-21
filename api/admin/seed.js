const { prisma } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');

// One-time endpoint to populate a freshly-migrated production database with
// the same demo dataset used locally (prisma/seed.js). Refuses to run if the
// Lead table isn't empty, so it can't be triggered twice and silently
// duplicate data. Remove this route once production has been seeded.
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    if (!requireAuth(req, res)) return;

    const existingLeads = await prisma.lead.count();
    if (existingLeads > 0) {
      return res.status(409).json({ error: `Database already has ${existingLeads} lead(s) — refusing to reseed.` });
    }

    const dealership = await prisma.dealership.create({
      data: {
        name: 'AutoSuite Demo Dealership',
        email: 'dealer@autosuite.local',
        phone: '+234 800 123 4567',
        address: '14 Aminu Kano Crescent, Wuse II, Abuja, Nigeria',
        timezone: 'Africa/Lagos',
      },
    });

    const teamMember = await prisma.teamMember.create({
      data: {
        dealershipId: dealership.id,
        name: 'Derek Owusu',
        email: 'derek@autosuite.local',
        role: 'sales',
        permissions: JSON.stringify(['read:leads', 'update:leads', 'create:appointments']),
      },
    });

    const vehicles = await Promise.all([
      prisma.vehicle.create({
        data: {
          vin: '1HGBH41JXMN109186',
          make: 'Mercedes-Benz',
          model: 'E450',
          year: 2024,
          price: 45000000,
          mileage: 8500,
          color: 'Black',
          body: 'Sedan',
          engine: '3.0L Turbo I6',
          transmission: 'Automatic',
          drivetrain: 'AWD',
          mpg: 24,
          images: JSON.stringify(['/images/vehicles/e450-1.jpg']),
          status: 'active',
        },
      }),
      prisma.vehicle.create({
        data: {
          vin: '5UXCR6C0XL9B12345',
          make: 'BMW',
          model: 'X6',
          year: 2024,
          price: 52000000,
          mileage: 6200,
          color: 'Silver',
          body: 'SUV',
          engine: '3.0L Turbo I6',
          transmission: 'Automatic',
          drivetrain: 'AWD',
          mpg: 22,
          images: JSON.stringify(['/images/vehicles/x6-1.jpg']),
          status: 'active',
        },
      }),
      prisma.vehicle.create({
        data: {
          vin: 'WP1AA2AY8SDA98765',
          make: 'Porsche',
          model: 'Cayenne',
          year: 2025,
          price: 68000000,
          mileage: 3100,
          color: 'White',
          body: 'SUV',
          engine: '3.0L V6 Turbo',
          transmission: 'Automatic',
          drivetrain: 'AWD',
          mpg: 21,
          images: JSON.stringify(['/images/vehicles/cayenne-1.jpg']),
          status: 'featured',
        },
      }),
    ]);

    const leads = await Promise.all([
      prisma.lead.create({
        data: {
          carId: vehicles[0].id,
          carName: 'Mercedes-Benz E450',
          name: 'Maya Torres',
          email: 'maya@example.com',
          phone: '+234 801 234 5678',
          status: 'NEW',
          source: 'test-drive-modal',
          priority: 'High',
          tags: JSON.stringify(['urgent', 'financing-needed']),
          assignedToId: teamMember.id,
        },
      }),
      prisma.lead.create({
        data: {
          carId: vehicles[1].id,
          carName: 'BMW X6',
          name: 'David Chen',
          email: 'david@example.com',
          phone: '+234 802 345 6789',
          status: 'CONTACTED',
          source: 'phone-call',
          priority: 'Medium',
          tags: JSON.stringify(['family-vehicle']),
          assignedToId: teamMember.id,
        },
      }),
      prisma.lead.create({
        data: {
          carId: vehicles[2].id,
          carName: 'Porsche Cayenne',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+234 803 456 7890',
          status: 'QUALIFIED',
          source: 'website',
          priority: 'High',
          tags: JSON.stringify(['premium-buyer', 'test-drive-booked']),
          assignedToId: teamMember.id,
        },
      }),
    ]);

    function atHour(daysFromNow, hour, minute = 0) {
      const d = new Date();
      d.setDate(d.getDate() + daysFromNow);
      d.setHours(hour, minute, 0, 0);
      return d;
    }

    const appointments = await Promise.all([
      prisma.appointment.create({
        data: { leadId: leads[0].id, vehicleId: vehicles[0].id, type: 'test-drive', dateTime: atHour(1, 9, 0), status: 'scheduled' },
      }),
      prisma.appointment.create({
        data: { leadId: leads[2].id, vehicleId: vehicles[2].id, type: 'test-drive', dateTime: atHour(2, 14, 0), status: 'scheduled' },
      }),
      prisma.appointment.create({
        data: { leadId: leads[1].id, vehicleId: vehicles[1].id, type: 'consultation', dateTime: atHour(0, 11, 0), status: 'scheduled' },
      }),
    ]);

    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          name: 'Amaka Eze',
          email: 'amaka.eze@example.com',
          phone: '+234 801 234 5678',
          address: '14 Adeola Odeku St, Victoria Island, Lagos',
          preferredMakes: JSON.stringify(['BMW', 'Mercedes-Benz']),
          purchaseHistory: JSON.stringify([vehicles[1].id]),
          referralCode: 'AMAKA10',
        },
      }),
      prisma.customer.create({
        data: {
          name: 'Tunde Bakare',
          email: 'tunde.bakare@example.com',
          phone: '+234 802 345 6789',
          address: '22 Awolowo Rd, Ikoyi, Lagos',
          preferredMakes: JSON.stringify(['Mercedes-Benz', 'Porsche']),
          purchaseHistory: JSON.stringify([vehicles[0].id]),
        },
      }),
    ]);

    return res.status(200).json({
      dealership: dealership.name,
      teamMember: teamMember.name,
      vehicles: vehicles.length,
      leads: leads.length,
      appointments: appointments.length,
      customers: customers.length,
    });
  } catch (err) {
    console.error('api/admin/seed error:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
};
