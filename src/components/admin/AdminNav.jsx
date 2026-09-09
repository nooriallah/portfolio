"use client";
/**
 * src/components/admin/AdminNav.jsx — sidebar links with the active page highlighted.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav({ groups }) {
  const path = usePathname();
  return (
    <nav className="px-3 pb-4 flex lg:block gap-4 overflow-x-auto">
      {groups.map((g) => (
        <div key={g.heading} className="min-w-max lg:min-w-0 lg:mb-4">
          <p className="px-2 mb-1 text-[11px] font-semibold uppercase tracking-wider text-faint">{g.heading}</p>
          <ul className="flex lg:flex-col gap-0.5">
            {g.items.map((it) => {
              const active = it.href === "/admin" ? path === "/admin" : path.startsWith(it.href);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    prefetch={false}
                    className={`block px-2 py-1.5 rounded-md text-sm transition ${active ? "bg-accent/10 text-accent font-medium" : "text-body hover:bg-chip hover:text-heading"}`}
                  >
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
