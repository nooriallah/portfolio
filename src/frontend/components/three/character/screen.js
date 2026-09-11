import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/* eslint-disable react-hooks/immutability -- draw() is called from useFrame,
   never during render. The ref it advances is the texture's own animation
   cursor; the rule cannot tell an animation tick from a render-time mutation. */

/**
 * A monitor that looks like someone is working on it.
 *
 * The screen is a canvas texture: a gutter of line numbers and rows of
 * coloured bars standing in for tokens. Lines type themselves in a character
 * at a time, the caret blinks, and the view scrolls when it reaches the
 * bottom. Redrawn at 8fps rather than 60 — nobody can tell, and it keeps the
 * cost of the whole effect near zero.
 */
const W = 320;
const H = 196;
const ROW = 13;
const GUTTER = 26;
const TOP = 10;

const TOKEN = ["#60a5fa", "#a5b4fc", "#7dd3fc", "#94a3b8", "#c4b5fd", "#f0abfc"];

function makeRandom(seed) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A plausible-looking program: indent depth plus a run of token widths. */
function makeProgram(seed, lines) {
  const rnd = makeRandom(seed);
  const out = [];
  let indent = 0;

  for (let i = 0; i < lines; i++) {
    const opens = rnd() < 0.22;
    const closes = !opens && indent > 0 && rnd() < 0.24;
    if (closes) indent = Math.max(0, indent - 1);

    const tokens = [];
    if (!closes) {
      const count = 1 + Math.floor(rnd() * 4);
      for (let k = 0; k < count; k++) {
        tokens.push({
          w: 12 + Math.floor(rnd() * 46),
          c: TOKEN[Math.floor(rnd() * TOKEN.length)],
        });
      }
    } else {
      tokens.push({ w: 8, c: TOKEN[3] });
    }

    out.push({ indent, tokens, blank: rnd() < 0.08 });
    if (opens) indent = Math.min(4, indent + 1);
  }
  return out;
}

export function useCodeTexture(seed = 7, { rows = 13, program } = {}) {
  const state = useRef({ typed: 0, scroll: 0, last: -1 });

  const kit = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return { canvas, ctx, texture, code: program ?? makeProgram(seed, 90) };
  }, [seed, program]);

  useEffect(() => () => kit.texture.dispose(), [kit]);

  /** @param {number} t seconds */
  const draw = (t) => {
    // Called from useFrame, never during render: this scratch object is the
    // texture's own animation cursor, which is exactly what a ref is for.
    const s = state.current;
    const frame = Math.floor(t * 8);
    if (frame === s.last) return;
    s.last = frame;

    // typing speed, in tokens per second
    s.typed = t * 5.5;
    const cursorLine = Math.floor(s.typed / 3);
    s.scroll = Math.max(0, cursorLine - (rows - 3));

    const { ctx, code, texture } = kit;
    ctx.fillStyle = "#0a1020";
    ctx.fillRect(0, 0, W, H);

    // gutter
    ctx.fillStyle = "#111c33";
    ctx.fillRect(0, 0, GUTTER - 6, H);

    for (let r = 0; r < rows; r++) {
      const lineIndex = s.scroll + r;
      const line = code[lineIndex % code.length];
      const y = TOP + r * ROW;
      const isCursor = lineIndex === cursorLine;

      if (isCursor) {
        ctx.fillStyle = "rgba(96,165,250,0.10)";
        ctx.fillRect(GUTTER - 6, y - 3, W - GUTTER + 6, ROW);
      }

      // line number
      ctx.fillStyle = isCursor ? "#7dd3fc" : "#334155";
      ctx.fillRect(6, y + 2, 12, 3);

      if (line.blank) continue;

      let x = GUTTER + line.indent * 12;
      const budget = isCursor
        ? Math.max(0, ((s.typed % 3) / 3) * 120 + 10)
        : Infinity;
      let used = 0;

      for (const tok of line.tokens) {
        if (used >= budget) break;
        const w = Math.min(tok.w, budget - used);
        ctx.fillStyle = tok.c;
        ctx.globalAlpha = lineIndex > cursorLine ? 0 : 0.9;
        ctx.fillRect(x, y + 1, w, 5);
        ctx.globalAlpha = 1;
        x += tok.w + 6;
        used += tok.w + 6;
        if (x > W - 14) break;
      }

      if (isCursor && Math.floor(t * 2) % 2 === 0) {
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(x, y - 1, 2, 9);
      }
    }

    texture.needsUpdate = true;
  };

  return { texture: kit.texture, draw };
}
