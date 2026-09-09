"use client";
import { useState, useEffect, useRef } from "react";
import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * Reveals its children once, when they first scroll into view.
 * With reduced motion the content is simply present — no travel, no delay.
 *
 * The hidden transform is an inline style rather than utility classes so the
 * variants can compose translation, scale and rotation freely.
 */
const HIDDEN = {
  up: "translate3d(0, 32px, 0)",
  down: "translate3d(0, -32px, 0)",
  left: "translate3d(-32px, 0, 0)",
  right: "translate3d(32px, 0, 0)",
  scale: "scale(0.94)",
  // enters lying slightly back, then straightens up — reads as a card being
  // laid onto the page rather than sliding across it
  tilt: "perspective(900px) translate3d(0, 34px, 0) rotateX(9deg)",
};

export default function Reveal({
  children,
  delay = 0,
  className = "",
  from = "up",
  threshold = 0.15,
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    // The reduced-motion branch renders the content directly, so there is
    // nothing to observe and nothing to set.
    if (reduced) return;

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.unobserve(el);
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, threshold]);

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        transform: shown ? "none" : (HIDDEN[from] ?? HIDDEN.up),
        opacity: shown ? 1 : 0,
      }}
      className={`transition-all duration-700 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
