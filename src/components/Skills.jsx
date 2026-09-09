"use client";
/**
 * src/components/Skills.jsx — SKILLS grid: one tilting card per group, each
 * technology chip landing on its own beat.
 * Groups + chips: /admin → Skills. Icon names → components: lib/cms/icons.js.
 */
import Section from "./ui/Section.jsx";
import Reveal from "./ui/Reveal.jsx";
import Tilt from "./ui/Tilt.jsx";
import Stagger from "./ui/Stagger.jsx";
import { lucideIcon } from "@/lib/cms/icons.js";
import { useLang } from "./i18n/LanguageProvider.jsx";

export default function Skills() {
  const { t } = useLang();

  return (
    <Section
      id="skills"
      eyebrow={t.sections.skillsEyebrow}
      title={t.sections.skillsTitle}
      className="bg-section"
      aura="left"
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {t.skills.map((s, i) => {
          const Icon = lucideIcon(s.icon);
          return (
            <Reveal key={s.id} delay={i * 90} from="tilt">
              <Tilt
                className="group h-full"
                innerClassName="h-full"
                max={5}
                scale={1.015}
                lift={8}
                perspective={1000}
                sheen
              >
                <div className="h-full p-6 rounded-2xl border border-line bg-surface overflow-hidden [transform-style:preserve-3d] group-hover:border-accent/40 transition-colors">
                  <div
                    className="flex items-center gap-3 mb-4"
                    style={{ transform: "translateZ(22px)" }}
                  >
                    <span className="grid place-items-center w-10 h-10 rounded-lg bg-accent/10 text-accent">
                      <Icon size={20} />
                    </span>
                    <h3 className="font-bold text-heading">{s.label}</h3>
                  </div>

                  {/* each technology lands on its own beat */}
                  <Stagger
                    step={45}
                    start={120}
                    className="flex flex-wrap gap-2"
                    style={{ transform: "translateZ(10px)" }}
                  >
                    {(s.items ?? []).map((it) => (
                      <span
                        key={it}
                        className="text-sm px-3 py-1 rounded-lg bg-chip text-body border border-line-soft"
                      >
                        {it}
                      </span>
                    ))}
                  </Stagger>
                </div>
              </Tilt>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
