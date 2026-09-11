/**
 * src/shared/localize.js — TURN i18n OBJECTS INTO PLAIN STRINGS.
 *
 * The database stores translated text as { en, fa, ps }. The React components
 * only want a string. `localize(value, lang)` walks any object/array and
 * replaces every i18n object with the text for `lang`, falling back to
 * English when a translation is empty.
 *
 * Works on both server and client (no imports of Node-only modules).
 */
import { LANG_CODES, DEFAULT_LANG } from "./config.js";

/** True when `v` looks like { en: "...", fa: "...", ... } */
export function isI18n(v) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const keys = Object.keys(v);
  return keys.length > 0 && keys.every((k) => LANG_CODES.includes(k));
}

/** Pick one language out of an i18n object (with English fallback). */
export function pick(v, lang) {
  if (!isI18n(v)) return v;
  return v[lang] || v[DEFAULT_LANG] || Object.values(v).find(Boolean) || "";
}

/** Deeply localize any value. */
export function localize(value, lang) {
  if (isI18n(value)) return pick(value, lang);
  if (Array.isArray(value)) return value.map((v) => localize(v, lang));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = localize(v, lang);
    return out;
  }
  return value;
}
