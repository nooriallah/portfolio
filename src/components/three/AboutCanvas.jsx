"use client";
/**
 * src/components/three/AboutCanvas.jsx — the About section's 3D scene wrapper
 * (character with laptop). Loaded client-side only via next/dynamic.
 */
import { Component, Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import useDeviceTier from "../../hooks/useDeviceTier.js";
import { useTheme } from "../ThemeProvider.jsx";

const LaptopStage = dynamic(() => import("./LaptopStage.jsx"), { ssr: false });

class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    if (process.env.NODE_ENV !== "production") console.warn("[about] 3D scene disabled:", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * The About visual: the character presenting a laptop, skills floating
 * around him. `fallback` (the original photo) renders instead on
 * reduced-motion, low-power, and no-WebGL visitors — and while loading.
 */
export default function AboutCanvas({ fallback = null }) {
  const { theme } = useTheme();
  const { enabled, tier, ready } = useDeviceTier();
  const wrap = useRef(null);
  const [visible, setVisible] = useState(true);
  const [awake, setAwake] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "160px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setAwake(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (ready && !enabled) return fallback;

  return (
    /* Explicit width, not w-full: this sits in a shrink-to-fit flex item,
       where a percentage width collapses and the canvas falls back to its
       intrinsic 300x150 — a tiny scene in a strip. The photo it replaced
       had an intrinsic size; the canvas must be given one. */
    <div
      ref={wrap}
      className="w-80 md:w-96"
      style={{ aspectRatio: "4 / 5" }}
    >
      {ready && enabled ? (
        <SceneBoundary fallback={fallback}>
          <Suspense fallback={null}>
            <LaptopStage theme={theme} tier={tier} active={visible && awake} />
          </Suspense>
        </SceneBoundary>
      ) : null}
    </div>
  );
}
