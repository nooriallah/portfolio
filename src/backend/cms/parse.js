/**
 * src/backend/cms/parse.js — FORM DATA → DATABASE VALUES.
 *
 * The admin forms are generated from field definitions (lib/cms/schema.js).
 * This file does the reverse: it reads the submitted FormData back into the
 * JSON shape each field type stores. Input naming convention (see
 * components/admin/Fields.jsx):
 *
 *   text/textarea/url/number/select   name
 *   boolean                           name          ("on" when checked)
 *   tags                              name          (one per line or comma separated)
 *   i18n / i18n-textarea              name.en, name.fa, name.ps
 *   i18n-list                         name.en …     (one item per line, per language)
 *   pairs                             name.<row>.label.en, name.<row>.value.en …
 */
import { LANG_CODES } from "./schema.js";

const str = (v) => (v == null ? "" : String(v)).trim();

/** "a, b\nc" → ["a", "b", "c"] */
function splitList(v) {
  return str(v)
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Read one i18n object { en, fa, ps } for the given base name. */
function readI18n(fd, base) {
  const out = {};
  for (const code of LANG_CODES) out[code] = str(fd.get(`${base}.${code}`));
  return out;
}

/** Parse every field definition from the FormData. Returns { values, errors }. */
export function parseFields(fields, fd) {
  const values = {};
  const errors = {};

  for (const f of fields) {
    let v;
    switch (f.type) {
      case "text":
      case "textarea":
      case "url":
      case "image":
      case "select":
        v = str(fd.get(f.name));
        break;
      case "number":
        v = fd.get(f.name) === "" || fd.get(f.name) == null ? null : Number(fd.get(f.name));
        if (Number.isNaN(v)) v = null;
        break;
      case "boolean":
        v = fd.get(f.name) === "on" || fd.get(f.name) === "true";
        break;
      case "tags":
        v = splitList(fd.get(f.name));
        break;
      case "i18n":
      case "i18n-textarea":
        v = readI18n(fd, f.name);
        break;
      case "i18n-list": {
        v = {};
        for (const code of LANG_CODES) {
          v[code] = str(fd.get(`${f.name}.${code}`))
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        break;
      }
      case "pairs": {
        // Rows are numbered by the client; collect every index that appears.
        const idx = new Set();
        for (const key of fd.keys()) {
          const m = key.match(new RegExp(`^${f.name}\\.(\\d+)\\.`));
          if (m) idx.add(Number(m[1]));
        }
        v = [...idx]
          .sort((a, b) => a - b)
          .map((i) => ({
            label: readI18n(fd, `${f.name}.${i}.label`),
            value: readI18n(fd, `${f.name}.${i}.value`),
          }))
          // drop rows left completely empty
          .filter((row) => Object.values(row.label).some(Boolean) || Object.values(row.value).some(Boolean));
        break;
      }
      default:
        v = str(fd.get(f.name));
    }

    // Required check: for i18n at least English must be filled.
    if (f.required) {
      const empty =
        v == null ||
        v === "" ||
        (Array.isArray(v) && v.length === 0) ||
        (typeof v === "object" && !Array.isArray(v) && !v.en);
      if (empty) errors[f.name] = "Required";
    }

    values[f.name] = v;
  }

  return { values, errors };
}
