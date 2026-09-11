"use client";
/**
 * src/frontend/components/Experience.jsx — EXPERIENCE & EDUCATION timelines.
 * Two columns; the accent line is drawn by the scroll itself.
 * Entries: /admin → Experience & Education (kind = work | education).
 * Column headings: /admin → Section titles.
 */
import Section from "./ui/Section.jsx";
import Reveal from "./ui/Reveal.jsx";
import useScrollProgress from "@frontend/hooks/useScrollProgress.js";
import { useLang } from "@frontend/i18n/LanguageProvider.jsx";

/**
 * A timeline whose accent line is drawn by the scroll itself: the column
 * publishes its own 0 → 1 progress as `--p`, and the line is simply
 * `scaleY(var(--p))`. The motion has a job — it tells you how far through the
 * history you are.
 */
function Timeline({ heading, list }) {
  const track = useScrollProgress();

  return (
    <div>
      <Reveal>
        <h3 className="text-xl font-bold text-heading mb-6">{heading}</h3>
      </Reveal>

      <div ref={track} className="relative ps-6">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 start-0 w-px bg-line"
        />
        <span
          aria-hidden="true"
          className="absolute inset-y-0 start-0 w-px bg-accent"
          style={{ transform: "scaleY(var(--p, 0))", transformOrigin: "top" }}
        />

        <div className="space-y-8">
          {list.map((item, i) => (
            <Reveal key={item.id ?? i} delay={i * 110}>
              <div className="relative">
                <span
                  className="absolute -start-[27px] top-1 w-3 h-3 rounded-full bg-accent ring-4 ring-accent/20"
                  style={{
                    opacity: "calc(0.35 + var(--p, 0))",
                  }}
                />
                <span className="text-xs font-semibold text-accent">
                  {item.year}
                </span>
                <h4 className="text-heading font-bold mt-1">{item.title}</h4>
                <p className="text-sm text-faint">{item.place}</p>
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Experience() {
  const { t } = useLang();
  const columns = [
    [t.sections.experienceHeading, t.experience],
    [t.sections.educationHeading, t.education],
  ];

  return (
    <Section
      id="experience"
      eyebrow={t.sections.experienceEyebrow}
      title={t.sections.experienceTitle}
      aura="left"
    >
      <div className="grid md:grid-cols-2 gap-12">
        {columns.map(([heading, list], i) => (
          <Timeline key={i} heading={heading} list={list ?? []} />
        ))}
      </div>
    </Section>
  );
}
