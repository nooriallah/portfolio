import { useEffect, useRef } from "react";
import { register } from "./scrollDriver.js";
import useReducedMotion from "./useReducedMotion.js";

/**
 * Publishes an element's 0 → 1 progress through the viewport as a CSS custom
 * property on that element. Children can then drive any property from it
 * (`transform: scaleY(var(--p))`, `opacity: var(--p)`, …) with no JS per
 * property and no React re-render.
 */
export default function useScrollProgress(name = "--p") {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // With reduced motion the effect should read as already complete rather
    // than as missing, so pin it at the end of its travel.
    if (reduced) {
      el.style.setProperty(name, "1");
      return;
    }

    return register({ kind: "progress", el, name });
  }, [name, reduced]);

  return ref;
}

/** Whole-document scroll progress, published on <html>. */
export function usePageProgress(name = "--page-progress") {
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = document.documentElement;
    if (reduced) {
      el.style.setProperty(name, "0");
      return;
    }
    return register({ kind: "page", el, name });
  }, [name, reduced]);
}
