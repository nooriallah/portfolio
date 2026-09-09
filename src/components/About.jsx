"use client";
/**
 * src/components/About.jsx — ABOUT SECTION.
 *
 * Left: the 3D character-with-laptop scene (AboutCanvas); the photo from
 * /admin → Site → "About photo" is the fallback for reduced-motion, low-power
 * and no-WebGL visitors.
 * Right: heading, paragraph and the quick-facts grid.
 *
 * Texts: /admin → About (t.about). Section title: /admin → Section titles.
 */
import Section from "./ui/Section.jsx";
import Reveal from "./ui/Reveal.jsx";
import Tilt from "./ui/Tilt.jsx";
import Stagger from "./ui/Stagger.jsx";
import AboutCanvas from "./three/AboutCanvas.jsx";
import useParallax from "@/hooks/useParallax.js";
import { useLang } from "./i18n/LanguageProvider.jsx";

export default function About() {
  const { t } = useLang();
  // The two columns drift in opposite directions, which is what separates
  // them in depth as you scroll past.
  const media = useParallax(0.17);
  const copy = useParallax(-0.07);
  const facts = t.about.facts ?? [];

  return (
    <Section
      id="about"
      eyebrow={t.sections.aboutEyebrow}
      title={t.sections.aboutTitle}
      aura="right"
    >
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div ref={media} className="flex justify-center">
          <Reveal from="scale">
            {/* The 3D presenting scene; the photo remains the fallback. */}
            <AboutCanvas
              fallback={
                t.site.aboutImage ? (
                  <Tilt max={7} scale={1.02} lift={12} perspective={1200}>
                    <div className="relative [transform-style:preserve-3d]">
                      <div
                        className="absolute inset-0 rounded-2xl border border-accent/30"
                        style={{ transform: "translateZ(-22px) scale(1.06)" }}
                      />
                      <img
                        src={t.site.aboutImage}
                        alt=""
                        className="relative rounded-2xl border border-line w-full max-w-sm object-cover shadow-xl shadow-black/10"
                      />
                    </div>
                  </Tilt>
                ) : null
              }
            />
          </Reveal>
        </div>

        <div ref={copy}>
          <Reveal delay={100}>
            <h3 className="text-2xl font-bold text-heading mb-4">
              {t.about.heading}
            </h3>
            <p className="text-muted leading-relaxed mb-6">{t.about.text}</p>
          </Reveal>
          {/* Quick facts — /admin → About → Quick facts */}
          <Stagger
            step={70}
            start={120}
            className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm"
          >
            {facts.map((f, i) => (
              <div key={i}>
                <span className="text-faint">{f.label}</span>
                <p className="text-heading font-medium break-words">{f.value}</p>
              </div>
            ))}
          </Stagger>
        </div>
      </div>
    </Section>
  );
}
