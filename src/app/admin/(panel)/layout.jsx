/**
 * src/app/admin/(panel)/layout.jsx — ADMIN SHELL: sidebar + content area.
 *
 * Wraps every /admin page except /admin/login. The sidebar lists the
 * settings groups and collections straight from src/lib/cms/schema.js, so a
 * new group/collection appears here automatically.
 * Access control is done in src/proxy.js; this layout only reads the session
 * to show the email + logout button.
 */
import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import { getSession } from "@/lib/auth.js";
import { logoutAction } from "@/lib/cms/actions.js";
import { SETTINGS_GROUPS, COLLECTIONS } from "@/lib/cms/schema.js";
import AdminNav from "@/components/admin/AdminNav.jsx";

export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }) {
  const session = await getSession();

  const nav = [
    { heading: "Overview", items: [{ href: "/admin", label: "Dashboard" }, { href: "/admin/messages", label: "Messages" }] },
    {
      heading: "Content",
      items: Object.entries(COLLECTIONS).map(([key, c]) => ({ href: `/admin/${key}`, label: c.label })),
    },
    {
      heading: "Settings",
      items: SETTINGS_GROUPS.map((g) => ({ href: `/admin/settings/${g.key}`, label: g.label })),
    },
    { heading: "Account", items: [{ href: "/admin/account", label: "Password" }] },
  ];

  return (
    <div className="min-h-screen bg-bg text-body lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Sidebar */}
      <aside className="border-b lg:border-b-0 lg:border-e border-line-soft bg-section/60 lg:min-h-screen">
        <div className="p-5 flex items-center justify-between lg:block">
          <Link href="/admin" className="flex items-center gap-2 text-heading font-bold">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm">
              N
            </span>
            Admin
          </Link>
          <Link
            href="/"
            target="_blank"
            className="mt-0 lg:mt-3 inline-flex items-center gap-1 text-xs text-muted hover:text-accent"
          >
            View site <ExternalLink size={12} />
          </Link>
        </div>
        <AdminNav groups={nav} />
        <div className="p-5 border-t border-line-soft text-xs text-faint flex items-center justify-between gap-2">
          <span className="truncate">{session?.email}</span>
          <form action={logoutAction}>
            <button type="submit" className="inline-flex items-center gap-1 text-muted hover:text-heading" title="Log out">
              <LogOut size={14} /> Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Page content */}
      <main className="p-6 lg:p-10 max-w-5xl w-full">{children}</main>
    </div>
  );
}
