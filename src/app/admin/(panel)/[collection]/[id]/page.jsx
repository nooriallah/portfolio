/**
 * src/app/admin/(panel)/[collection]/[id]/page.jsx — CREATE / EDIT ONE ROW
 * (/admin/projects/new, /admin/projects/12, …).
 * The form is generated from COLLECTIONS[collection].fields in src/backend/cms/schema.js.
 */
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@backend/db/index.js";
import { COLLECTIONS } from "@backend/cms/schema.js";
import { ItemForm } from "@backend/admin-ui/Forms.jsx";
import { PageHeader } from "@backend/admin-ui/PageHeader.jsx";

export default async function ItemPage({ params }) {
  const { collection, id } = await params;
  const def = COLLECTIONS[collection];
  if (!def) notFound();

  let item = null;
  if (id !== "new") {
    const table = schema[def.table];
    const db = await getDb();
    [item] = await db.select().from(table).where(eq(table.id, Number(id)));
    if (!item) notFound();
  }

  return (
    <>
      <PageHeader title={item ? `Edit ${def.singular.toLowerCase()}` : `New ${def.singular.toLowerCase()}`} />
      <div className="p-6 rounded-2xl border border-line bg-surface">
        <ItemForm collection={collection} def={def} item={item} />
      </div>
    </>
  );
}
