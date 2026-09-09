/**
 * eslint.config.js — ESLint (flat config) for the Next.js project.
 * Uses the official Next.js rules (core web vitals) + React hooks rules.
 * Run: npm run lint
 */
import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [".next/**", "node_modules/**", "drizzle/**", "dist/**", ".drop/**"],
  },
  {
    rules: {
      // Plain <img> is used on purpose for the 43+ external/legacy screenshots.
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
