/**
 * src/app/layout.jsx — ROOT LAYOUT (server component).
 *
 * Wraps every page (public site AND /admin). Responsibilities:
 *  - Reads the visitor's saved theme + language from cookies and puts them on
 *    <html> BEFORE the page is sent, so there is no flash of the wrong theme
 *    or wrong text direction. With no theme cookie yet, <html> gets the class
 *    "theme-system" and globals.css follows the OS preference with a CSS
 *    media query — no JavaScript needed.
 *  - Links the Vazirmatn font (used when the layout is RTL).
 *  - Mounts the client-side providers (theme + language).
 *
 * Page <title> / description come from `generateMetadata` in page.jsx, so
 * they can be edited in /admin → Site.
 */
import { cookies } from "next/headers";
import "@frontend/styles/globals.css";
import { LANGUAGES, DEFAULT_LANG } from "@shared/config.js";

// Arabic-script font for Farsi / Pashto, loaded from Google Fonts (same as
// the old index.html). globals.css applies it under [dir="rtl"].
const VAZIRMATN_URL =
  "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;800&display=swap";

export const metadata = {
  title: "Noorullah Qayoumi — Web Developer",
  description: "Noorullah Qayoumi — Web Developer, Programmer & Freelancer.",
};

export default async function RootLayout({ children }) {
  const jar = await cookies();

  // Theme: "dark" | "light" from the cookie; null = follow the OS (CSS does it).
  const themeCookie = jar.get("theme")?.value;
  const theme = themeCookie === "light" || themeCookie === "dark" ? themeCookie : null;

  // Language: must be one we know, otherwise English.
  const langCookie = jar.get("lang")?.value;
  const lang = LANGUAGES.some((l) => l.code === langCookie) ? langCookie : DEFAULT_LANG;
  const dir = LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";

  return (
    <html
      lang={lang}
      dir={dir}
      className={theme === "dark" ? "dark" : theme === null ? "theme-system" : undefined}
      // The class may be changed by the script below / by the theme toggle
      // before React hydrates; tell React that is expected.
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={VAZIRMATN_URL} rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-bg text-body font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
