"use client";
import useParallax, { useDrift } from "../../hooks/useParallax.js";

/**
 * The moving backdrop every section sits on: a faint dot plane drifting
 * against the scroll, and a single soft accent aura drifting with it at a
 * different rate. Two composited transforms, no repaints, and the parallax
 * between the two layers is what gives a flat section depth.
 */
export default function SectionDepth({ aura = "right" }) {
  // The dot plane drifts endlessly (it is a seamless 34px tile, so it can),
  // which keeps even a very tall section moving the whole way down.
  const dots = useDrift(0.3, 34);
  const glow = useParallax(-0.32);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      <div
        ref={dots}
        className="absolute inset-x-0 -top-28 -bottom-28 opacity-70 dark:opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--accent) 26%, transparent) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage:
            "radial-gradient(120% 70% at 50% 45%, black 0%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(120% 70% at 50% 45%, black 0%, transparent 78%)",
        }}
      />
      <div
        ref={glow}
        className={`absolute top-[calc(50%-14rem)] h-[28rem] w-[28rem] rounded-full blur-3xl opacity-[0.13] dark:opacity-[0.20] ${
          aura === "right" ? "-end-40" : "-start-40"
        }`}
        style={{
          background: "radial-gradient(circle, var(--accent), transparent 70%)",
        }}
      />
    </div>
  );
}
