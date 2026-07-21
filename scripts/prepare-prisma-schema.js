// Local dev runs against a zero-setup SQLite file so contributors don't need
// a database running to get started (see prisma/schema.prisma). Production
// on Vercel has a real Neon Postgres database wired up via DATABASE_URL, and
// Vercel serverless functions don't have a persistent filesystem for SQLite
// to survive between invocations anyway — so the deployed schema's provider
// has to be postgresql, not the sqlite one committed for local dev.
//
// Vercel sets the VERCEL env var during every build. Only on Vercel, patch
// the datasource provider in place before `prisma generate`/`db push` run.
const fs = require('fs');
const path = require('path');

if (!process.env.VERCEL) process.exit(0);

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf8');
const patched = schema.replace('provider = "sqlite"', 'provider = "postgresql"');

if (patched === schema) {
  console.error('prepare-prisma-schema: expected to find provider = "sqlite" in prisma/schema.prisma but did not — schema may have already changed.');
  process.exit(1);
}

fs.writeFileSync(schemaPath, patched);
console.log('prepare-prisma-schema: patched datasource provider to postgresql for Vercel build.');
