/**
 * drizzle.config.js — Drizzle Kit configuration (schema → SQL migrations).
 *
 *  - `schema`  : where the table definitions live.
 *  - `out`     : generated SQL migrations land here (commit this folder).
 *  - `dbCredentials.url` : read from DATABASE_URL in .env.local.
 *
 * Commands (see package.json "scripts"):
 *   npm run db:push     – push the schema straight to the database (dev)
 *   npm run db:generate – write a migration file
 *   npm run db:studio   – open Drizzle Studio to browse rows
 */
import { defineConfig } from "drizzle-kit";
import { readFileSync, existsSync } from "node:fs";

// drizzle-kit does not load .env.local by itself, so read it here.
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.js",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL },
});
