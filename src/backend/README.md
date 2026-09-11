# `src/backend` — data, server logic and the admin panel

Everything that touches the database, sessions, secrets or uploads. None of this
should ever be imported by `src/frontend`.

```
cms/          THE HEART OF THE CMS
              schema.js       ← defines every editable field; drives the whole
                                admin panel, the parsing and the public output
              content.js      getContent(): the cached public content bundle
              actions.js      every server action (save, delete, reorder, login)
              parse.js        form data  → values to store
              public-actions.js  the public contact form (the one thing the
                                 frontend is allowed to import from here)
db/           schema.js  Drizzle tables      index.js  getDb() connection
auth/         index.js   sessions, bcrypt, requireAdmin  (Node runtime only)
              session-token.js  JWT verify only — Edge-safe, used by src/proxy.js
media/        cloudinary.js  uploads + credential parsing + error messages
admin-ui/     the admin panel screens (Fields, Forms, AdminNav, Charts,
              SortableList, LoginForm, PasswordForm, PageHeader).
              UI, but it exists to drive the backend, so it lives here.
seed-data/    legacy content used ONLY by `npm run db:seed` to fill a fresh
              database — projects.js and translations.js from the old site
```

Shared with the frontend and therefore NOT here: the language list and section
ids (`@shared/config.js`), the i18n helpers (`@shared/localize.js`) and the icon
maps (`@shared/icons/`).

## Rules

- **Import with `@backend/…`**, e.g. `import { getDb } from "@backend/db/index.js"`.
- Never import from `@frontend/…`. Server-only modules (`db`, `auth`, `cms/actions`, `media`) must never be
  imported into a `"use client"` component.
- After any write to the database, call `bustContent()` (in `cms/actions.js`),
  or the public site will keep showing the old content.
- `auth/session-token.js` is deliberately separate from `auth/index.js`:
  `src/proxy.js` runs on the Edge runtime and cannot load bcrypt.

## Where to change things

Add or rename an editable field: `cms/schema.js`, then add the column in
`db/schema.js` and run `npm run db:generate && npm run db:push`.
Admin panel look: `admin-ui/` + the `.admin` block in
`src/frontend/styles/globals.css`.
