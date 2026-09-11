"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@frontend/i18n/LanguageProvider.jsx";

/**
 * Which page buttons to show: always the first and last, the current page and
 * its neighbours, with gaps marked. The control stays the same width whether
 * there are five pages or fifty.
 */
function pageWindow(current, total, span = 1) {
  const keep = new Set([0, total - 1]);
  for (let p = current - span; p <= current + span; p++) {
    if (p >= 0 && p < total) keep.add(p);
  }

  const out = [];
  let previous = null;
  for (const p of [...keep].sort((a, b) => a - b)) {
    if (previous !== null && p - previous > 1) out.push("gap");
    out.push(p);
    previous = p;
  }
  return out;
}

const BOX =
  "grid place-items-center h-10 min-w-10 px-3 rounded-lg border text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * @param page     zero-based current page
 * @param pages    total number of pages
 * @param onChange called with the next zero-based page
 * @param label    accessible name for the whole control
 * @param range    optional [firstShown, lastShown, total] counter, 1-based
 */
export default function Pagination({
  page,
  pages,
  onChange,
  label,
  range,
  className = "",
}) {
  const { t, dir } = useLang();
  if (pages <= 1) return null;

  // In RTL "back" points the other way, so the glyphs swap rather than the
  // meaning: the button on the reading-start side is always previous.
  const Back = dir === "rtl" ? ChevronRight : ChevronLeft;
  const Forward = dir === "rtl" ? ChevronLeft : ChevronRight;

  const step = (delta) => {
    const next = Math.min(pages - 1, Math.max(0, page + delta));
    if (next !== page) onChange(next);
  };

  return (
    <nav
      aria-label={label}
      className={`flex flex-col items-center gap-4 ${className}`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={page === 0}
          aria-label={t.ui.prevPage}
          className={`${BOX} border-line text-heading hover:border-accent hover:text-accent disabled:opacity-35 disabled:pointer-events-none`}
        >
          <Back size={18} />
        </button>

        {pageWindow(page, pages).map((p, i) =>
          p === "gap" ? (
            <span
              key={`gap-${i}`}
              aria-hidden="true"
              className="grid place-items-center h-10 w-6 text-faint"
            >
              &hellip;
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              aria-label={`${t.ui.page} ${p + 1}`}
              className={
                p === page
                  ? `${BOX} border-accent bg-accent text-white shadow-lg shadow-blue-600/20`
                  : `${BOX} border-line text-muted hover:border-accent hover:text-heading`
              }
            >
              {p + 1}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => step(1)}
          disabled={page === pages - 1}
          aria-label={t.ui.nextPage}
          className={`${BOX} border-line text-heading hover:border-accent hover:text-accent disabled:opacity-35 disabled:pointer-events-none`}
        >
          <Forward size={18} />
        </button>
      </div>

      {/* Numerals only, so it needs no translation. Pinned to LTR so the
          range never reads backwards in an RTL layout. */}
      {range && (
        <p dir="ltr" className="text-xs text-faint tabular-nums">
          {range[0]}–{range[1]} / {range[2]}
        </p>
      )}
    </nav>
  );
}
