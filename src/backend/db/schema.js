/**
 * src/backend/db/schema.js — THE DATABASE SCHEMA (Drizzle ORM, PostgreSQL / Neon).
 *
 * Every table that the admin panel manages is defined here. The public site
 * reads from these tables through `src/backend/cms/content.js`.
 *
 * Translated text is stored as a JSON object with one key per language,
 * e.g. { "en": "Web Developer", "fa": "توسعه‌دهنده وب", "ps": "..." }.
 * We call that shape an "i18n" value everywhere in the code.
 *
 * After changing anything here run:  npm run db:push
 */
import {
  pgTable,
  serial,
  text,
  jsonb,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ *
 * settings — one row per setting, `value` is free-form JSON.
 * Holds: site identity, hero texts, about section, contact details,
 * navigation labels, UI strings, image URLs, etc.
 * The list of keys and their field types lives in src/backend/cms/schema.js.
 * ------------------------------------------------------------------ */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ------------------------------------------------------------------ *
 * projects — the "Work" grid (43 sites today).
 * ------------------------------------------------------------------ */
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: jsonb("title").notNull(), // i18n
  description: jsonb("description"), // i18n, optional
  role: jsonb("role"), // i18n, optional ("Full-stack developer")
  tech: text("tech").array().default([]).notNull(), // ["React", "Laravel"]
  category: text("category").notNull().default(""), // "WordPress" | "Custom Code" | ...
  image: text("image").notNull().default(""), // URL or /img/... path
  url: text("url"), // live link, null when there is none
  sort: integer("sort").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ------------------------------------------------------------------ *
 * skill_groups — one card in the Skills section ("Front-End", ...).
 * `icon` is a lucide-react icon name, see src/shared/icons/index.js.
 * ------------------------------------------------------------------ */
export const skillGroups = pgTable("skill_groups", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // "frontend", "backend", ...
  icon: text("icon").notNull().default("Code2"),
  label: jsonb("label").notNull(), // i18n
  items: text("items").array().default([]).notNull(), // ["HTML5", "CSS3"]
  sort: integer("sort").notNull().default(0),
});

/* ------------------------------------------------------------------ *
 * services — one card in the Services section.
 * ------------------------------------------------------------------ */
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  icon: text("icon").notNull().default("Code2"),
  title: jsonb("title").notNull(), // i18n
  description: jsonb("description").notNull(), // i18n
  sort: integer("sort").notNull().default(0),
});

/* ------------------------------------------------------------------ *
 * experience — timeline entries. `kind` is "work" or "education" and
 * decides which of the two columns the entry appears in.
 * ------------------------------------------------------------------ */
export const experience = pgTable("experience", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull().default("work"), // "work" | "education"
  year: jsonb("year").notNull(), // i18n ("2021 — Present")
  title: jsonb("title").notNull(), // i18n
  place: jsonb("place").notNull(), // i18n
  description: jsonb("description").notNull(), // i18n
  sort: integer("sort").notNull().default(0),
});

/* ------------------------------------------------------------------ *
 * reviews — client testimonials.
 * ------------------------------------------------------------------ */
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image").notNull().default(""),
  role: jsonb("role").notNull(), // i18n ("CEO / Company")
  text: jsonb("text").notNull(), // i18n
  sort: integer("sort").notNull().default(0),
  published: boolean("published").notNull().default(true),
});

/* ------------------------------------------------------------------ *
 * socials — social media links shown in the hero and footer.
 * `icon` is one of the brand icons in src/shared/icons/index.js.
 * ------------------------------------------------------------------ */
export const socials = pgTable("socials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "GitHub"
  icon: text("icon").notNull(), // "github" | "linkedin" | ...
  url: text("url").notNull(),
  sort: integer("sort").notNull().default(0),
});

/* ------------------------------------------------------------------ *
 * messages — inbox for the contact form on the public site.
 * ------------------------------------------------------------------ */
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull().default(""),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ------------------------------------------------------------------ *
 * admin_users — who may log in to /admin. Passwords are bcrypt hashes.
 * ------------------------------------------------------------------ */
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
