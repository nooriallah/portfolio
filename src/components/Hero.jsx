"use client";
/**
 * src/components/Hero.jsx — HERO SECTION (first screen).
 *
 * Left column: greeting, name (word-by-word reveal), rotating role, tagline,
 * CTA buttons (Download CV / View Work), highlighted tech chips, social links.
 * Right column: the 3D desk scene (HeroCanvas) — or the portrait when
 * SHOW_PORTRAIT is true.
 *
 * Texts: /admin → Hero (t.hero). CV + portrait: /admin → Site (t.site).
 * Socials: /admin → Social links (t.socials).
 */
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import Reveal from "./ui/Reveal.jsx";
import Tilt from "./ui/Tilt.jsx";
import SplitText from "./ui/SplitText.jsx";
import HeroCanvas from "./three/HeroCanvas.jsx";
import useParallax from "@/hooks/useParallax.js";
import { scrollToId } from "@/utils/scroll.js";
import { useLang } from "./i18n/LanguageProvider.jsx";
import { brandIcon } from "@/lib/cms/icons.js";

/**
 * The 3D desk scene occupies the hero's second column, so the portrait moved
 * out (About still has one). Flip this to true to put the photo back.
 */
const SHOW_PORTRAIT = false;

export default function Hero() {
  const { t } = useLang();
  const roles = t.hero.roles?.length ? t.hero.roles : [""];
  const highlights = t.hero.highlights ?? [];
  const [role, setRole] = useState(0);
  const portrait = useParallax(0.1);

  // Rotate the role word every 2.2 s.
  useEffect(() => {
    const timer = setInterval(
      () => setRole((r) => (r + 1) % roles.length),
      2200,
    );
    return () => clearInterval(timer);
  }, [roles.length]);

  const [pre, post] = (t.hero.intro || "{role}").split("{role}");

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center px-6 pt-24 pb-20 overflow-hidden"
    >
      <HeroCanvas />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10 w-full">
        <div>
          <Reveal>
            <p className="text-accent font-medium mb-3">{t.hero.greeting}</p>
          </Reveal>
          <SplitText
            as="h1"
            text={t.hero.name}
            delay={90}
            step={70}
            threshold={0}
            className="text-4xl md:text-6xl font-extrabold text-heading leading-[1.05] tracking-tight"
          />
          <Reveal delay={200}>
            <p className="mt-4 text-xl md:text-2xl font-medium text-body">
              {pre}
              <span
                key={role}
                className="role-swap bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent"
              >
                {roles[role % roles.length]}
              </span>
              {post}
            </p>
          </Reveal>
          <Reveal delay={300}>
            <p className="mt-5 max-w-md text-muted leading-relaxed">
              {t.hero.tagline}
            </p>
          </Reveal>

          {/* CTA buttons */}
          <Reveal delay={400}>
            <div className="mt-8 flex flex-wrap gap-3">
              {t.site.cvUrl && (
                <a
                  href={t.site.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={t.site.cvFileName || undefined}
                  className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-white rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 hover:shadow-blue-600/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-all"
                >
                  <Download size={18} /> {t.ui.downloadCv}
                </a>
              )}
              <button
                onClick={() => scrollToId("work")}
                className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-heading rounded-lg border border-line bg-bg/40 backdrop-blur-sm hover:bg-chip hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-all"
              >
                {t.ui.viewWork}
              </button>
            </div>
          </Reveal>

          {/* Highlighted technologies (chips) — /admin → Hero → Highlights */}
          {highlights.length > 0 && (
            <Reveal delay={470}>
              <div className="mt-7 flex flex-wrap items-center gap-2">
                {highlights.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-line bg-card/60 backdrop-blur-md text-body"
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
                    {tech}
                  </span>
                ))}
              </div>
            </Reveal>
          )}

          {/* Social links */}
          <Reveal delay={540}>
            <div className="mt-7 flex gap-3">
              {t.socials.map((s) => {
                const Icon = brandIcon(s.icon);
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.name}
                    className="grid place-items-center w-10 h-10 rounded-lg border border-line bg-bg/40 backdrop-blur-sm text-muted hover:text-heading hover:border-accent hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-all"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </Reveal>
        </div>

        {/* Second column: either the portrait, or space held for the 3D set
            so the copy never collides with it. */}
        {SHOW_PORTRAIT && t.site.heroImage ? (
          <div ref={portrait} className="flex justify-center">
            <Reveal delay={300} from="scale">
              <Tilt
                className="relative"
                max={9}
                scale={1.02}
                lift={16}
                perspective={1200}
              >
                <div className="relative [transform-style:preserve-3d]">
                  <div
                    className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 blur-2xl"
                    style={{ transform: "translateZ(-60px)" }}
                  />
                  <div
                    className="absolute inset-0 rounded-3xl border border-accent/35"
                    style={{ transform: "translateZ(-24px) scale(1.07)" }}
                  />
                  <img
                    src={t.site.heroImage}
                    alt={t.hero.name}
                    className="relative w-72 md:w-80 rounded-3xl border border-line object-cover shadow-2xl shadow-black/20"
                  />
                </div>
              </Tilt>
            </Reveal>
          </div>
        ) : (
          <>
            <div aria-hidden="true" className="hidden md:block min-h-[28rem]" />
            <div aria-hidden="true" className="md:hidden h-[19rem]" />
          </>
        )}
      </div>

      {/* Scroll cue */}
      <button
        onClick={() => scrollToId("about")}
        aria-label="Scroll to next section"
        className="scroll-cue absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:grid place-items-center w-6 h-10 rounded-full border border-line text-faint hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-colors"
      >
        <span className="scroll-cue-dot block w-1 h-1 rounded-full bg-accent" />
      </button>
    </section>
  );
}
