/**
 * src/backend/db/index.js — THE DATABASE CONNECTION.
 *
 * Exports a single Drizzle `db` instance used by the whole app.
 *
 * Two drivers, chosen automatically from DATABASE_URL:
 *  - Neon (host contains "neon.tech") → `@neondatabase/serverless` over HTTP.
 *    Best for Netlify functions: no long-lived TCP socket, fast cold starts.
 *  - Anything else (e.g. a local PostgreSQL while developing) → node `pg`.
 *
 * You never need to touch this file; change DATABASE_URL in .env.local
 * (locally) or in Netlify → Site configuration → Environment variables
 * (for the live site).
 *
 * NOTE: the missing-URL check lives INSIDE create() on purpose. If it ran
 * when the file is first imported, `next build` would crash while it is only
 * collecting page information — with a confusing "Failed to collect
 * configuration for /" message — instead of telling you what is actually
 * wrong. Checking it lazily keeps the error accurate and readable.
 */
import * as schema from "./schema.js";

// `globalThis` caching keeps one connection across hot reloads in `next dev`.
const g = globalThis;

async function create() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Locally: copy .env.example to .env.local and fill it in. " +
        "On Netlify: add DATABASE_URL (and AUTH_SECRET) under " +
        "Site configuration → Environment variables, then redeploy.",
    );
  }

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
  if (!g.__portfolioDb) {
    // Don't keep a failed attempt in the cache — otherwise one bad start
    // (missing variable, database asleep) would keep failing until restart.
    g.__portfolioDb = create().catch((err) => {
      g.__portfolioDb = undefined;
      throw err;
    });
  }
  return g.__portfolioDb;
}

export { schema };
