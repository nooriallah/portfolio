/**
 * scripts/migrate.mjs — CREATE / UPDATE THE DATABASE TABLES.
 *
 *     npm run db:push
 *
 * Applies the SQL migration files in ./drizzle to your database (Neon or any
 * PostgreSQL) over the same connection the app itself uses — no extra tools,
 * no interactive prompts. Already-applied migrations are skipped, so it is
 * always safe to run again.
 *
 * After changing src/lib/db/schema.js, first run `npm run db:generate` (writes
 * a new file into ./drizzle), then `npm run db:push`.
 */
import { getDb } from "../src/lib/db/index.js";

const url = process.env.DATABASE_URL || "";
const migrationsFolder = new URL("../drizzle", import.meta.url).pathname
  // Windows: strip the leading slash from "/C:/…"
  .replace(/^\/([A-Za-z]:)/, "$1");

const db = await getDb();
const { migrate } = /neon\.tech/.test(url)
  ? await import("drizzle-orm/neon-http/migrator")
  : await import("drizzle-orm/node-postgres/migrator");

await migrate(db, { migrationsFolder });
console.log("✓ Database tables are up to date.");
process.exit(0);
