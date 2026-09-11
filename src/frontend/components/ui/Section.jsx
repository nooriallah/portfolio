"use client";
import Reveal from "./Reveal.jsx";
import SplitText from "./SplitText.jsx";
import SectionDepth from "./SectionDepth.jsx";

export default function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
  depth = true,
  aura = "right",
}) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-20 overflow-hidden py-20 px-6 ${className}`}
    >
      {depth && <SectionDepth aura={aura} />}

      <div className="relative z-10 max-w-6xl mx-auto">
        {eyebrow && (
          <Reveal from="right">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-8 bg-accent" />
              <span className="text-accent text-sm font-semibold tracking-widest uppercase">
                {eyebrow}
              </span>
            </div>
          </Reveal>
        )}
        {title && (
          <SplitText
            as="h2"
            text={title}
            className="text-3xl md:text-4xl font-bold text-heading tracking-tight mb-12"
          />
        )}
        {children}
      </div>
    </section>
  );
}
