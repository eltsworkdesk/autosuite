/**
 * AutoSuite Database Seed Script
 * Populates local database with demo data for testing
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create dealership
  const dealership = await prisma.dealership.create({
    data: {
      name: 'AutoSuite Demo Dealership',
      email: 'dealer@autosuite.local',
      phone: '+1 (555) 123-4567',
      address: '123 Auto Drive, City, ST 12345',
      timezone: 'America/New_York',
    },
  });

  console.log('✓ Created dealership:', dealership.name);

  // Create team member
  const teamMember = await prisma.teamMember.create({
    data: {
      dealershipId: dealership.id,
      name: 'John Sales Rep',
      email: 'john@autosuite.local',
      role: 'sales',
      permissions: JSON.stringify(['read:leads', 'update:leads', 'create:appointments']),
    },
  });

  console.log('✓ Created team member:', teamMember.name);

  // Create vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        vin: '1HGBH41JXMN109186',
        make: 'Honda',
        model: 'Civic',
        year: 2024,
        price: 18500000,
        mileage: 1200,
        color: 'Blue',
        body: 'Sedan',
        engine: '2.0L 4-cyl',
        transmission: 'CVT',
        drivetrain: 'FWD',
        mpg: 33,
        images: JSON.stringify([
          '/images/vehicles/civic-1.jpg',
          '/images/vehicles/civic-2.jpg',
        ]),
        status: 'active',
      },
    }),
    prisma.vehicle.create({
      data: {
        vin: '1GBHK29K05E123456',
        make: 'Chevrolet',
        model: 'Tahoe',
        year: 2023,
        price: 68000000,
        mileage: 15000,
        color: 'Black',
        body: 'SUV',
        engine: '5.3L V8',
        transmission: 'Automatic',
        drivetrain: 'RWD',
        mpg: 18,
        images: JSON.stringify([
          '/images/vehicles/tahoe-1.jpg',
          '/images/vehicles/tahoe-2.jpg',
        ]),
        status: 'active',
      },
    }),
    prisma.vehicle.create({
      data: {
        vin: 'WBADT63402G298318',
        make: 'BMW',
        model: '3 Series',
        year: 2024,
        price: 52000000,
        mileage: 500,
        color: 'Silver',
        body: 'Sedan',
        engine: '2.0L Turbo',
        transmission: 'Automatic',
        drivetrain: 'RWD',
        mpg: 29,
        images: JSON.stringify([
          '/images/vehicles/bmw-1.jpg',
          '/images/vehicles/bmw-2.jpg',
        ]),
        status: 'featured',
      },
    }),
  ]);

  console.log(`✓ Created ${vehicles.length} vehicles`);

  // Create sample leads
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        carId: vehicles[0].id,
        carName: 'Honda Civic',
        name: 'Maya Torres',
        email: 'maya@example.com',
        phone: '+1 (555) 987-6543',
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
        carName: 'Chevrolet Tahoe',
        name: 'David Chen',
        email: 'david@example.com',
        phone: '+1 (555) 456-7890',
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
        carName: 'BMW 3 Series',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+1 (555) 234-5678',
        status: 'QUALIFIED',
        source: 'website',
        priority: 'High',
        tags: JSON.stringify(['premium-buyer', 'test-drive-booked']),
        assignedToId: teamMember.id,
      },
    }),
  ]);

  console.log(`✓ Created ${leads.length} leads`);

  // Create sample appointments
  const appointments = await Promise.all([
    prisma.appointment.create({
      data: {
        leadId: leads[0].id,
        vehicleId: vehicles[0].id,
        type: 'test-drive',
        dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: 'scheduled',
      },
    }),
    prisma.appointment.create({
      data: {
        leadId: leads[2].id,
        vehicleId: vehicles[2].id,
        type: 'test-drive',
        dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        status: 'scheduled',
      },
    }),
  ]);

  console.log(`✓ Created ${appointments.length} appointments`);

  // Create sample customers (past buyers, distinct from active leads)
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Amaka Eze',
        email: 'amaka.eze@example.com',
        phone: '+234 801 234 5678',
        address: '14 Adeola Odeku St, Victoria Island, Lagos',
        preferredMakes: JSON.stringify(['BMW', 'Mercedes-Benz']),
        purchaseHistory: JSON.stringify([vehicles[2].id]),
        referralCode: 'AMAKA10',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Tunde Bakare',
        email: 'tunde.bakare@example.com',
        phone: '+234 802 345 6789',
        address: '22 Awolowo Rd, Ikoyi, Lagos',
        preferredMakes: JSON.stringify(['Honda', 'Toyota']),
        purchaseHistory: JSON.stringify([vehicles[0].id]),
      },
    }),
  ]);

  console.log(`✓ Created ${customers.length} customers`);

  console.log('\n✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
