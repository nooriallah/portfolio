import { useState, useEffect } from "react";

/**
 * Decides whether this device should get the WebGL hero at all, and at what
 * quality. Cheap, synchronous heuristics only — no benchmarking, no jank.
 *
 * Returns { enabled, tier } where tier is "high" | "low".
 */
function probe() {
  if (typeof window === "undefined") return { enabled: false, tier: "low" };

  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return { enabled: false, tier: "low" };
    }

    const nav = navigator;

    // Respect an explicit "save data" preference and very slow connections.
    const conn = nav.connection;
    if (conn?.saveData) return { enabled: false, tier: "low" };
    if (conn?.effectiveType && /^(slow-)?2g$/.test(conn.effectiveType)) {
      return { enabled: false, tier: "low" };
    }

    const cores = nav.hardwareConcurrency || 4;
    const memory = nav.deviceMemory; // Chromium only
    // Only a genuinely single-core machine is ruled out; the scene is
    // GPU-bound with a handful of draw calls, so 2 cores cope on low tier.
    if (cores < 2) return { enabled: false, tier: "low" };
    if (typeof memory === "number" && memory <= 2) {
      return { enabled: false, tier: "low" };
    }

    // No WebGL, no scene.
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!gl) return { enabled: false, tier: "low" };
    gl.getExtension("WEBGL_lose_context")?.loseContext();

    const smallViewport = window.innerWidth < 900;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const modest =
      cores <= 4 || (typeof memory === "number" && memory <= 4) || coarse;

    return { enabled: true, tier: smallViewport || modest ? "low" : "high" };
  } catch {
    return { enabled: false, tier: "low" };
  }
}

export default function useDeviceTier() {
  const [result, setResult] = useState(() => ({
    enabled: false,
    tier: "low",
    ready: false,
  }));

  useEffect(() => {
    const decide = () => setResult({ ...probe(), ready: true });

    // Defer past first paint so the hero text is never held up by this.
    const idle = window.requestIdleCallback;
    const handle = idle
      ? idle(decide, { timeout: 1200 })
      : setTimeout(decide, 350);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", decide);

    return () => {
      if (idle) window.cancelIdleCallback?.(handle);
      else clearTimeout(handle);
      mq.removeEventListener("change", decide);
    };
  }, []);

  return result;
}
