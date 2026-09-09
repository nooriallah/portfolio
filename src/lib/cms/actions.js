"use server";
/**
 * src/lib/cms/actions.js — SERVER ACTIONS FOR THE ADMIN PANEL.
 *
 * Every write to the database from /admin goes through one of these
 * functions. Each one:
 *   1. checks the admin is logged in (requireAdmin),
 *   2. validates / parses the form,
 *   3. writes to the database,
 *   4. calls `bustContent()` so the public site shows the change immediately.
 *
 * Actions:
 *   loginAction / logoutAction        – admin session
 *   saveSettings(groupKey, fd)        – one settings group (Site, Hero, …)
 *   saveItem(collection, id, fd)      – create / update a row in a collection
 *   deleteItem(collection, id)        – delete a row
 *   moveItem(collection, id, dir)     – reorder (swap `sort` with a neighbour)
 *   markMessageRead / deleteMessage   – inbox
 *   changePassword(fd)                – admin account
 */
import { redirect } from "next/navigation";
import { revalidatePath, updateTag, refresh } from "next/cache";
import { asc, eq, and, gt, lt, desc, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/index.js";
import {
  requireAdmin,
  verifyCredentials,
  setSessionCookie,
  clearSessionCookie,
  hashPassword,
} from "@/lib/auth.js";
import { SETTINGS_GROUPS, COLLECTIONS } from "./schema.js";
import { CONTENT_TAG } from "./content.js";
import { parseFields } from "./parse.js";

/** Forget the cached public content so the next visit re-reads the database. */
function bustContent() {
  updateTag(CONTENT_TAG);
  revalidatePath("/");
}

/** Resolve a collection key ("projects") to its definition + Drizzle table. */
function collectionOf(key) {
  const def = COLLECTIONS[key];
  if (!def) throw new Error(`Unknown collection: ${key}`);
  return { def, table: schema[def.table] };
}

/* ------------------------------------------------------------------ *
 * Auth
 * ------------------------------------------------------------------ */
export async function loginAction(_prev, fd) {
  const email = String(fd.get("email") ?? "");
  const password = String(fd.get("password") ?? "");
  const next = String(fd.get("next") ?? "") || "/admin";

  const user = await verifyCredentials(email, password);
  if (!user) return { error: "Wrong email or password." };

  await setSessionCookie(user);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

/* ------------------------------------------------------------------ *
 * Settings groups
 * ------------------------------------------------------------------ */
export async function saveSettings(groupKey, _prev, fd) {
  await requireAdmin();
  const group = SETTINGS_GROUPS.find((g) => g.key === groupKey);
  if (!group) return { error: "Unknown settings group." };

  const { values, errors } = parseFields(group.fields, fd);
  if (Object.keys(errors).length) return { errors };

  const db = await getDb();
  await db
    .insert(schema.settings)
    .values({ key: groupKey, value: values, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: schema.settings.key,
      set: { value: values, updatedAt: new Date() },
    });

  bustContent();
  refresh(); // re-render the admin page so the form shows the saved values
  return { saved: true, at: Date.now() };
}

/* ------------------------------------------------------------------ *
 * Collections (projects, skills, services, experience, reviews, socials)
 * ------------------------------------------------------------------ */
export async function saveItem(collection, id, _prev, fd) {
  await requireAdmin();
  const { def, table } = collectionOf(collection);

  const { values, errors } = parseFields(def.fields, fd);
  if (Object.keys(errors).length) return { errors };

  // Empty URL → NULL so the card renders without a link.
  if ("url" in values && values.url === "") values.url = null;

  const db = await getDb();

  if (id) {
    await db.update(table).set(values).where(eq(table.id, Number(id)));
  } else {
    // New rows go to the end of the list.
    const [{ max }] = await db
      .select({ max: sql`coalesce(max(${table.sort}), -1)::int` })
      .from(table);
    await db.insert(table).values({ ...values, sort: max + 1 });
  }

  bustContent();
  revalidatePath(`/admin/${collection}`);
  redirect(`/admin/${collection}?saved=1`);
}

export async function deleteItem(collection, id) {
  await requireAdmin();
  const { table } = collectionOf(collection);
  const db = await getDb();
  await db.delete(table).where(eq(table.id, Number(id)));
  bustContent();
  revalidatePath(`/admin/${collection}`);
}

/**
 * Move a row up (dir = -1) or down (dir = +1) by swapping its `sort` value
 * with the nearest neighbour in that direction.
 */
export async function moveItem(collection, id, dir) {
  await requireAdmin();
  const { table } = collectionOf(collection);
  const db = await getDb();

  const [me] = await db.select().from(table).where(eq(table.id, Number(id)));
  if (!me) return;

  const [neighbour] = await db
    .select()
    .from(table)
    .where(dir < 0 ? lt(table.sort, me.sort) : gt(table.sort, me.sort))
    .orderBy(dir < 0 ? desc(table.sort) : asc(table.sort))
    .limit(1);
  if (!neighbour) return;

  // If two rows share the same sort value, separate them first.
  const a = me.sort === neighbour.sort ? me.sort + (dir < 0 ? -1 : 1) : neighbour.sort;
  const b = me.sort;
  await db.update(table).set({ sort: a }).where(eq(table.id, me.id));
  await db.update(table).set({ sort: b }).where(eq(table.id, neighbour.id));

  bustContent();
  revalidatePath(`/admin/${collection}`);
}

/* ------------------------------------------------------------------ *
 * Messages (contact-form inbox)
 * ------------------------------------------------------------------ */
export async function markMessageRead(id, read = true) {
  await requireAdmin();
  const db = await getDb();
  await db
    .update(schema.messages)
    .set({ read })
    .where(eq(schema.messages.id, Number(id)));
  revalidatePath("/admin/messages");
}

export async function deleteMessage(id) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(schema.messages).where(eq(schema.messages.id, Number(id)));
  revalidatePath("/admin/messages");
}

/* ------------------------------------------------------------------ *
 * Account
 * ------------------------------------------------------------------ */
export async function changePassword(_prev, fd) {
  const session = await requireAdmin();
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  const confirm = String(fd.get("confirm") ?? "");

  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  if (next !== confirm) return { error: "The two new passwords do not match." };

  const user = await verifyCredentials(session.email, current);
  if (!user) return { error: "Current password is wrong." };

  const db = await getDb();
  await db
    .update(schema.adminUsers)
    .set({ passwordHash: await hashPassword(next) })
    .where(eq(schema.adminUsers.id, user.id));

  return { saved: true };
}
