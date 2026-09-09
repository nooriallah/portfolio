/**
 * src/app/admin/(panel)/page.jsx — ADMIN DASHBOARD (/admin).
 * Row counts per collection, unread messages, and quick links.
 */
import Link from "next/link";
import { sql, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/index.js";
import { COLLECTIONS, SETTINGS_GROUPS } from "@/lib/cms/schema.js";
import { PageHeader } from "@/components/admin/PageHeader.jsx";

export default async function Dashboard() {
  const db = await getDb();
  const counts = {};
  for (const [key, c] of Object.entries(COLLECTIONS)) {
    const [{ n }] = await db.select({ n: sql`count(*)::int` }).from(schema[c.table]);
    counts[key] = n;
  }
  const [{ unread }] = await db
    .select({ unread: sql`count(*)::int` })
    .from(schema.messages)
    .where(eq(schema.messages.read, false));

  const card = "block p-5 rounded-2xl border border-line bg-surface hover:border-accent/50 transition";

  return (
    <>
      <PageHeader title="Dashboard" description="Everything on the public site is edited from here. Changes go live immediately." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/messages" className={card}>
          <p className="text-3xl font-bold text-heading">{unread}</p>
          <p className="text-sm text-muted mt-1">Unread messages</p>
        </Link>
        {Object.entries(COLLECTIONS).map(([key, c]) => (
          <Link key={key} href={`/admin/${key}`} className={card}>
            <p className="text-3xl font-bold text-heading">{counts[key]}</p>
            <p className="text-sm text-muted mt-1">{c.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 mb-3 text-sm font-semibold uppercase tracking-wider text-faint">Settings</h2>
      <div className="flex flex-wrap gap-2">
        {SETTINGS_GROUPS.map((g) => (
          <Link
            key={g.key}
            href={`/admin/settings/${g.key}`}
            className="px-3 py-1.5 text-sm rounded-lg border border-line text-heading hover:border-accent hover:bg-chip transition"
          >
            {g.label}
          </Link>
        ))}
      </div>
    </>
  );
}
