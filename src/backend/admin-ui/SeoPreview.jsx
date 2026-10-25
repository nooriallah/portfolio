"use client";
/**
 * src/backend/admin-ui/SeoPreview.jsx — LIVE PREVIEW ON THE "SEO & SHARING" PAGE.
 *
 * Shows, above the form and updating as you type:
 *   1. GOOGLE RESULT  — roughly how the page looks in search results.
 *   2. SHARE CARD     — how the link looks pasted into WhatsApp, LinkedIn,
 *                       Facebook, Telegram or X.
 * Plus a length meter for the title and description, because Google cuts
 * them off at roughly 60 and 155 characters.
 *
 * HOW IT STAYS LIVE
 * The admin form inputs are uncontrolled (they use defaultValue), so instead
 * of tracking every field this component listens for any `input` event on the
 * surrounding <form> and re-reads it with FormData. That means it keeps
 * working automatically if fields are added or renamed in
 * src/backend/cms/schema.js — nothing here needs to change.
 *
 * WHAT TO CHANGE WHERE
 *   • the ideal lengths .......... TITLE_MAX / DESC_MAX just below
 *   • which language is previewed  the language buttons (PREVIEW_LANGS)
 *   • the card colours ........... the Tailwind classes in the markup
 */
import { useEffect, useRef, useState } from "react";
import { Search, Share2 } from "lucide-react";
import { LANGUAGES, DEFAULT_LANG } from "@shared/config.js";

// Google usually shows about this much before adding "…".
const TITLE_MAX = 60;
const DESC_MAX = 155;

/** Read the current form values straight from the DOM. */
function readForm(form, lang) {
  if (!form) return {};
  const fd = new FormData(form);
  const get = (name) => (fd.get(name) ?? "").toString().trim();
  // i18n fields are stored as "<name>.<lang>" inputs; fall back to English.
  const getLang = (name) => get(`${name}.${lang}`) || get(`${name}.en`);
  return {
    title: getLang("metaTitle"),
    description: getLang("metaDescription"),
    imageAlt: getLang("ogImageAlt"),
    image: get("ogImage"),
    siteName: get("siteName"),
    siteUrl: get("siteUrl"),
    keywords: get("keywords"),
    noindex: fd.get("noindex") === "on",
  };
}

/** Small coloured counter: green in range, amber close, red over the limit. */
function Meter({ value, max, label }) {
  const n = value.length;
  const tone =
    n === 0
      ? "text-faint"
      : n > max
        ? "text-red-500"
        : n > max * 0.9
          ? "text-[var(--adm-amber)]"
          : "text-emerald-600";
  return (
    <span className={`text-[11px] tabular-nums ${tone}`}>
      {label}: {n}/{max}
      {n > max ? " — will be cut off" : ""}
    </span>
  );
}

export default function SeoPreview({ formRef, fallback = {} }) {
  const [lang, setLang] = useState(DEFAULT_LANG);
  const [v, setV] = useState({});
  // Set when the share image URL cannot be loaded (typo, deleted file, host
  // unreachable) so we show a warning instead of a broken-image icon.
  const [imageBroken, setImageBroken] = useState(false);
  const frame = useRef(null);

  /* Re-read the form on every keystroke (throttled to one animation frame)
     and once on mount so the preview is correct before anything is typed. */
  useEffect(() => {
    const form = formRef?.current;
    if (!form) return;

    const update = () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => setV(readForm(form, lang)));
    };

    update();
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    return () => {
      form.removeEventListener("input", update);
      form.removeEventListener("change", update);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [formRef, lang]);

  // Empty fields fall back exactly the way the real page does.
  const title = v.title || fallback.title || "Your page title";
  const description =
    v.description || fallback.description || "Your description — this is the grey text in Google.";
  const image = v.image || fallback.image || "";
  // A new URL deserves a fresh attempt at loading it. (Adjusting state while
  // rendering is the pattern React recommends over doing this in an effect.)
  const [lastImage, setLastImage] = useState(image);
  if (image !== lastImage) {
    setLastImage(image);
    setImageBroken(false);
  }
  const siteName = v.siteName || fallback.siteName || "";
  const host = (() => {
    try {
      return new URL(v.siteUrl || fallback.siteUrl || "https://example.com").host;
    } catch {
      return v.siteUrl || "example.com";
    }
  })();

  const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

  return (
    <div className="mb-8 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      {/* header + language picker */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-semibold text-heading">Live preview</h2>
          <p className="text-xs text-faint">
            Updates as you type. Nothing is saved until you press Save changes.
          </p>
        </div>
        <div className="flex items-center gap-1">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className={`px-2.5 py-1 text-xs rounded-md border transition ${
                lang === l.code
                  ? "border-[var(--adm-amber)] bg-[var(--adm-amber)]/15 text-heading font-semibold"
                  : "border-line text-muted hover:text-heading"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {v.noindex && (
        <p className="mb-4 text-xs rounded-lg border border-red-300 bg-red-50 text-red-700 px-3 py-2 dark:bg-red-950/30">
          “Hide from search engines” is ticked — Google will be told not to list this
          site at all. Untick it when the site is ready.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ---------------- 1. Google result ---------------- */}
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
            <Search size={12} /> Google result
          </p>
          <div className="rounded-xl border border-line bg-card p-3" dir="auto">
            <p className="text-[11px] text-muted truncate">{host}</p>
            <p className="text-[#1a0dab] dark:text-[#8ab4f8] text-base leading-snug truncate">
              {cut(title, TITLE_MAX)}
            </p>
            <p className="text-xs text-muted leading-relaxed mt-0.5">
              {cut(description, DESC_MAX)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            <Meter value={title} max={TITLE_MAX} label="Title" />
            <Meter value={description} max={DESC_MAX} label="Description" />
          </div>
        </div>

        {/* ---------------- 2. Share card ---------------- */}
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
            <Share2 size={12} /> WhatsApp · LinkedIn · Facebook · X
          </p>
          <div className="rounded-xl border border-line bg-card overflow-hidden" dir="auto">
            {/* 1200×630 is 1.91:1 — the shape every platform crops to */}
            <div className="aspect-[1.91/1] bg-chip grid place-items-center overflow-hidden">
              {image && !imageBroken ? (
                <img
                  src={image}
                  alt={v.imageAlt || ""}
                  onError={() => setImageBroken(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-faint px-4 text-center">
                  {imageBroken
                    ? "That image address could not be loaded — check the URL"
                    : "No share image — add one for a much bigger preview"}
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-faint truncate">
                {siteName || host}
              </p>
              <p className="text-sm font-semibold text-heading leading-snug line-clamp-2">
                {title}
              </p>
              <p className="text-xs text-muted leading-snug line-clamp-2 mt-0.5">
                {description}
              </p>
            </div>
          </div>
          {(!image || imageBroken) && (
            <p className="text-[11px] text-faint mt-2">
              Tip: a 1200 × 630 image makes the link show as a large card instead of a
              small thumbnail.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
