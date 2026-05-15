/**
 * Prints where Prisma connects (host + DB name only). Use:
 *   npx dotenv-cli -e .env.local -- node scripts/print-db-target.mjs
 */
import { PrismaClient } from "../src/generated/prisma/index.js";

const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

let host = "(unknown)";
let database = "(unknown)";
try {
  const u = new URL(raw.replace(/^postgresql:/i, "http:"));
  host = u.hostname;
  database = u.pathname.replace(/^\//, "").split("?")[0] || "(unknown)";
} catch {
  console.error("Could not parse DATABASE_URL");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const rows = await prisma.$queryRaw`SELECT current_database() AS db, version() AS version`;
  const row = rows[0];
  const n = await prisma.listing.count();
  console.log(
    JSON.stringify(
      {
        configuredHost: host,
        configuredDatabase: database,
        liveDatabase: row?.db ?? null,
        listingRowCount: n,
        serverVersionPrefix:
          typeof row?.version === "string"
            ? row.version.split(" ").slice(0, 2).join(" ")
            : null,
      },
      null,
      2,
    ),
  );
} finally {
  await prisma.$disconnect();
}
