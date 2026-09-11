"use client";
/**
 * src/frontend/components/three/HeroCanvas.jsx — the hero's 3D layer wrapper.
 * The heavy WebGL scene (HeroScene.jsx, three.js) is loaded with
 * next/dynamic + ssr:false, so it is never rendered on the server and only
 * downloaded on devices that pass useDeviceTier.
 */
import { Component, Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import useDeviceTier from "../../hooks/useDeviceTier.js";
import { useTheme } from "../ThemeProvider.jsx";
import { useLang } from "@frontend/i18n/LanguageProvider.jsx";

const HeroScene = dynamic(() => import("./HeroScene.jsx"), { ssr: false });

/**
 * If WebGL dies, the chunk fails to load, or three.js is missing, the hero
 * quietly falls back to the CSS ambience underneath. Never a blank screen.
 */
class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    if (process.env.NODE_ENV !== "production") console.warn("[hero] 3D scene disabled:", error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The hero's visual signature.
 *
 * Layer 1: CSS ambience — always present, costs nothing, and is the whole
 *          picture on reduced-motion / low-power / no-WebGL devices.
 * Layer 2: the WebGL scene — lazy, idle-mounted, paused whenever the hero is
 *          off screen or the tab is hidden.
 * Layer 3: a directional scrim so the headline always wins on contrast.
 */
export default function HeroCanvas() {
  const { theme } = useTheme();
  const { dir } = useLang();
  const { enabled, tier, ready } = useDeviceTier();
  const wrap = useRef(null);
  const [visible, setVisible] = useState(true);
  const [awake, setAwake] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setAwake(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const side = dir === "rtl" ? "left" : "right";

  return (
    <div ref={wrap} aria-hidden="true" className="absolute inset-0 -z-0">
      {/* Layer 1 — ambience */}
      <div className="absolute top-1/4 -start-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute bottom-0 end-0 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />

      {/* Layer 2 — WebGL */}
      {ready && enabled && (
        <div className="absolute inset-0">
          <SceneBoundary>
            <Suspense fallback={null}>
              <HeroScene
                theme={theme}
                tier={tier}
                active={visible && awake}
                flip={dir === "rtl"}
              />
            </Suspense>
          </SceneBoundary>
        </div>
      )}

      {/* Layer 3 — readability scrim */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background: `linear-gradient(to ${side}, var(--bg) 0%, color-mix(in oklab, var(--bg) 42%, transparent) 26%, transparent 58%)`,
        }}
      />
      <div
        className="absolute inset-0 md:hidden"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--bg) 80%, transparent) 0%, color-mix(in oklab, var(--bg) 30%, transparent) 45%, transparent 100%)",
        }}
      />
    </div>
  );
}
