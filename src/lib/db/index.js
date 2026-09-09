/**
 * src/lib/db/index.js — THE DATABASE CONNECTION.
 *
 * Exports a single Drizzle `db` instance used by the whole app.
 *
 * Two drivers, chosen automatically from DATABASE_URL:
 *  - Neon (host contains "neon.tech") → `@neondatabase/serverless` over HTTP.
 *    Best for Netlify functions: no long-lived TCP socket, fast cold starts.
 *  - Anything else (e.g. a local PostgreSQL while developing) → node `pg`.
 *
 * You never need to touch this file; change DATABASE_URL in .env.local instead.
 */
import * as schema from "./schema.js";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.",
  );
}

// `globalThis` caching keeps one connection across hot reloads in `next dev`.
const g = globalThis;

async function create() {
  if (/neon\.tech/.test(url)) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle(neon(url), { schema });
  }
  const { default: pg } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const pool = new pg.Pool({ connectionString: url, max: 5 });
  return drizzle(pool, { schema });
}

/**
 * Returns the shared Drizzle instance (created on first call).
 * Usage:  const db = await getDb();  await db.select().from(projects);
 */
export async function getDb() {
  if (!g.__portfolioDb) g.__portfolioDb = create();
  return g.__portfolioDb;
}

export { schema };
