/**
 * src/app/admin/(panel)/page.jsx — ADMIN DASHBOARD (/admin).
 *
 * Row 1 — four KPI cards (the first one is dark navy, like the reference):
 *          Projects · Unread messages · Skill groups · Reviews
 * Row 2 — left: bar chart of messages received per month (last 8 months)
 *         right: donut with the share of published projects + latest messages
 * Row 3 — quick links to every settings group.
 *
 * All numbers are live from the database — nothing is invented.
 * Card look: the `card` constant; chart colours: src/backend/admin-ui/Charts.jsx.
 */
import Link from "next/link";
import { sql, eq, desc } from "drizzle-orm";
import {
  FolderKanban,
  Mail,
  Sparkles,
  MessageSquareQuote,
  ArrowUpRight,
} from "lucide-react";
import { getDb, schema } from "@backend/db/index.js";
import { SETTINGS_GROUPS } from "@backend/cms/schema.js";
import { BarChart, Donut } from "@backend/admin-ui/Charts.jsx";
import { PageHeader } from "@backend/admin-ui/PageHeader.jsx";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Messages per month for the last `n` months, oldest first, zero-filled. */
async function messagesPerMonth(db, n = 8) {
  const rows = await db
    .select({
      month: sql`to_char(date_trunc('month', ${schema.messages.createdAt}), 'YYYY-MM')`,
      count: sql`count(*)::int`,
    })
    .from(schema.messages)
    .where(sql`${schema.messages.createdAt} >= date_trunc('month', now()) - interval '${sql.raw(String(n - 1))} months'`)
    .groupBy(sql`1`);

  const byMonth = Object.fromEntries(rows.map((r) => [r.month, r.count]));
  const out = [];
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - (n - 1));
  for (let i = 0; i < n; i++) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ label: MONTHS[d.getMonth()], value: byMonth[key] ?? 0 });
    d.setMonth(d.getMonth() + 1);
  }
  return out;
}

export default async function Dashboard() {
  const db = await getDb();
  const count = async (table, where) => {
    const q = db.select({ n: sql`count(*)::int` }).from(table);
    const [{ n }] = where ? await q.where(where) : await q;
    return n;
  };

  const [projects, published, unread, skills, reviews, perMonth, latest] = await Promise.all([
    count(schema.projects),
    count(schema.projects, eq(schema.projects.published, true)),
    count(schema.messages, eq(schema.messages.read, false)),
    count(schema.skillGroups),
    count(schema.reviews),
    messagesPerMonth(db),
    db.select().from(schema.messages).orderBy(desc(schema.messages.createdAt)).limit(4),
  ]);

  const card = "rounded-2xl bg-surface border border-line p-5";
  const kpis = [
    { label: "Projects", value: projects, hint: `${published} published`, icon: FolderKanban, href: "/admin/projects", dark: true },
    { label: "Unread messages", value: unread, hint: "contact form", icon: Mail, href: "/admin/messages" },
    { label: "Skill groups", value: skills, hint: "on the site", icon: Sparkles, href: "/admin/skills" },
    { label: "Reviews", value: reviews, hint: "testimonials", icon: MessageSquareQuote, href: "/admin/reviews" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Everything on the public site is edited from here. Changes go live immediately." />

      {/* ---- KPI cards ---- */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, hint, icon: Icon, href, dark }) => (
          <Link
            key={label}
            href={href}
            className={`relative rounded-2xl p-5 border transition hover:-translate-y-0.5 hover:shadow-lg ${
              dark
                ? "bg-[var(--adm-navy)] border-transparent text-white shadow-[0_18px_40px_-24px_rgba(31,43,91,0.8)]"
                : "bg-surface border-line text-heading"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className={`text-xs font-semibold uppercase tracking-wider ${dark ? "text-white/70" : "text-muted"}`}>
                {label}
              </p>
              <span
                className={`grid place-items-center w-8 h-8 rounded-lg ${
                  dark ? "bg-white/10 text-white" : "bg-[var(--adm-amber)]/15 text-[var(--adm-amber)]"
                }`}
              >
                <Icon size={15} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight">{value}</p>
            <p className={`mt-1 text-xs ${dark ? "text-white/60" : "text-faint"}`}>{hint}</p>
          </Link>
        ))}
      </div>

      {/* ---- Charts row ---- */}
      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_20rem]">
        {/* Messages per month */}
        <div className={`${card} flex flex-col`}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <div>
              <h2 className="font-semibold text-heading">Messages received</h2>
              <p className="text-xs text-faint">Last 8 months · from the contact form</p>
            </div>
            <Link
              href="/admin/messages"
              className="btn-accent inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              Open inbox <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="flex-1 flex items-center">
            <BarChart data={perMonth} height={200} />
          </div>
        </div>

        {/* Published share + latest messages */}
        <div className={`${card} flex flex-col items-center text-center`}>
          <h2 className="font-semibold text-heading self-start">Published projects</h2>
          <p className="text-xs text-faint self-start mb-3">{published} of {projects} visible on the site</p>
          <Donut value={published} total={projects} label="of projects published" />

          <div className="w-full mt-5 pt-4 border-t border-line-soft text-start">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Latest messages</p>
            {latest.length === 0 ? (
              <p className="text-sm text-faint">No messages yet.</p>
            ) : (
              <ul className="space-y-2">
                {latest.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 text-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${m.read ? "bg-line" : "bg-[var(--adm-amber)]"}`} />
                    <span className="truncate text-heading">{m.name}</span>
                    <span className="ms-auto text-xs text-faint tabular-nums">
                      {m.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/messages"
              className="btn-accent mt-4 inline-flex w-full items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold transition"
            >
              Check now
            </Link>
          </div>
        </div>
      </div>

      {/* ---- Settings shortcuts ---- */}
      <h2 className="mt-10 mb-3 text-xs font-semibold uppercase tracking-wider text-faint">Settings</h2>
      <div className="flex flex-wrap gap-2">
        {SETTINGS_GROUPS.map((g) => (
          <Link
            key={g.key}
            href={`/admin/settings/${g.key}`}
            className="px-3 py-1.5 text-sm rounded-lg border border-line bg-surface text-heading hover:border-[var(--adm-amber)] transition"
          >
            {g.label}
          </Link>
        ))}
      </div>
    </>
  );
}
