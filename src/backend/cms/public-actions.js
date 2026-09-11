"use server";
/**
 * src/backend/cms/public-actions.js — SERVER ACTIONS USED BY THE PUBLIC SITE.
 *
 * Only one so far: `sendMessage` — saves a contact-form submission into the
 * `messages` table, which you read in /admin → Messages.
 *
 * Runs on the server; the browser never talks to the database directly.
 */
import { getDb, schema } from "@backend/db/index.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Handles the contact form (used with React's useActionState).
 * Returns { ok: true } or { ok: false, error: "..." }.
 */
export async function sendMessage(_prevState, formData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, 200);
  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 300);
  const message = String(formData.get("message") ?? "").trim().slice(0, 5000);
  // Honeypot field: real people never fill it, bots do.
  const trap = String(formData.get("website") ?? "");

  if (trap) return { ok: true };
  if (!name || !EMAIL_RE.test(email) || !message) {
    return { ok: false, error: "invalid" };
  }

  try {
    const db = await getDb();
    await db.insert(schema.messages).values({ name, email, subject, message });
    return { ok: true };
  } catch (err) {
    console.error("[contact] failed to save message", err);
    return { ok: false, error: "server" };
  }
}
