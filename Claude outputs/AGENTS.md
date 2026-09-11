# Noorullah Qayoumi — Portfolio + CMS

Guide for any AI coding agent (Claude Code, Cursor, Codex, Copilot, …) working on
this repository. Read this before changing anything. `CLAUDE.md` just points here.

---

## 1. What this project is

A personal portfolio site for **Noorullah Qayoumi** (web developer, Kabul) with a
**self-built CMS** behind it, so every word, image, link and setting on the public
page is edited from `/admin` — no code change needed to update content.

It began as a React + Vite single-page portfolio and was migrated **in place** to
Next.js. There is no second copy of the project; this folder is the only one.

- Public site: one long page (`/`) with Hero, About, Work, Experience, Skills,
  Services, Reviews, Contact.
- Admin: `/admin`, email + password, manages everything and receives the messages
  sent through the contact form.
- Live: Netlify. Database: PostgreSQL on Neon. Images: Cloudinary.

---

## 2. How the owner wants you to work

These are standing instructions from the owner. They matter as much as the code.

1. **Comment everything.** Every file starts with a header comment saying what the
   file is and what it does; every section inside a file gets a short comment. He
   reads the code to make small edits himself, so uncommented code is a failure.
2. **Say where things are.** After any change, tell him in plain language which
   file and which part to open if he wants to tweak a colour, a text, spacing, etc.
   Existing files list their tweak points in the header comment — keep that habit.
3. **Never invent content.** No fake projects, clients, awards, metrics,
   testimonials, years of experience or skills. If content is missing, ask.
4. **Work in place.** Don't scaffold a parallel project folder to "start clean".
5. **Don't rewrite what works.** Prefer small, verifiable changes over refactors.
6. **Test before declaring done.** Build it, run it, look at it. See §11.

---

## 3. Stack

| Piece | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.3** App Router, **JavaScript** (no TypeScript) | Turbopack |
| UI | **React 19**, pinned `~19.2.6` | see warning below |
| Styling | **Tailwind CSS v4** via `@tailwindcss/postcss` | no `tailwind.config.js`; tokens live in `globals.css` |
| 3D | three.js + @react-three/fiber | hero + background scenes |
| Database | PostgreSQL (Neon in production) + **Drizzle ORM** | |
| Auth | bcrypt + JWT (`jose`) in an HttpOnly cookie | |
| Images | Cloudinary | |
| Icons | lucide-react | |
| Host | Netlify (`@netlify/plugin-nextjs`) | |

**Do not bump React past 19.2.x.** `@react-three/fiber@9` requires
`react@">=19 <19.3"`; `react@19.3` makes `npm install` fail with ERESOLVE. The
tilde in `package.json` is deliberate.

**Keep ESLint on v9.** `eslint-config-next` is not compatible with ESLint 10.

---

## 4. Commands

```bash
npm run dev          # local dev server on :3000
npm run build        # production build
npm run lint         # eslint

npm run db:generate  # generate a new SQL migration after editing the DB schema
npm run db:push      # APPLY migrations  (custom runner — see the warning)
npm run db:seed      # first-time data + the first admin user
npm run db:studio    # drizzle-kit studio
```

**`db:push` is not `drizzle-kit push`.** `drizzle-kit push` silently hangs against
this Neon database from Windows — it prints "Pulling schema from database…" and
exits having done nothing. `npm run db:push` therefore runs
`scripts/migrate.mjs`, a small runner that applies the generated SQL in
`drizzle/` through the same connection the app itself uses. The old behaviour is
still available as `db:push:kit` but is not expected to work here.

Workflow after changing `src/lib/db/schema.js`: `db:generate`, then `db:push`.

---

## 5. Environment variables

Local values go in `.env.local` (git-ignored). `.env.example` is a **template and
must never contain real values** — it is committed, and Netlify's secret scanner
fails the build when a real value appears in a repo file. That has already
happened once.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Neon connection string (any Postgres URL works locally) |
| `AUTH_SECRET` | yes | signs the admin session cookie |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | uploads | image uploads; a single `CLOUDINARY_URL="cloudinary://key:secret@cloud"` is also accepted |
| `CLOUDINARY_FOLDER` | no | upload folder, defaults to `portfolio` |
| `NEXT_PUBLIC_SITE_URL` | no | used for metadata / Open Graph |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | seeding only | used by `db:seed`; **do not set these on Netlify** |

---

## 6. The CMS engine — the one thing to understand

The admin panel is **not** hand-written per field. One schema file drives the
database reads, the admin forms, the parsing and the public output. Adding a field
is usually a one-line change plus a migration.

```
src/lib/cms/schema.js        ← THE SOURCE OF TRUTH
   SETTINGS_GROUPS   site, hero, about, contact, form, sections, nav, ui
   COLLECTIONS       projects, skills, services, experience, reviews, socials
   LANGUAGES         en, fa, ps
```

Every field is `{ name, type, label, … }`. Supported types: `text`, `textarea`,
`url`, `image`, `number`, `boolean`, `select`, `tags`, `pairs`, and the translated
ones `i18n`, `i18n-textarea`, `i18n-list`.

The flow, both directions:

```
schema.js ─▶ Fields.jsx / Forms.jsx      render the admin inputs
          ─▶ parse.js                    form data ─▶ values to store
          ─▶ localize.js                 stored value ─▶ one language for the UI
```

**To add an editable field:** add it to the right group/collection in
`schema.js`; add the column in `src/lib/db/schema.js`; run `db:generate` +
`db:push`; use it in the public component. The admin form updates itself.

### Translations
Translatable columns are JSONB holding `{ en, fa, ps }`. Nothing is translated
automatically — the owner types each language in the admin. `LanguageProvider`
flattens the bundle into a plain `t` object for the active language, so public
components read `t.something`, never the raw JSON. Farsi and Pashto are RTL;
`layout.jsx` sets `dir` and `globals.css` styles `[dir="rtl"]`.

### Caching / when the site updates
`getContent()` in `src/lib/cms/content.js` is wrapped in `unstable_cache` with the
tag `"content"`. Every admin write calls `bustContent()` (`updateTag("content")` +
`revalidatePath("/")`) in `src/lib/cms/actions.js`, so a save is visible on the
public page immediately. **If you add a new write path, call `bustContent()`** or
edits will appear to do nothing.

Note this cache is persisted on disk in `.next/cache` — during debugging a page
can render fine from cache even with the database unreachable. Delete `.next` for
an honest test.

---

## 7. File map

```
src/app/
  layout.jsx              <html>: reads theme + lang cookies, sets class/dir
  page.jsx                public home page (server component) → Providers → Site
  error.jsx               friendly error screen; detects DB errors and hints
  globals.css             ALL design tokens, light/dark, RTL, .admin theme,
                          and the "ADMIN SHELL SCROLL LOCK" block
  robots.js
  api/upload/route.js     POST = Cloudinary upload · GET = credentials self-check
  admin/(auth)/login/     login page
  admin/(panel)/          admin shell + dashboard + all editing screens
      layout.jsx          navy sidebar + white frame + the scroll model (§9)
      page.jsx            dashboard: live KPI cards + SVG charts
      [collection]/       list  +  [id]/ edit form  (generated from schema.js)
      settings/[group]/   one settings group
      messages/           contact-form inbox
      account/            change password

src/lib/
  db/index.js             getDb(): Neon HTTP driver for *.neon.tech, node-pg
                          otherwise. The missing-URL check is INSIDE create()
                          on purpose — see §10.
  db/schema.js            Drizzle tables
  cms/schema.js           ← the CMS definition (§6)
  cms/content.js          getContent(): the whole public bundle, cached
  cms/actions.js          every admin server action
  cms/parse.js            form → values          cms/localize.js  values → text
  cms/public-actions.js   sendMessage(): the public contact form
  cms/icons.js            name → icon component
  auth.js                 sessions, bcrypt, requireAdmin (Node runtime)
  session-token.js        JWT verify only — Edge-safe, used by proxy.js
  cloudinary.js           upload + credential parsing + error explanations
  proxy.js                Next 16's middleware. Guards /admin/* and /api/upload

src/components/
  Site.jsx + Hero/About/Work/...      the public sections
  three/                              3D scenes (hero, backdrop, character)
  admin/                              Fields, Forms, AdminNav, Charts,
                                      SortableList, LoginForm, PageHeader
  i18n/LanguageProvider.jsx           localizes the bundle for the active language
  ui/, hooks/                         Reveal, Tilt, Section, scroll/pointer hooks
```

**Dead leftovers from the Vite version** — not imported anywhere, safe to delete:
`src/data/projects.js`, `src/components/i18n/translations.js`.

---

## 8. Database

Tables: `settings` (key + JSONB value, one row per settings group), `projects`,
`skill_groups`, `services`, `experience` (`kind` = work | education), `reviews`,
`socials`, `messages` (contact form), `admin_users`.

Every content table has an integer `sort` column; lists are ordered
`ORDER BY sort ASC, id ASC` in both the admin and the public site. Migrations live
in `drizzle/` and are generated, never hand-written.

---

## 9. Admin panel specifics

**Scroll model.** From 768px up the admin is a fixed one-screen app: the page
itself never scrolls, and the sidebar and content are separate scroll areas. This
is done in two places that must stay in sync — the `md:h-screen md:overflow-hidden`
classes in `admin/(panel)/layout.jsx`, and the `ADMIN SHELL SCROLL LOCK` block at
the bottom of `globals.css` which pins `html`/`body` via `:has(.admin)`. Below
768px it stacks and scrolls normally. Only the `lg:` breakpoint was locked
originally and that was not enough — a Windows laptop at 150% display scaling
reports under 1024px and kept scrolling.

**Reordering.** `src/components/admin/SortableList.jsx` gives every collection list
a drag handle, built on pointer events (mouse + touch, no drag library). It
auto-scrolls when you hold a row near the top or bottom edge, so long lists work.
It commits through the `reorderItems` action, which writes the whole new order in
one `UPDATE … FROM (VALUES …)` statement rather than one query per row — that
matters over a remote Neon connection. The ↑ ↓ buttons remain for keyboard use.

Two traps found the hard way and already handled here: the drag must be tracked on
`window`, because React moves the row you are holding and the browser then drops
the pointer capture, so a `pointerup` on the list itself is lost; and the on-screen
order must be mirrored in a ref, because those window listeners cannot read state.

**New items on top.** A collection marked `newestFirst: true` in `cms/schema.js`
(currently only `projects`) inserts new rows above the rest instead of appending.

**Colours.** The admin has its own palette scoped to `.admin` in `globals.css`
(`--adm-navy`, `--adm-amber`, `--adm-page`). Amber buttons use `.btn-accent`.

---

## 10. Deployment (Netlify)

The repo is connected to Netlify from GitHub; pushing to the main branch deploys.

1. **Environment variables must be set in Netlify** (Site configuration →
   Environment variables). `.env.local` is git-ignored, so Netlify never sees it.
   `DATABASE_URL` and `AUTH_SECRET` are the required two.
2. **Secret scanning.** Netlify searches the repo and build output for the values
   of those variables and fails the build on a match. `netlify.toml` therefore
   lists `NEXT_PUBLIC_SITE_URL`, `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_FOLDER`
   under `SECRETS_SCAN_OMIT_KEYS` — they are public by nature (`NEXT_PUBLIC_*` is
   compiled into the browser bundle; the cloud name and folder appear in every
   image URL). The genuine secrets are deliberately still scanned. Don't add them
   to that list; fix the leak instead.
3. Migrations are run by hand from a developer machine against the Neon URL
   (`db:push`, then `db:seed` the first time). The build does not touch the
   database — `/` is server-rendered on demand, not prerendered.

---

## 11. Traps to know about (all previously hit)

- **Nothing may throw at module scope.** A top-level `throw` for a missing env var
  broke `next build` during "Collecting page data" with the misleading message
  `Failed to collect configuration for /`. Validate inside the function instead.
- **No inline `<script>` anywhere.** React 19 / Next 16 refuse to execute script
  tags rendered by components, and `next/script` with `beforeInteractive` produced
  the same warning. The "follow the OS dark mode until the user chooses" behaviour
  is therefore pure CSS: a `theme-system` class on `<html>` plus a
  `@custom-variant dark` rule in `globals.css`. Don't reintroduce a theme script.
- **React resets form fields after a server action resolves.** Where the old values
  must stay on screen, submit manually with
  `startTransition(() => formAction(new FormData(e.currentTarget)))` instead of
  `<form action={…}>` — `SettingsForm` does this.
- **`.env.example` must stay empty of real values** (§5).
- Tailwind v4 has no config file here; add design tokens in `globals.css`.
- `src/proxy.js` is this version's middleware file, and runs on the Edge runtime —
  only import Edge-safe code there (that is why `session-token.js` is split out
  from `auth.js`).

---

## 12. Checklist before saying a task is done

Build (`npm run build`) and lint clean; the page actually opened and looked at,
desktop **and** ~390px mobile; no console errors; dark and light mode; RTL not
broken if you touched layout; admin still loads and saves; and if you changed
ordering, caching or a write path, confirm the public page reflects it after a
reload. Screenshots taken *after* the final change, not before it.

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
