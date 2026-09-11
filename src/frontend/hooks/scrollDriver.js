/**
 * One scroll listener and one animation frame for every scroll-driven effect
 * on the page.
 *
 * Effects register themselves here instead of each adding their own listener.
 * The driver does every DOM *read* first and every *write* afterwards, so a
 * page full of parallax layers never interleaves reads and writes and never
 * forces a synchronous relayout mid-frame.
 */
const items = new Set();
let frame = 0;
let bound = false;

/** Where an element sits in its pass through the viewport, 0 → 1. */
function progressOf(rect, vh) {
  const travelled = vh * 0.85 - rect.top;
  const distance = vh * 0.45 + rect.height;
  return Math.min(1, Math.max(0, travelled / distance));
}

function run() {
  frame = 0;
  const vh = window.innerHeight;
  const scrollY = window.scrollY;
  const reads = [];

  // ---- read pass ----
  for (const item of items) {
    if (item.kind === "page") {
      const max = document.documentElement.scrollHeight - vh;
      reads.push([item, max > 0 ? Math.min(1, scrollY / max) : 0]);
      continue;
    }

    const rect = item.el.getBoundingClientRect();
    if (rect.bottom < -vh * 0.4 || rect.top > vh * 1.4) continue;

    // Subtracting what we applied last frame recovers the element's
    // untransformed position, so repeated measurement cannot drift.
    if (item.kind === "parallax") {
      const centre = rect.top + scrollY + rect.height / 2 - item.applied;
      reads.push([item, (centre - (scrollY + vh / 2)) / vh]);
    } else if (item.kind === "drift") {
      reads.push([item, -(rect.top - item.applied)]);
    } else {
      reads.push([item, progressOf(rect, vh)]);
    }
  }

  // ---- write pass ----
  for (const [item, value] of reads) {
    if (item.kind === "parallax") {
      const y = -Math.max(-1.5, Math.min(1.5, value)) * item.speed * 100;
      item.applied = y;
      item.el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    } else if (item.kind === "drift") {
      // Wrapping the offset at the pattern's tile size makes the layer drift
      // for ever without ever running out of room. A section taller than the
      // viewport keeps moving the whole way down it, which a centre-based
      // parallax cannot do — it saturates and sits still.
      const raw = value * item.speed;
      const y = ((raw % item.period) + item.period) % item.period;
      item.applied = y;
      item.el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    } else {
      item.el.style.setProperty(item.name, value.toFixed(4));
    }
  }
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(run);
}

/**
 * @param {object} item  { kind: "parallax" | "progress" | "page", el, ... }
 * @returns {() => void} unregister
 */
export function register(item) {
  items.add(item);

  if (!bound) {
    bound = true;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  }
  schedule();

  return () => {
    items.delete(item);
    if (item.kind === "parallax") item.el.style.transform = "";
    if (!items.size && bound) {
      bound = false;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}
