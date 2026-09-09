"use client";
/**
 * src/components/i18n/LanguageProvider.jsx — ACTIVE LANGUAGE + LOCALIZED CONTENT.
 *
 * Before: texts came from a hard-coded translations.js file.
 * Now:    texts come from the database bundle (`content` prop) and this
 *         provider picks the active language out of every { en, fa, ps } object.
 *
 * `useLang()` gives components:
 *   lang     – "en" | "fa" | "ps"
 *   dir      – "ltr" | "rtl"
 *   setLang  – switches language, saves cookie "lang", updates <html lang dir>
 *   t        – ALL site content, already in the active language:
 *              t.site, t.hero, t.about, t.contact, t.form, t.sections,
 *              t.nav, t.ui, t.skills[], t.services[], t.experience[],
 *              t.education[], t.reviews[], t.socials[], t.projects[]
 *
 * The list of languages is LANGUAGES in src/lib/cms/schema.js.
 */
import { createContext, useContext, useState, useMemo, useCallback } from "react";
import { LANGUAGES, DEFAULT_LANG } from "@/lib/cms/schema.js";
import { localize } from "@/lib/cms/localize.js";

const LangContext = createContext(null);

/** Shape the raw DB bundle into the `t` object the components read. */
function buildT(content, lang) {
  const s = content.settings ?? {};
  const raw = {
    site: s.site ?? {},
    hero: s.hero ?? {},
    about: s.about ?? {},
    contact: s.contact ?? {},
    form: s.form ?? {},
    sections: s.sections ?? {},
    nav: s.nav ?? {},
    ui: s.ui ?? {},
    skills: content.skills ?? [],
    services: content.services ?? [],
    experience: (content.experience ?? []).filter((e) => e.kind !== "education"),
    education: (content.experience ?? []).filter((e) => e.kind === "education"),
    reviews: content.reviews ?? [],
    socials: content.socials ?? [],
    projects: content.projects ?? [],
  };
  return localize(raw, lang);
}

export function LanguageProvider({ content, initialLang = DEFAULT_LANG, children }) {
  const [lang, setLangState] = useState(initialLang);

  const setLang = useCallback((code) => {
    const meta = LANGUAGES.find((l) => l.code === code);
    if (!meta) return;
    document.documentElement.lang = code;
    document.documentElement.dir = meta.dir;
    try {
      document.cookie = `lang=${code}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
    setLangState(code);
  }, []);

  const meta = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const t = useMemo(() => buildT(content, lang), [content, lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, dir: meta.dir, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LanguageProvider>");
  return ctx;
}
