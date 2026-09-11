/**
 * src/shared/config.js — CONSTANTS USED BY BOTH THE SITE AND THE ADMIN.
 *
 * These live in `shared/` because the public site needs them to render and the
 * backend needs them to define and validate content. Keeping them here is what
 * lets src/frontend avoid importing from src/backend.
 *
 * To add a language: add it to LANGUAGES, then fill in its texts in /admin —
 * every translated field in the admin panel grows a new input automatically.
 */

// The languages the site speaks. `dir` decides LTR/RTL layout.
export const LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "fa", label: "فارسی", dir: "rtl" },
  { code: "ps", label: "پښتو", dir: "rtl" },
];
export const DEFAULT_LANG = "en";
export const LANG_CODES = LANGUAGES.map((l) => l.code);

// Section ids: used as element ids, scroll targets and nav keys.
export const NAV_IDS = [
  "home",
  "about",
  "work",
  "experience",
  "skills",
  "services",
  "reviews",
  "contact",
];
