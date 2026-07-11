const { PrismaClient } = require('@prisma/client');

// Reuse a single Prisma client across warm serverless invocations instead
// of opening a new connection pool on every request.
const globalForPrisma = globalThis;

const prisma = globalForPrisma.__autosuitePrisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__autosuitePrisma = prisma;
}

module.exports = { prisma };
