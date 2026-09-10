"use client";
/**
 * src/components/admin/AdminNav.jsx — SIDEBAR NAVIGATION (icon + label rows).
 *
 * Lives inside the navy sidebar. The active page gets an amber icon and a
 * small amber marker on the left. Icons are picked by href in ICONS below —
 * add a line there when you add a new admin page.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  FolderKanban,
  Sparkles,
  Briefcase,
  GraduationCap,
  MessageSquareQuote,
  Share2,
  Globe,
  Home,
  UserRound,
  Phone,
  ClipboardList,
  Heading,
  Compass,
  Type,
  KeyRound,
  Circle,
} from "lucide-react";

const ICONS = {
  "/admin": LayoutDashboard,
  "/admin/messages": Mail,
  "/admin/projects": FolderKanban,
  "/admin/skills": Sparkles,
  "/admin/services": Briefcase,
  "/admin/experience": GraduationCap,
  "/admin/reviews": MessageSquareQuote,
  "/admin/socials": Share2,
  "/admin/settings/site": Globe,
  "/admin/settings/hero": Home,
  "/admin/settings/about": UserRound,
  "/admin/settings/contact": Phone,
  "/admin/settings/form": ClipboardList,
  "/admin/settings/sections": Heading,
  "/admin/settings/nav": Compass,
  "/admin/settings/ui": Type,
  "/admin/account": KeyRound,
};

export default function AdminNav({ groups }) {
  const path = usePathname();

  return (
    <nav className="px-3 py-4 flex lg:block gap-6 overflow-x-auto lg:overflow-visible">
      {groups.map((g) => (
        <div key={g.heading} className="min-w-max lg:min-w-0 lg:mb-5">
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
            {g.heading}
          </p>
          <ul className="flex lg:flex-col gap-0.5">
            {g.items.map((it) => {
              const Icon = ICONS[it.href] || Circle;
              const active = it.href === "/admin" ? path === "/admin" : path.startsWith(it.href);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    prefetch={false}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/65 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    {/* active marker */}
                    <span
                      aria-hidden="true"
                      className={`absolute -start-3 top-1/2 -translate-y-1/2 h-5 w-1 rounded-e-full bg-[var(--adm-amber)] transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
                    />
                    <Icon
                      size={16}
                      className={active ? "text-[var(--adm-amber)]" : "text-white/50"}
                    />
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
