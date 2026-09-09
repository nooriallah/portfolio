/**
 * src/app/admin/(panel)/settings/[group]/page.jsx — EDIT ONE SETTINGS GROUP
 * (/admin/settings/site, /admin/settings/hero, …).
 * The form is generated from SETTINGS_GROUPS in src/lib/cms/schema.js.
 */
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/index.js";
import { SETTINGS_GROUPS } from "@/lib/cms/schema.js";
import { SettingsForm } from "@/components/admin/Forms.jsx";
import { PageHeader } from "@/components/admin/PageHeader.jsx";

export default async function SettingsGroupPage({ params }) {
  const { group: key } = await params;
  const group = SETTINGS_GROUPS.find((g) => g.key === key);
  if (!group) notFound();

  const db = await getDb();
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, key));

  return (
    <>
      <PageHeader title={group.label} description={group.description} />
      <div className="p-6 rounded-2xl border border-line bg-surface">
        <SettingsForm group={group} values={row?.value ?? {}} />
      </div>
    </>
  );
}
