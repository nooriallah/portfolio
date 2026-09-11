"use client";
/**
 * src/backend/admin-ui/Fields.jsx — FORM INPUTS FOR THE ADMIN PANEL.
 *
 * `<FieldInput field value error />` renders the right input for a field
 * definition from src/backend/cms/schema.js. Input NAMES follow the convention
 * that src/backend/cms/parse.js reads back (e.g. "title.en", "facts.0.label.fa").
 *
 * Field types handled here:
 *   text, textarea, url, number, boolean, select, tags,
 *   i18n, i18n-textarea, i18n-list, pairs, image (with Cloudinary upload)
 *
 * Styling: the `INPUT` constant below is the shared input look — change it
 * once to restyle every admin input.
 */
import { useState, useRef } from "react";
import { Upload, X, Plus, Trash2, Loader2 } from "lucide-react";
import { LANGUAGES } from "@shared/config.js";
import { LUCIDE_ICON_NAMES, BRAND_ICON_NAMES } from "@shared/icons/index.js";

export const INPUT =
  "w-full px-3 py-2 rounded-lg bg-bg border border-line text-heading text-sm placeholder-faint focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent outline-none transition";

const LABEL = "block text-xs font-semibold text-muted mb-1.5";

/** Small language badge shown next to each i18n input. */
function LangTag({ code }) {
  const l = LANGUAGES.find((x) => x.code === code);
  return (
    <span
      className="inline-grid place-items-center min-w-8 h-6 px-1.5 rounded-md bg-chip text-[11px] font-bold uppercase text-muted"
      title={l?.label}
    >
      {code}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Wrapper: label + error message
 * ------------------------------------------------------------------ */
export function Field({ label, error, hint, children }) {
  return (
    <div>
      {label && <label className={LABEL}>{label}</label>}
      {children}
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * i18n text — one input (or textarea) per language
 * ------------------------------------------------------------------ */
function I18nInput({ name, value = {}, multiline = false, rows = 3 }) {
  return (
    <div className="space-y-2">
      {LANGUAGES.map((l) => (
        <div key={l.code} className="flex items-start gap-2">
          <div className="pt-2">
            <LangTag code={l.code} />
          </div>
          {multiline ? (
            <textarea
              name={`${name}.${l.code}`}
              defaultValue={value?.[l.code] ?? ""}
              dir={l.dir}
              rows={rows}
              className={`${INPUT} resize-y`}
            />
          ) : (
            <input
              name={`${name}.${l.code}`}
              defaultValue={value?.[l.code] ?? ""}
              dir={l.dir}
              className={INPUT}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * i18n list — one textarea per language, one item per line
 * ------------------------------------------------------------------ */
function I18nListInput({ name, value = {} }) {
  return (
    <div className="space-y-2">
      {LANGUAGES.map((l) => (
        <div key={l.code} className="flex items-start gap-2">
          <div className="pt-2">
            <LangTag code={l.code} />
          </div>
          <textarea
            name={`${name}.${l.code}`}
            defaultValue={(value?.[l.code] ?? []).join("\n")}
            dir={l.dir}
            rows={4}
            placeholder="One item per line"
            className={`${INPUT} resize-y`}
          />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * pairs — rows of { label: i18n, value: i18n } with add / remove
 * ------------------------------------------------------------------ */
function PairsInput({ name, value = [] }) {
  // Rows keep a stable numeric id so removing one does not renumber inputs.
  const [rows, setRows] = useState(() =>
    (value.length ? value : [{ label: {}, value: {} }]).map((r, i) => ({ id: i, ...r })),
  );
  const nextId = useRef(rows.length);

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid gap-3 md:grid-cols-[1fr_1fr_auto] p-3 rounded-xl border border-line bg-surface"
        >
          <div>
            <span className={LABEL}>Label</span>
            <I18nInput name={`${name}.${row.id}.label`} value={row.label} />
          </div>
          <div>
            <span className={LABEL}>Value</span>
            <I18nInput name={`${name}.${row.id}.value`} value={row.value} />
          </div>
          <button
            type="button"
            onClick={() => setRows((rs) => rs.filter((r) => r.id !== row.id))}
            aria-label="Remove row"
            className="self-start mt-6 grid place-items-center w-9 h-9 rounded-lg border border-line text-muted hover:text-red-500 hover:border-red-400 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setRows((rs) => [...rs, { id: nextId.current++, label: {}, value: {} }])
        }
        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
      >
        <Plus size={16} /> Add row
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * image — preview + upload to Cloudinary (or paste any URL)
 * ------------------------------------------------------------------ */
export function ImageInput({ name, value = "" }) {
  const [url, setUrl] = useState(value || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  /* Send the chosen file to /api/upload and put the returned URL in the box.
     Any failure reason from the server is shown under the button in red, so
     you can see the real cause (bad Cloudinary key, file too big, …). */
  async function upload(file) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });

      // The route always answers with JSON — but if the session expired the
      // server may answer with an HTML login page instead, which would blow up
      // res.json(). Read it as text first and only then try to parse.
      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          res.status === 401 || /<!doctype html/i.test(raw)
            ? "Your admin session expired — reload the page, log in again and retry."
            : `Server answered with something unexpected (HTTP ${res.status}). Check the terminal running npm run dev.`,
        );
      }

      if (!res.ok) throw new Error(data.error || `Upload failed (HTTP ${res.status})`);
      if (!data.url) throw new Error("Upload succeeded but no image URL came back.");
      setUrl(data.url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* preview */}
      <div className="shrink-0 w-full sm:w-40 aspect-[4/3] rounded-lg border border-line bg-chip overflow-hidden grid place-items-center">
        {url ? (
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-faint">No image</span>
        )}
      </div>

      <div className="flex-1 space-y-2">
        {/* the actual value that gets saved */}
        <input
          name={name}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://… or /img/… — or upload below"
          className={INPUT}
        />
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-line bg-surface text-heading hover:border-accent cursor-pointer transition">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {busy ? "Uploading…" : "Upload image"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy}
              onChange={(e) => upload(e.target.files?.[0])}
            />
          </label>
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="inline-flex items-center gap-1 px-2 py-2 text-sm text-muted hover:text-red-500 transition"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * The dispatcher: one field definition → the right input
 * ------------------------------------------------------------------ */
export function FieldInput({ field, value, error }) {
  const f = field;
  let input;

  switch (f.type) {
    case "textarea":
      input = <textarea name={f.name} defaultValue={value ?? ""} rows={3} className={`${INPUT} resize-y`} />;
      break;
    case "number":
      input = <input name={f.name} type="number" defaultValue={value ?? ""} className={INPUT} />;
      break;
    case "boolean":
      input = (
        <label className="inline-flex items-center gap-2 text-sm text-heading">
          <input name={f.name} type="checkbox" defaultChecked={value !== false} className="w-4 h-4 accent-[var(--accent)]" />
          {f.label}
        </label>
      );
      return <Field error={error}>{input}</Field>;
    case "select": {
      const opts =
        f.options === "lucide"
          ? LUCIDE_ICON_NAMES.map((v) => ({ value: v, label: v }))
          : f.options === "brand"
            ? BRAND_ICON_NAMES.map((v) => ({ value: v, label: v }))
            : f.options;
      input = (
        <select name={f.name} defaultValue={value ?? opts[0]?.value} className={INPUT}>
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    }
    case "tags":
      input = (
        <textarea
          name={f.name}
          defaultValue={(value ?? []).join(", ")}
          rows={2}
          placeholder="Comma separated: React, Laravel, MySQL"
          className={`${INPUT} resize-y`}
        />
      );
      break;
    case "i18n":
      input = <I18nInput name={f.name} value={value} />;
      break;
    case "i18n-textarea":
      input = <I18nInput name={f.name} value={value} multiline />;
      break;
    case "i18n-list":
      input = <I18nListInput name={f.name} value={value} />;
      break;
    case "pairs":
      input = <PairsInput name={f.name} value={value} />;
      break;
    case "image":
      input = <ImageInput name={f.name} value={value} />;
      break;
    case "url":
      input = <input name={f.name} type="text" inputMode="url" defaultValue={value ?? ""} placeholder="https://" className={INPUT} />;
      break;
    default:
      input = <input name={f.name} defaultValue={value ?? ""} className={INPUT} />;
  }

  return (
    <Field label={f.label + (f.required ? " *" : "")} error={error}>
      {input}
    </Field>
  );
}
