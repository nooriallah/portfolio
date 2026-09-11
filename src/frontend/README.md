# `src/frontend` — everything the visitor sees

The public portfolio: React components, 3D scenes, hooks, styling. Nothing in
here talks to the database, reads a cookie on the server, or touches a secret.

```
components/        the page sections — Hero, About, Work, Experience, Skills,
                   Services, Reviews, Contact, Navbar, Footer + Site.jsx which
                   stacks them, and the theme / language switch buttons
components/three/  the 3D scenes (hero, backdrop, the desk character)
components/ui/     small reusable pieces — Reveal, Tilt, Section, SplitText,
                   Stagger, Pagination, ScrollProgressBar
hooks/             scroll, pointer, parallax, device-tier, reduced-motion
i18n/              LanguageProvider — turns the content bundle into `t` for the
                   active language (en / fa / ps)
styles/globals.css ALL design tokens, light + dark, RTL, and the admin palette
utils/             small browser helpers
assets/            images imported by components
```

## Rules

- **Import with `@frontend/…`**, e.g. `import Hero from "@frontend/components/Hero.jsx"`.
- Frontend code must not import from `@backend/…`, with exactly **one**
  deliberate exception: `Contact.jsx` imports the `sendMessage` server action,
  which is this app's equivalent of calling an API endpoint. If you find
  yourself wanting a second exception, the thing you need probably belongs in
  `@shared/` instead.
- Data arrives as **props**: `src/app/page.jsx` loads it on the server and
  passes it down through `Providers` → `Site`. Keeping it that way is what
  makes this split real rather than decorative.
- Things both sides need — the language list, the section ids, the i18n
  helpers, the icon maps — live in `src/shared/`.
- Components read text from the `t` object (`useLang()`), never hard-coded
  strings, so everything stays editable in the admin panel and translatable.

## Where to change things

Colours, fonts and spacing tokens: `styles/globals.css` (top of the file).
A section's layout or markup: the matching file in `components/`.
A 3D scene: `components/three/`.
