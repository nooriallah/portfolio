"use client";
/**
 * src/frontend/components/Providers.jsx — CLIENT-SIDE CONTEXT FOR THE PUBLIC SITE.
 *
 * Wraps the site in:
 *  - <ThemeProvider>    dark / light (src/frontend/components/ThemeProvider.jsx)
 *  - <LanguageProvider> active language + localized content (i18n/LanguageProvider.jsx)
 *
 * `content` is the raw bundle from the database (server → client). The
 * initial theme/lang come from cookies read on the server, so the first
 * client render matches the server HTML exactly (no hydration warnings).
 */
import { ThemeProvider } from "./ThemeProvider.jsx";
import { LanguageProvider } from "@frontend/i18n/LanguageProvider.jsx";

export default function Providers({ content, initialTheme, initialLang, children }) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <LanguageProvider content={content} initialLang={initialLang}>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
