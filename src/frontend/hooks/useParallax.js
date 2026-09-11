import { useEffect, useRef } from "react";
import { register } from "./scrollDriver.js";
import useReducedMotion from "./useReducedMotion.js";

/**
 * Moves an element against the scroll. Transform-only, and it shares the one
 * page-wide animation frame in scrollDriver.
 *
 * @param {number} speed Fraction of a viewport height travelled across the
 *   element's full pass through the viewport. Positive drifts against the
 *   scroll (the layer feels further away); negative drifts with it.
 */
export default function useParallax(speed = 0.08) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.style.transform = "";
      return;
    }

    return register({ kind: "parallax", el, speed, applied: 0 });
  }, [speed, reduced]);

  return ref;
}

/**
 * Endless drift for a *repeating* background pattern. The offset wraps at the
 * tile size, so the layer never runs out of travel however tall the section
 * is — the trade-off is that it only looks right on a seamless pattern.
 *
 * @param {number} speed  Fraction of the scroll distance the layer travels.
 * @param {number} period Tile size in px; the offset wraps here.
 */
export function useDrift(speed = 0.28, period = 34) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.style.transform = "";
      return;
    }

    return register({ kind: "drift", el, speed, period, applied: 0 });
  }, [speed, period, reduced]);

  return ref;
}
