import { useEffect, useRef } from "react";

/**
 * One pointer listener and one rAF loop for the whole app.
 *
 * Returns a ref holding smoothed, normalised coordinates in the -1..1 range
 * (0,0 = centre of the viewport). Reading from a ref instead of state means
 * pointer movement never triggers a React re-render — consumers sample it
 * inside their own animation frame.
 */
const pointer = { x: 0, y: 0, tx: 0, ty: 0, moved: false };

let subscribers = 0;
let frame = 0;

function onMove(e) {
  pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  pointer.moved = true;
}

function tick() {
  // critically-damped-ish easing, framerate independent enough for our use
  pointer.x += (pointer.tx - pointer.x) * 0.075;
  pointer.y += (pointer.ty - pointer.y) * 0.075;
  frame = requestAnimationFrame(tick);
}

export default function usePointer() {
  const ref = useRef(pointer);

  useEffect(() => {
    if (subscribers++ === 0) {
      window.addEventListener("pointermove", onMove, { passive: true });
      frame = requestAnimationFrame(tick);
    }
    return () => {
      if (--subscribers === 0) {
        window.removeEventListener("pointermove", onMove);
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  return ref;
}

export { pointer };
