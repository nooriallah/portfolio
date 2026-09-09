# Noorullah Qayoumi — Portfolio (Next.js + Neon)

Personal 3D developer portfolio. **Next.js 16 (App Router) · React 19 · Tailwind v4 ·
three.js / React Three Fiber · PostgreSQL on Neon (Drizzle ORM) · Cloudinary · Netlify.**

All texts, projects, skills, socials, images and settings are edited in the built-in
admin panel at **`/admin`** — no code changes needed for content.

---

## 1. First-time setup

```bash
npm install                      # dependencies
cp .env.example .env.local       # then fill in the values (see below)
npm run db:push                  # create the tables in your Neon database
npm run db:seed                  # load the current site content + create the admin user
npm run dev                      # http://localhost:3000  (admin: /admin)
```

`.env.local` variables (all explained inside `.env.example`):

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon → project → Connection string (pooled) |
| `AUTH_SECRET` | any long random string — signs the admin login cookie |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | your first admin login (used once by `db:seed`) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary dashboard |
| `CLOUDINARY_FOLDER` | folder name for uploads (default `portfolio`) |
| `NEXT_PUBLIC_SITE_URL` | the public URL, for metadata |

## 2. Scripts

| Command | What it does |
|---|---|
| `npm run dev` | development server with hot reload |
| `npm run build` / `npm start` | production build / run it |
| `npm run lint` | ESLint |
| `npm run db:push` | create/update the tables from `./drizzle` (safe to re-run) |
| `npm run db:seed` | insert starter content (skips anything that already exists) |
| `npm run db:generate` | after editing `src/lib/db/schema.js`: write a new migration into `./drizzle`, then run `db:push` |
| `npm run db:studio` | browse the database in Drizzle Studio |

## 3. Where things are

```
src/app/
  layout.jsx              root <html>: theme + language from cookies, fonts
  page.jsx                public home page (loads content from the DB)
  globals.css             DESIGN TOKENS (colours) + global styles
  robots.js               robots.txt (hides /admin from search engines)
  admin/(auth)/login/     login page
  admin/(panel)/          dashboard, collections, settings, messages, account
  api/upload/route.js     image upload → Cloudinary
src/proxy.js              protects /admin (redirects to login)
src/lib/
  db/schema.js            DATABASE TABLES (Drizzle)
  db/index.js             connection (Neon in production, any Postgres locally)
  cms/schema.js           WHAT THE ADMIN CAN EDIT (fields, languages, nav ids)
  cms/content.js          loads + caches all public content
  cms/actions.js          server actions used by the admin (save/delete/reorder…)
  cms/public-actions.js   contact-form action
  cms/localize.js         { en, fa, ps } → string for the active language
  cms/parse.js            form data → database values
  cms/icons.js            icon names → components
  auth.js, session-token.js   admin login + session cookie
  cloudinary.js           upload helper
src/components/
  Site.jsx                the page shell (section order)
  Hero/About/Work/…       the public sections
  Providers.jsx, ThemeProvider.jsx, i18n/LanguageProvider.jsx
  three/                  3D scenes (unchanged from the Vite version)
  ui/                     motion primitives (Reveal, Tilt, Stagger, SplitText…)
  admin/                  admin panel UI (Fields, Forms, nav, login…)
scripts/seed.mjs          starter content (reads the old translations.js / projects.js)
```

### Changing colours
Edit the CSS variables at the top of `src/app/globals.css` (`:root` = light,
`.dark` = dark). Every component uses them through Tailwind classes such as
`bg-bg`, `text-heading`, `text-accent`, `border-line`.

### Adding an editable text
1. Add a field to the right group in `src/lib/cms/schema.js`.
2. Read it in the component: `const { t } = useLang(); t.<group>.<field>`.
3. Fill it in `/admin` (or add it to `scripts/seed.mjs` and run `npm run db:seed`).

### Adding a language
Add `{ code, label, dir }` to `LANGUAGES` in `src/lib/cms/schema.js`; every
i18n field in the admin gets a new input automatically.

## 4. Deploying to Netlify

1. Push the repo to GitHub and import it in Netlify (the Next.js runtime is detected
   automatically; `netlify.toml` is included).
2. Site settings → Environment variables: add every variable from `.env.local`
   **except** `ADMIN_EMAIL` / `ADMIN_PASSWORD` (only needed for seeding).
3. Run `npm run db:push` and `npm run db:seed` once from your computer against the
   Neon `DATABASE_URL` — the database is shared, so production sees the same data.
4. Deploy. Log in at `https://your-site/admin`.
