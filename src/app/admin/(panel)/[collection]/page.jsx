/**
 * src/app/admin/(panel)/[collection]/page.jsx — LIST VIEW OF A COLLECTION
 * (/admin/projects, /admin/skills, …). Rows can be reordered (↑ ↓), edited, deleted.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";
import { Plus, Pencil } from "lucide-react";
import { getDb, schema } from "@/lib/db/index.js";
import { COLLECTIONS } from "@/lib/cms/schema.js";
import { pick } from "@/lib/cms/localize.js";
import { RowActions, BTN_PRIMARY } from "@/components/admin/Forms.jsx";
import { PageHeader } from "@/components/admin/PageHeader.jsx";

export default async function CollectionPage({ params, searchParams }) {
  const { collection } = await params;
  const { saved } = await searchParams;
  const def = COLLECTIONS[collection];
  if (!def) notFound();

  const table = schema[def.table];
  const db = await getDb();
  const rows = await db.select().from(table).orderBy(asc(table.sort), asc(table.id));

  const hasImage = def.fields.some((f) => f.name === "image");

  return (
    <>
      <PageHeader
        title={def.label}
        description={`${rows.length} ${rows.length === 1 ? "item" : "items"}. Use the arrows to change the order on the site.`}
        action={
          <Link href={`/admin/${collection}/new`} className={BTN_PRIMARY}>
            <Plus size={16} /> New {def.singular.toLowerCase()}
          </Link>
        }
      />

      {saved && <p className="mb-4 text-sm text-accent">Saved — the site is updated.</p>}

      {rows.length === 0 ? (
        <p className="text-sm text-muted">Nothing here yet.</p>
      ) : (
        <ul className="divide-y divide-line-soft rounded-2xl border border-line bg-surface overflow-hidden">
          {rows.map((r, i) => {
            const title = pick(r[def.titleField], "en") || `#${r.id}`;
            const sub =
              r.category || r.key || r.kind || r.url || (r.items ? r.items.join(", ") : "") || "";
            return (
              <li key={r.id} className="flex items-center gap-4 px-4 py-3">
                <span className="w-6 text-xs text-faint tabular-nums">{i + 1}</span>
                {hasImage &&
                  (r.image ? (
                    <img src={r.image} alt="" className="w-14 h-10 rounded-md object-cover object-top border border-line bg-chip" />
                  ) : (
                    <span className="w-14 h-10 rounded-md border border-line bg-chip" />
                  ))}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-heading truncate">
                    {title}
                    {r.published === false && (
                      <span className="ms-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-chip text-muted">draft</span>
                    )}
                  </p>
                  {sub && <p className="text-xs text-faint truncate">{sub}</p>}
                </div>
                <Link
                  href={`/admin/${collection}/${r.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-line text-heading hover:border-accent transition"
                >
                  <Pencil size={14} /> Edit
                </Link>
                <RowActions collection={collection} id={r.id} first={i === 0} last={i === rows.length - 1} title={title} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
