"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider.jsx";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle light/dark theme"
      title="Toggle theme"
      className="grid place-items-center w-9 h-9 rounded-lg border border-line text-muted hover:text-heading hover:border-accent transition"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
