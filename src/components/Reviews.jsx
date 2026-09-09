"use client";
/**
 * src/components/Reviews.jsx — CLIENT TESTIMONIALS (three tilting cards).
 * Items: /admin → Reviews (only published ones are shown).
 */
import { Quote } from "lucide-react";
import Section from "./ui/Section.jsx";
import Reveal from "./ui/Reveal.jsx";
import Tilt from "./ui/Tilt.jsx";
import { useLang } from "./i18n/LanguageProvider.jsx";

export default function Reviews() {
  const { t } = useLang();

  return (
    <Section
      id="reviews"
      eyebrow={t.sections.reviewsEyebrow}
      title={t.sections.reviewsTitle}
      className="bg-section"
      aura="right"
    >
      <div className="grid md:grid-cols-3 gap-6">
        {t.reviews.map((r, i) => {
          return (
            <Reveal key={r.id} delay={i * 120} from="tilt">
              <Tilt
                className="group h-full"
                innerClassName="h-full"
                max={4}
                scale={1.012}
                lift={8}
                perspective={1100}
              >
                <div className="h-full p-6 rounded-2xl border border-line bg-surface flex flex-col [transform-style:preserve-3d] group-hover:border-accent/35 transition-colors">
                  <Quote
                    size={28}
                    className="text-accent/40 mb-3 transition-colors duration-300 group-hover:text-accent/70"
                    style={{ transform: "translateZ(20px)" }}
                  />
                  <p className="text-sm text-body leading-relaxed flex-1">
                    {r.text}
                  </p>
                  <div
                    className="flex items-center gap-3 mt-5 pt-5 border-t border-line-soft"
                    style={{ transform: "translateZ(14px)" }}
                  >
                    {r.image ? (
                      <img
                        src={r.image}
                        alt={r.name}
                        loading="lazy"
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <span className="grid place-items-center w-11 h-11 rounded-full bg-accent/10 text-accent font-bold">
                        {r.name?.[0]}
                      </span>
                    )}
                    <div>
                      <p className="text-heading font-semibold text-sm">
                        {r.name}
                      </p>
                      <p className="text-xs text-faint">{r.role}</p>
                    </div>
                  </div>
                </div>
              </Tilt>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
