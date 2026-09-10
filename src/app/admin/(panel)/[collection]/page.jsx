/**
 * src/app/admin/(panel)/[collection]/page.jsx — LIST VIEW OF A COLLECTION
 * (/admin/projects, /admin/skills, …).
 *
 * Rows can be reordered by DRAGGING the ⠿ handle (see
 * src/components/admin/SortableList.jsx), or one step at a time with the
 * ↑ ↓ buttons. They can also be edited and deleted from here.
 *
 * This file only reads the rows from the database and hands the plain values
 * to SortableList — all the drag behaviour and the row markup live there.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { getDb, schema } from "@/lib/db/index.js";
import { COLLECTIONS } from "@/lib/cms/schema.js";
import { pick } from "@/lib/cms/localize.js";
import { BTN_PRIMARY } from "@/components/admin/Forms.jsx";
import { PageHeader } from "@/components/admin/PageHeader.jsx";
import SortableList from "@/components/admin/SortableList.jsx";

export default async function CollectionPage({ params, searchParams }) {
  const { collection } = await params;
  const { saved } = await searchParams;
  const def = COLLECTIONS[collection];
  if (!def) notFound();

  const table = schema[def.table];
  const db = await getDb();
  const rows = await db.select().from(table).orderBy(asc(table.sort), asc(table.id));

  const hasImage = def.fields.some((f) => f.name === "image");

  // Flatten each database row into the few plain values the list needs.
  // (A client component can only receive simple values, not database rows.)
  const listRows = rows.map((r) => ({
    id: r.id,
    title: pick(r[def.titleField], "en") || `#${r.id}`,
    sub: r.category || r.key || r.kind || r.url || (r.items ? r.items.join(", ") : "") || "",
    image: hasImage ? r.image || "" : "",
    draft: r.published === false,
  }));

  return (
    <>
      <PageHeader
        title={def.label}
        description={`${rows.length} ${rows.length === 1 ? "item" : "items"}. Drag the ⠿ handle to reorder — the order here is the order on the site.${
          def.newestFirst ? " New items are added at the top." : ""
        }`}
        action={
          <Link href={`/admin/${collection}/new`} className={BTN_PRIMARY}>
            <Plus size={16} /> New {def.singular.toLowerCase()}
          </Link>
        }
      />

      {saved && <p className="mb-4 text-sm text-accent">Saved — the site is updated.</p>}

      {listRows.length === 0 ? (
        <p className="text-sm text-muted">Nothing here yet.</p>
      ) : (
        <SortableList collection={collection} rows={listRows} hasImage={hasImage} />
      )}
    </>
  );
}
