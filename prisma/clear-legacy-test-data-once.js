/**
 * One-time cleanup: the production Lead table has 2 leftover QA-test rows
 * ("Redesign QA", "QA Tester Test...") from whenever this deployment last
 * successfully built, long before the current build was fixed. Vehicles/
 * Appointments/Customers are already empty. Clears everything so
 * seed-production-once.js (run right after this in the build script) starts
 * from a clean slate instead of skipping because the Lead table isn't empty.
 * Remove this script and its build-script reference once this has run.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const counts = {
    appointments: (await prisma.appointment.deleteMany({})).count,
    leads: (await prisma.lead.deleteMany({})).count,
    vehicles: (await prisma.vehicle.deleteMany({})).count,
    customers: (await prisma.customer.deleteMany({})).count,
    teamMembers: (await prisma.teamMember.deleteMany({})).count,
    dealerships: (await prisma.dealership.deleteMany({})).count,
  };
  console.log('clear-legacy-test-data-once: cleared', JSON.stringify(counts));
}

main()
  .catch((e) => {
    console.error('clear-legacy-test-data-once failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
