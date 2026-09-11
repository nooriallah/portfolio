/**
 * src/backend/auth/index.js — ADMIN LOGIN & SESSIONS (server only).
 *
 * One admin (you). Login = email + password checked against the
 * `admin_users` table (bcrypt hash). A successful login sets a signed,
 * HttpOnly cookie ("admin_session", 7 days) containing a JWT — no database
 * lookup is needed on every request, only the signature is verified.
 *
 * AUTH_SECRET in .env.local signs the token. Change it → everyone is logged out.
 *
 * Used by: src/proxy.js (route protection), admin pages, server actions,
 *          /api/upload.
 */
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@backend/db/index.js";
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  secret,
  verifySessionToken,
} from "./session-token.js";

export { SESSION_COOKIE, verifySessionToken };

/** Create the signed session token for a user. */
export async function createSessionToken(user) {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

/** The logged-in admin for the current request, or null. */
export async function getSession() {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** Throws when not logged in — call at the top of every server action. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  return session;
}

/**
 * Check credentials. Returns the user row or null.
 * Always runs bcrypt (even for unknown emails) so timing does not reveal
 * whether an email exists.
 */
export async function verifyCredentials(email, password) {
  const db = await getDb();
  const [user] = await db
    .select()
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.email, String(email).trim().toLowerCase()))
    .limit(1);
  const hash = user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva";
  const ok = await bcrypt.compare(String(password), hash);
  return ok && user ? user : null;
}

/** Write the session cookie (called after a successful login). */
export async function setSessionCookie(user) {
  const token = await createSessionToken(user);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

/** Remove the session cookie (logout). */
export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** Hash a new password (used by "change password" and the seed script). */
export function hashPassword(password) {
  return bcrypt.hash(String(password), 12);
}
