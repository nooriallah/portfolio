/**
 * src/lib/cms/content.js — LOAD ALL PUBLIC CONTENT FROM THE DATABASE (server only).
 *
 * `getContent()` returns one "bundle" with everything the public site needs:
 *   {
 *     settings: { site, hero, about, contact, form, sections, nav, ui },
 *     projects, skills, services, experience, reviews, socials
 *   }
 * Translated fields are still { en, fa, ps } objects here; the
 * LanguageProvider on the client picks the active language.
 *
 * The result is cached with the tag "content". Every admin save calls
 * `updateTag("content")` (see src/lib/cms/actions.js), so the public site
 * updates immediately after a save — and stays fast in between.
 */
import { unstable_cache } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/index.js";
import { SETTINGS_GROUPS } from "./schema.js";

export const CONTENT_TAG = "content";

/** Read every settings row into { [key]: value }, filling missing groups with {}. */
async function loadSettings(db) {
  const rows = await db.select().from(schema.settings);
  const out = {};
  for (const g of SETTINGS_GROUPS) out[g.key] = {};
  for (const r of rows) out[r.key] = r.value ?? {};
  return out;
}

async function loadContentUncached() {
  const db = await getDb();
  let rows;
  try {
    rows = await Promise.all([
      loadSettings(db),
      db
        .select()
        .from(schema.projects)
        .where(eq(schema.projects.published, true))
        .orderBy(asc(schema.projects.sort), asc(schema.projects.id)),
      db.select().from(schema.skillGroups).orderBy(asc(schema.skillGroups.sort)),
      db.select().from(schema.services).orderBy(asc(schema.services.sort)),
      db.select().from(schema.experience).orderBy(asc(schema.experience.sort)),
      db
        .select()
        .from(schema.reviews)
        .where(eq(schema.reviews.published, true))
        .orderBy(asc(schema.reviews.sort)),
      db.select().from(schema.socials).orderBy(asc(schema.socials.sort)),
    ]);
  } catch (err) {
    // Drizzle hides the real reason in `cause`; surface it so the error screen
    // can say "relation does not exist" (run db:push) vs "connection refused".
    const cause = err?.cause?.message || err?.cause?.code || "";
    throw new Error(`Database error: ${cause || err.message}`, { cause: err });
  }
  const [settings, projects, skills, services, experience, reviews, socials] = rows;

  return {
    settings,
    // `createdAt` is a Date and does not survive the cache's JSON step; drop it.
    projects: projects.map(({ createdAt, ...p }) => p),
    skills,
    services,
    experience,
    reviews,
    socials,
  };
}

/** Cached content bundle — use this in server components. */
export const getContent = unstable_cache(loadContentUncached, [CONTENT_TAG], {
  tags: [CONTENT_TAG],
  revalidate: 3600, // safety net: refresh at least hourly even without a save
});
