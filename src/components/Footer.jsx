"use client";
/**
 * src/components/Footer.jsx — FOOTER: copyright line + social icons.
 * Rights text: /admin → Buttons & UI texts. Socials: /admin → Social links.
 */
import { brandIcon } from "@/lib/cms/icons.js";
import { useLang } from "./i18n/LanguageProvider.jsx";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-line-soft px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-faint">
          © {new Date().getFullYear()} {t.hero.name}. {t.ui.rights}
        </p>
        <div className="flex gap-3">
          {t.socials.map((s) => {
            const Icon = brandIcon(s.icon);
            return (
              <a
                key={s.id}
                aria-label={s.name}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="grid place-items-center w-9 h-9 rounded-lg border border-line text-muted hover:text-heading hover:border-accent transition"
              >
                <Icon size={16} />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
