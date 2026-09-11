# `src/shared` — used by BOTH the site and the backend

Only three things genuinely belong to both sides. They live here so that
`src/frontend` never has to import from `src/backend`.

```
config.js     LANGUAGES, DEFAULT_LANG, LANG_CODES, NAV_IDS.
              The site renders from them; the CMS defines fields from them
              (src/backend/cms/schema.js re-exports them for convenience).
localize.js   isI18n / pick / localize — turn a stored { en, fa, ps } object
              into a plain string. Pure functions, safe on server and client.
icons/        BrandIcons.jsx (the SVG set) and index.js (name → component),
              used by the public site AND by the admin panel's icon fields.
```

## Rules

- Import with `@shared/…`.
- **Nothing here may import from `@frontend/…` or `@backend/…`.** If a file
  needs either, it does not belong in this folder.
- Keep it small. `shared/` is not a dumping ground for anything awkward — a
  thing earns its place here only by being genuinely needed on both sides.

## Where to change things

Add a language, or rename/reorder the page sections: `config.js`.
Add a brand icon: `icons/BrandIcons.jsx`, then map its name in `icons/index.js`.
