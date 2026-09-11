/**
 * src/app/admin/(panel)/layout.jsx — ADMIN SHELL (navy sidebar + white frame).
 *
 * Layout, top to bottom / left to right:
 *   grey page  →  white rounded FRAME  →  [ navy SIDEBAR | page content ]
 *
 * Sidebar: your avatar (Site → Logo, or the About photo), name (Hero → Your
 * name, English), login email, then icon navigation generated from
 * SETTINGS_GROUPS + COLLECTIONS in src/backend/cms/schema.js, and Log out.
 *
 * Colours live in src/frontend/styles/globals.css under ".admin" (--adm-navy, --adm-amber …).
 * Spacing: the frame padding is the `p-4 lg:p-6` on the outer div; the sidebar
 * width is the `17rem` in the grid template below.
 *
 * SCROLLING (tablet width and up, md ≥ 768px):
 *   • The page itself NEVER scrolls — the shell is exactly one screen tall
 *     (`md:h-screen md:overflow-hidden` below, plus the html/body lock in
 *     globals.css → search for "ADMIN SHELL SCROLL LOCK").
 *   • The sidebar and the page content are two SEPARATE scroll boxes, each
 *     with `overscroll-contain` so that reaching the bottom of one does not
 *     start scrolling anything behind it.
 *   • md → lg: the sidebar is a fixed bar across the top, content scrolls
 *     underneath it. lg and up: the sidebar is the fixed left column.
 *   • Below md (phones): everything stacks and the page scrolls normally,
 *     which is the right behaviour on a small screen.
 * To go back to a normal full-page scroll, delete the `md:h-screen
 * md:overflow-hidden` on the outer div below.
 */
import Link from "next/link";
import { eq } from "drizzle-orm";
import { LogOut, ExternalLink, UserRound } from "lucide-react";
import { getSession } from "@backend/auth/index.js";
import { getDb, schema } from "@backend/db/index.js";
import { logoutAction } from "@backend/cms/actions.js";
import { SETTINGS_GROUPS, COLLECTIONS } from "@backend/cms/schema.js";
import { pick } from "@shared/localize.js";
import AdminNav from "@backend/admin-ui/AdminNav.jsx";

export const metadata = { title: "Admin", robots: { index: false } };

/** Avatar image + display name for the sidebar, read from the settings table. */
async function loadIdentity() {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "site"));
    const site = rows[0]?.value ?? {};
    const [hero] = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "hero"));
    return {
      avatar: site.logo || site.aboutImage || site.heroImage || "",
      name: pick(hero?.value?.name, "en") || "Admin",
    };
  } catch {
    return { avatar: "", name: "Admin" };
  }
}

export default async function AdminLayout({ children }) {
  const [session, identity] = await Promise.all([getSession(), loadIdentity()]);

  // Sidebar sections — icons are chosen in AdminNav.jsx by href.
  const nav = [
    {
      heading: "Overview",
      items: [
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/messages", label: "Messages" },
      ],
    },
    {
      heading: "Content",
      items: Object.entries(COLLECTIONS).map(([key, c]) => ({
        href: `/admin/${key}`,
        label: c.label,
      })),
    },
    {
      heading: "Settings",
      items: SETTINGS_GROUPS.map((g) => ({
        href: `/admin/settings/${g.key}`,
        label: g.label,
      })),
    },
    {
      heading: "Account",
      items: [{ href: "/admin/account", label: "Password" }],
    },
  ];

  return (
    <div className="admin bg-[var(--adm-page)] p-3 sm:p-4 lg:p-6 text-body md:h-screen md:overflow-hidden">
      {/* THE WHITE FRAME
          md+ : exactly as tall as the screen (minus the padding above), so the
                panes inside it can own the scrolling. Column layout on tablet
                (sidebar bar on top), two columns on lg+ (sidebar on the left).
          The `17rem` below is the sidebar width — change it there. */}
      <div className="mx-auto max-w-[1440px] min-h-[calc(100vh-1.5rem)] md:min-h-0 md:h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] rounded-3xl bg-card shadow-[0_24px_60px_-30px_rgba(20,30,70,0.35)] overflow-clip md:flex md:flex-col md:overflow-y-auto md:overscroll-contain lg:overflow-clip lg:grid lg:grid-cols-[17rem_1fr]">
        {/* ---------------- Sidebar ----------------
            md → lg: a bar STUCK to the top of the frame — the frame is the one
                     scroll box there, so the wheel works wherever the cursor is
                     and the bar still never slides out of view.
            lg+    : the left column, full height, with its own scrollbar
                     only when the nav list is taller than the screen. */}
        <aside className="bg-[var(--adm-navy)] text-white md:shrink-0 md:sticky md:top-0 md:z-10 lg:static lg:h-full lg:overflow-y-auto lg:overscroll-contain">
          <div className="flex flex-col lg:min-h-full">
            {/* identity — avatar, name, email, then the "View site" link */}
            <div className="px-6 pt-8 pb-6 text-center border-b border-white/10">
              <div className="mx-auto w-20 h-20 rounded-full bg-white/10 ring-4 ring-white/10 overflow-hidden grid place-items-center">
                {identity.avatar ? (
                  <img
                    src={identity.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserRound size={34} className="text-white/80" />
                )}
              </div>
              <p className="mt-4 text-lg font-bold tracking-tight uppercase">
                {identity.name}
              </p>
              <p className="mt-0.5 text-xs text-white/60 truncate">
                {session?.email}
              </p>

              {/* "View site" — sits directly under the email address.
                  Opens the public site in a new tab. */}
              <Link
                href="/"
                target="_blank"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-[11px] font-medium text-white/75 hover:text-white hover:bg-white/10 hover:border-white/30 transition"
              >
                <ExternalLink size={12} /> View site
              </Link>
            </div>

            {/* navigation */}
            <AdminNav groups={nav} />

            {/* bottom action — log out */}
            <div className="mt-auto px-4 py-4 border-t border-white/10 flex items-center justify-center text-xs">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition"
                  title="Log out"
                >
                  <LogOut size={14} /> Log out
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* ---------------- Page content ----------------
            md → lg: grows naturally, the frame around it does the scrolling.
            lg+    : its OWN scroll box (lg:h-full + lg:overflow-y-auto), which
                     is what keeps the left sidebar perfectly still. */}
        <main className="p-5 sm:p-8 lg:p-10 min-w-0 md:flex-1 lg:min-h-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain">
          {children}
        </main>
      </div>
    </div>
  );
}
