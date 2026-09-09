/**
 * postcss.config.mjs — Tailwind v4 runs as a PostCSS plugin in Next.js
 * (Vite used `@tailwindcss/vite`; this is the Next equivalent).
 * Nothing to tweak here.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
