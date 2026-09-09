"use client";
/**
 * src/components/ThemeProvider.jsx — DARK / LIGHT THEME.
 *
 * The theme lives in a cookie named "theme" (1 year) so the server can put the
 * right class on <html> before the page is sent — no flash:
 *   class="dark"          → dark (chosen with the toggle)
 *   (no class)            → light (chosen with the toggle)
 *   class="theme-system"  → nothing chosen yet; CSS follows the OS preference
 *                           (see @custom-variant dark in src/app/globals.css)
 *
 * `toggle()` sets an explicit class, writes the cookie and notifies every
 * component using `useTheme()` (the 3D scenes read it to recolour).
 *
 * Colours themselves are NOT here — they are the CSS variables at the top of
 * src/app/globals.css.
 */
import { createContext, useContext, useCallback, useSyncExternalStore } from "react";

const ThemeContext = createContext(null);

/* The "store" is the class on <html>; these helpers let React subscribe to it
   without a hydration mismatch. */
const listeners = new Set();
const subscribe = (fn) => {
  listeners.add(fn);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", fn);
  return () => {
    listeners.delete(fn);
    mq.removeEventListener("change", fn);
  };
};
function readTheme() {
  const cls = document.documentElement.classList;
  if (cls.contains("dark")) return "dark";
  if (cls.contains("theme-system")) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

function writeCookie(name, value) {
  try {
    document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {}
}

export function ThemeProvider({ initialTheme = null, children }) {
  // Server render: the cookie value (or light while unknown); client: the real state.
  const theme = useSyncExternalStore(subscribe, readTheme, () => initialTheme ?? "light");

  const setTheme = useCallback((next) => {
    const cls = document.documentElement.classList;
    cls.remove("theme-system"); // an explicit choice replaces "follow the OS"
    cls.toggle("dark", next === "dark");
    writeCookie("theme", next);
    listeners.forEach((fn) => fn());
  }, []);

  const toggle = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
