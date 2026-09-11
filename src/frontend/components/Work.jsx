"use client";
/**
 * src/frontend/components/Work.jsx — SELECTED WORK (project grid with pagination).
 *
 * Each card: numbered badge, screenshot, hover overlay with the title,
 * category / technologies and "Visit website" when a live URL exists.
 * Projects: /admin → Projects (t.projects, only published ones).
 * Per-page count + texts: /admin → Section titles (workPerPage, workVisit, workNote).
 */
import { useState } from "react";
import Section from "./ui/Section.jsx";
import Reveal from "./ui/Reveal.jsx";
import Tilt from "./ui/Tilt.jsx";
import Pagination from "./ui/Pagination.jsx";
import { scrollToId } from "@frontend/utils/scroll.js";
import { useLang } from "@frontend/i18n/LanguageProvider.jsx";

export default function Work() {
  const { t } = useLang();
  const projects = t.projects ?? [];
  const perPage = Number(t.sections.workPerPage) > 0 ? Number(t.sections.workPerPage) : 9;
  const [page, setPage] = useState(0);

  const pages = Math.max(1, Math.ceil(projects.length / perPage));
  // Clamped rather than stored raw, so the section cannot land on an empty
  // page if the project list ever shrinks.
  const current = Math.min(page, pages - 1);
  const start = current * perPage;
  const visible = projects.slice(start, start + perPage);

  const goTo = (next) => {
    setPage(next);
    // Three rows tall: without this you land halfway down the new page.
    scrollToId("work");
  };

  return (
    <Section
      id="work"
      eyebrow={t.sections.workEyebrow}
      title={t.sections.workTitle}
      className="bg-section"
      aura="left"
    >
      {/* Keyed by page so the cards remount and play their entrance again —
          a page turn that swaps content silently reads as broken. */}
      <div key={current} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((p, i) => {
          // Numbering follows the full list, not the page, so a project keeps
          // the same number wherever it appears.
          const number = start + i + 1;
          // Small line under the title: technologies if set, else the category.
          const meta = p.tech?.length ? p.tech.join(" · ") : p.category;

          const card = (
            <Tilt
              className="h-full"
              innerClassName="h-full"
              max={6}
              scale={1.02}
              lift={10}
              perspective={900}
            >
              <div className="relative h-full overflow-hidden rounded-2xl border border-line bg-surface [transform-style:preserve-3d] group-hover:border-accent/50 group-focus-visible:border-accent transition-colors">
                {/* number badge */}
                <span
                  className="absolute top-3 start-3 z-20 text-xs font-bold px-2.5 py-1 rounded-full bg-accent text-white shadow-lg"
                  style={{ transform: "translateZ(38px)" }}
                >
                  {number}
                </span>

                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />

                {/* hover overlay */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 p-4 text-center bg-accent/85 backdrop-blur-[2px] opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:scale-100 transition-all duration-500 ease-out">
                  <div style={{ transform: "translateZ(26px)" }}>
                    <h3 className="text-lg font-bold text-white">{p.title}</h3>
                    {p.description && (
                      <p className="mt-1 text-sm text-white/90 line-clamp-3">
                        {p.description}
                      </p>
                    )}
                    {meta && (
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-white/80">
                        {meta}
                      </p>
                    )}
                    {p.url && (
                      <span className="mt-2 block text-sm text-white/90 underline underline-offset-4">
                        {t.sections.workVisit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Tilt>
          );

          return (
            <Reveal key={p.id} delay={(i % 3) * 110} from="tilt">
              {p.url ? (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {card}
                </a>
              ) : (
                <div className="group h-full">{card}</div>
              )}
            </Reveal>
          );
        })}
      </div>

      <Pagination
        className="mt-12"
        page={current}
        pages={pages}
        onChange={goTo}
        label={t.sections.workTitle}
        range={[start + 1, start + visible.length, projects.length]}
      />

      {t.sections.workNote && (
        <p className="mt-8 text-center text-sm text-faint">{t.sections.workNote}</p>
      )}
    </Section>
  );
}
