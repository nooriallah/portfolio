/**
 * src/app/admin/(panel)/settings/[group]/page.jsx — EDIT ONE SETTINGS GROUP
 * (/admin/settings/site, /admin/settings/hero, …).
 * The form is generated from SETTINGS_GROUPS in src/backend/cms/schema.js.
 */
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@backend/db/index.js";
import { SETTINGS_GROUPS } from "@backend/cms/schema.js";
import { SettingsForm } from "@backend/admin-ui/Forms.jsx";
import { PageHeader } from "@backend/admin-ui/PageHeader.jsx";

export default async function SettingsGroupPage({ params }) {
  const { group: key } = await params;
  const group = SETTINGS_GROUPS.find((g) => g.key === key);
  if (!group) notFound();

  const db = await getDb();
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, key));

  /* The SEO page's live preview needs to know what the page falls back to when
     a field is left empty — the title, description and images from the Site
     group — so it shows the same thing the real <meta> tags will. */
  let previewFallback;
  if (group.preview === "seo") {
    const [siteRow] = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "site"));
    const site = siteRow?.value ?? {};
    previewFallback = {
      title: site.title || "",
      description: site.description || "",
      image: site.heroImage || site.aboutImage || site.logo || "",
      siteName: site.title || "",
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
    };
  }

  return (
    <>
      <PageHeader title={group.label} description={group.description} />
      <div className="p-6 rounded-2xl border border-line bg-surface">
        <SettingsForm
          group={group}
          values={row?.value ?? {}}
          previewFallback={previewFallback}
        />
      </div>
    </>
  );
}
