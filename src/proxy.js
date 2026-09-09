/**
 * src/proxy.js — ROUTE PROTECTION FOR /admin (Next.js "proxy", formerly middleware).
 *
 * Runs before every request that matches `config.matcher`:
 *  - /admin/login is always allowed (and redirects to /admin when already logged in).
 *  - Every other /admin/* page and /api/upload require a valid session cookie,
 *    otherwise the visitor is sent to /admin/login.
 */
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token.js";

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (pathname === "/admin/login") {
    return session
      ? NextResponse.redirect(new URL("/admin", request.url))
      : NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/upload"],
};
