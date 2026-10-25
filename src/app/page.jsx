/**
 * src/app/page.jsx — THE PUBLIC HOME PAGE (server component).
 *
 * 1. Loads all content from the database (cached, see backend/cms/content.js).
 * 2. Reads the visitor's theme/language cookies.
 * 3. Hands everything to <Providers> (client) which renders <Site>.
 *
 * `generateMetadata` below builds every <meta> tag from the "SEO & sharing"
 * settings group, so they are all editable in /admin → SEO & sharing.
 */
import { cookies } from "next/headers";
import { getContent } from "@backend/cms/content.js";
import { LANGUAGES, DEFAULT_LANG } from "@shared/config.js";
import { pick } from "@shared/localize.js";
import Providers from "@frontend/components/Providers.jsx";
import Site from "@frontend/components/Site.jsx";

/* ------------------------------------------------------------------ *
 * Which language is this visitor reading?
 * The language lives in a cookie (set by the language switcher), so the
 * meta tags can be generated in the same language as the page itself.
 * ------------------------------------------------------------------ */
async function activeLang() {
  const jar = await cookies();
  const code = jar.get("lang")?.value;
  return LANGUAGES.some((l) => l.code === code) ? code : DEFAULT_LANG;
}

/** First non-empty value — used for "empty falls back to…" everywhere below. */
function firstFilled(...values) {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

/* ------------------------------------------------------------------ *
 * ALL THE <meta> TAGS
 *
 * Edit the VALUES in /admin → SEO & sharing. Edit the SHAPE here.
 * Produces: title, description, keywords, canonical link, author,
 * Open Graph (the WhatsApp / LinkedIn / Facebook card), Twitter card,
 * favicon + apple touch icon, robots, and the Google verification tag.
 * ------------------------------------------------------------------ */
export async function generateMetadata() {
  const [{ settings }, lang] = await Promise.all([getContent(), activeLang()]);
  const seo = settings.seo ?? {};
  const site = settings.site ?? {};
  const hero = settings.hero ?? {};

  // --- text, in the visitor's language, falling back to the Site group ---
  const title =
    firstFilled(pick(seo.metaTitle, lang), site.title) || "Noorullah Qayoumi — Web Developer";
  const description = firstFilled(pick(seo.metaDescription, lang), site.description) || "";
  const author = firstFilled(seo.author, pick(hero.name, "en"));
  const siteName = firstFilled(seo.siteName, site.title, author);

  // --- the picture on the share card ---
  // A dedicated 1200×630 image is best; if there isn't one we fall back to
  // the hero portrait, then the logo, so a shared link is never blank.
  // The width/height are only declared for the dedicated share image, whose
  // size we know. Declaring 1200×630 for a fallback portrait that is really
  // some other shape makes platforms lay the card out wrongly, so for those
  // we stay silent and let each platform measure the file itself.
  const dedicated = firstFilled(seo.ogImage);
  const imageUrl = dedicated || firstFilled(site.heroImage, site.aboutImage, site.logo);
  const imageAlt = firstFilled(pick(seo.ogImageAlt, lang), title);

  // --- the site's own address: admin value wins, env var is the fallback ---
  const base = firstFilled(seo.siteUrl, process.env.NEXT_PUBLIC_SITE_URL);
  let metadataBase;
  try {
    metadataBase = base ? new URL(base) : undefined;
  } catch {
    metadataBase = undefined; // a typo in the URL must not break the page
  }

  // --- X / Twitter handle, with or without the @ ---
  const handle = seo.twitterHandle?.trim()
    ? `@${seo.twitterHandle.trim().replace(/^@/, "")}`
    : undefined;

  // The language actually being served, as og:locale wants it (en_US style),
  // plus the other two listed as alternates.
  const localeOf = (code) =>
    ({ en: "en_US", fa: "fa_AF", ps: "ps_AF" })[code] || code;

  return {
    title,
    description,
    keywords: seo.keywords?.length ? seo.keywords : undefined,
    authors: author ? [{ name: author }] : undefined,
    creator: author,
    publisher: author,
    metadataBase,
    applicationName: firstFilled(seo.mobileAppTitle, siteName),

    // The address Google should treat as the real one for this page.
    alternates: metadataBase ? { canonical: "/" } : undefined,

    // Favicon + the icon iOS uses when the site is added to a home screen.
    icons: site.logo
      ? { icon: site.logo, shortcut: site.logo, apple: site.logo }
      : undefined,

    // Tick "Hide from search engines" in the admin while the site is a work
    // in progress; untick it to be indexed normally.
    robots: seo.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },

    verification: seo.googleVerification
      ? { google: seo.googleVerification }
      : undefined,

    // ---- the card shown by WhatsApp, Telegram, LinkedIn, Facebook, iMessage
    openGraph: {
      type: "website",
      title,
      description: description || undefined,
      siteName: siteName || undefined,
      url: metadataBase ? "/" : undefined,
      locale: localeOf(lang),
      alternateLocale: LANGUAGES.filter((l) => l.code !== lang).map((l) => localeOf(l.code)),
      images: imageUrl
        ? [
            dedicated
              ? { url: imageUrl, width: 1200, height: 630, alt: imageAlt }
              : { url: imageUrl, alt: imageAlt },
          ]
        : undefined,
    },

    // ---- the card shown by X / Twitter
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description: description || undefined,
      site: handle,
      creator: handle,
      images: imageUrl ? [imageUrl] : undefined,
    },

    // Name under the icon when the site is saved to a phone home screen.
    appleWebApp: {
      capable: true,
      title: firstFilled(seo.mobileAppTitle, siteName, title),
      statusBarStyle: "default",
    },
  };
}

// Browser UI colour (the address bar on mobile) — /admin → Site → Theme colour.
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
