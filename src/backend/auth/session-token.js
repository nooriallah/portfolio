/**
 * src/backend/auth/session-token.js — SESSION TOKEN VERIFICATION (Edge-safe).
 *
 * Split out of auth.js because src/proxy.js runs on the Edge runtime, where
 * the database driver and bcrypt are not available. This file only depends
 * on `jose`, so both the proxy and the server can import it.
 */
import { jwtVerify } from "jose";

export const SESSION_COOKIE = "admin_session";
export const SESSION_DAYS = 7;

/** The signing key, from AUTH_SECRET in .env.local. */
export function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error("AUTH_SECRET is missing or too short (min 16 chars). See .env.example.");
  }
  return new TextEncoder().encode(s);
}

/** Verify a token → { id, email } or null. */
export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { id: Number(payload.sub), email: payload.email };
  } catch {
    return null;
  }
}
