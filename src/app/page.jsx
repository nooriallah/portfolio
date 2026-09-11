/**
 * src/app/page.jsx — THE PUBLIC HOME PAGE (server component).
 *
 * 1. Loads all content from the database (cached, see lib/cms/content.js).
 * 2. Reads the visitor's theme/language cookies.
 * 3. Hands everything to <Providers> (client) which renders <Site> — the
 *    same eight sections as before (Hero, About, Work, …).
 *
 * `generateMetadata` builds the <title> and meta description from the
 * "Site" settings group, so they are editable in /admin.
 */
import { cookies } from "next/headers";
import { getContent } from "@backend/cms/content.js";
import { LANGUAGES, DEFAULT_LANG } from "@shared/config.js";
import Providers from "@frontend/components/Providers.jsx";
import Site from "@frontend/components/Site.jsx";

export async function generateMetadata() {
  const { settings } = await getContent();
  const site = settings.site ?? {};
  return {
    title: site.title || "Noorullah Qayoumi — Web Developer",
    description: site.description || "",
    icons: site.logo ? { icon: site.logo } : undefined,
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : undefined,
    openGraph: {
      title: site.title || undefined,
      description: site.description || undefined,
      images: site.heroImage ? [site.heroImage] : undefined,
    },
  };
}

// Browser UI colour (address bar on mobile) — /admin → Site → Theme colour.
export async function generateViewport() {
  const { settings } = await getContent();
  return { themeColor: settings.site?.themeColor || "#2563eb" };
}

export default async function HomePage() {
  const [content, jar] = await Promise.all([getContent(), cookies()]);

  const themeCookie = jar.get("theme")?.value;
  const initialTheme =
    themeCookie === "light" || themeCookie === "dark" ? themeCookie : null;

  const langCookie = jar.get("lang")?.value;
  const initialLang = LANGUAGES.some((l) => l.code === langCookie)
    ? langCookie
    : DEFAULT_LANG;

  return (
    <Providers content={content} initialTheme={initialTheme} initialLang={initialLang}>
      <Site />
    </Providers>
  );
}
