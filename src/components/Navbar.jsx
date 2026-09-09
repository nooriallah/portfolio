"use client";
/**
 * src/components/Navbar.jsx — FIXED HEADER: logo, section links, theme +
 * language switch, "Hire me" button, mobile menu, reading-progress hairline.
 * Nav labels come from /admin → Navigation (t.nav); section order is NAV_IDS
 * in src/lib/cms/schema.js.
 */
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { NAV_IDS } from "@/lib/cms/schema.js";
import { scrollToId } from "../utils/scroll.js";
import { useLang } from "./i18n/LanguageProvider.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import ScrollProgressBar from "./ui/ScrollProgressBar.jsx";

export default function Navbar({ scrolled, active }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const go = (id) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-bg/80 backdrop-blur border-b border-line-soft py-3" : "py-5"}`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <button
          onClick={() => go("home")}
          className="flex items-center gap-2 text-heading font-bold text-lg"
        >
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            N
          </span>
          {/* Show only the name here not surname */}
          {(t.hero.name || "").split(" ")[0]}
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_IDS.map((id) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${active === id ? "text-accent" : "text-muted hover:text-heading"}`}
            >
              {t.nav[id]}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <button
            onClick={() => go("contact")}
            className="hidden lg:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition"
          >
            {t.ui.hireMe} <ArrowRight size={16} />
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden text-heading p-2"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden bg-bg/95 backdrop-blur border-t border-line-soft px-6 py-4 flex flex-col gap-1">
          {NAV_IDS.map((id) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="text-start px-2 py-2 text-body hover:text-accent"
            >
              {t.nav[id]}
            </button>
          ))}
        </nav>
      )}

      <ScrollProgressBar />
    </header>
  );
}
