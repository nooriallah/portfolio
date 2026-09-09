"use client";
import { useEffect, useRef } from "react";
import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * Real 3D tilt on a hoverable surface.
 *
 * The outer node owns the perspective, the inner node owns the rotation and
 * `transform-style: preserve-3d`, so children can be pushed forward with
 * `translateZ()` and will genuinely sit in front of the card instead of just
 * looking brighter.
 *
 * Skipped entirely for touch pointers and for reduced-motion visitors, and it
 * never blocks clicks or focus. The animation frame stops itself as soon as
 * the surface has settled, so an idle card costs nothing.
 */
export default function Tilt({
  children,
  className = "",
  innerClassName = "",
  max = 7,
  scale = 1.015,
  lift = 6,
  perspective = 1100,
  sheen = false,
  ...rest
}) {
  const outer = useRef(null);
  const inner = useRef(null);
  const frame = useRef(0);
  const state = useRef({ rx: 0, ry: 0, txRx: 0, txRy: 0, k: 0, txK: 0 });
  const reduced = useReducedMotion();

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    },
    [],
  );

  if (reduced) {
    return (
      <div className={className} {...rest}>
        {children}
      </div>
    );
  }

  function loop() {
    const s = state.current;
    const el = inner.current;
    if (!el) {
      frame.current = 0;
      return;
    }

    s.rx += (s.txRx - s.rx) * 0.12;
    s.ry += (s.txRy - s.ry) * 0.12;
    s.k += (s.txK - s.k) * 0.12;

    const sc = 1 + (scale - 1) * s.k;
    el.style.transform =
      `rotateX(${s.rx.toFixed(3)}deg) rotateY(${s.ry.toFixed(3)}deg) ` +
      `translateZ(${(lift * s.k).toFixed(2)}px) scale(${sc.toFixed(4)})`;

    const settled =
      Math.abs(s.txRx - s.rx) < 0.01 &&
      Math.abs(s.txRy - s.ry) < 0.01 &&
      Math.abs(s.txK - s.k) < 0.002;

    if (settled) {
      frame.current = 0;
      if (s.txK === 0) el.style.transform = "";
      return;
    }
    frame.current = requestAnimationFrame(loop);
  }

  function start() {
    if (!frame.current) frame.current = requestAnimationFrame(loop);
  }

  function onPointerMove(e) {
    if (e.pointerType !== "mouse") return;
    const el = outer.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;

    const s = state.current;
    s.txRy = (px - 0.5) * 2 * max;
    s.txRx = -(py - 0.5) * 2 * max;
    s.txK = 1;

    if (sheen) {
      el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    }
    start();
  }

  function reset() {
    const s = state.current;
    s.txRx = 0;
    s.txRy = 0;
    s.txK = 0;
    start();
  }

  return (
    <div
      ref={outer}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
      onBlur={reset}
      style={{ perspective: `${perspective}px` }}
      className={className}
      {...rest}
    >
      <div
        ref={inner}
        className={`[transform-style:preserve-3d] will-change-transform ${sheen ? "relative" : ""} ${innerClassName}`}
      >
        {children}
        {sheen && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), color-mix(in oklab, var(--accent) 22%, transparent), transparent 60%)",
            }}
          />
        )}
      </div>
    </div>
  );
}
