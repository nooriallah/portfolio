const REDUCED = "(prefers-reduced-motion: reduce)";

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced =
    typeof window !== "undefined" && window.matchMedia(REDUCED).matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}
