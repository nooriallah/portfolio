/**
 * src/lib/cms/schema.js — WHAT THE ADMIN PANEL CAN EDIT.
 *
 * This is the single description of every editable thing on the site:
 *  - SETTINGS_GROUPS : the "settings" table, grouped into admin pages
 *                      (Site, Hero, About, Contact, Navigation, UI texts …).
 *  - COLLECTIONS     : the list-type tables (projects, skills, services,
 *                      experience, reviews, socials).
 *
 * The admin forms are GENERATED from this file (src/components/admin/Fields.jsx),
 * and the seed script uses it too. So to add a new editable text:
 *   1. add a field here,
 *   2. read it in the component via `t.<group>.<field>`,
 *   3. run `npm run db:seed` once (or type the value in /admin).
 *
 * Field types:
 *   text | textarea | url | image | number | boolean | select | tags
 *   i18n            – one short text per language
 *   i18n-textarea   – one paragraph per language
 *   i18n-list       – a list of short texts, per language (hero roles)
 *   pairs           – list of { label: i18n, value: i18n } (About facts)
 */

// The languages the site speaks. `dir` decides LTR/RTL layout.
// To add a language: add it here, then fill its texts in /admin.
export const LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "fa", label: "فارسی", dir: "rtl" },
  { code: "ps", label: "پښتو", dir: "rtl" },
];
export const DEFAULT_LANG = "en";
export const LANG_CODES = LANGUAGES.map((l) => l.code);

// Section ids: used as element ids, scroll targets and nav keys.
export const NAV_IDS = [
  "home",
  "about",
  "work",
  "experience",
  "skills",
  "services",
  "reviews",
  "contact",
];

/* ================================================================== *
 * SETTINGS GROUPS  (each group = one row in the `settings` table)
 * ================================================================== */
export const SETTINGS_GROUPS = [
  {
    key: "site",
    label: "Site",
    description: "Identity, images and files used across the whole site.",
    fields: [
      { name: "title", type: "text", label: "Browser tab title" },
      { name: "description", type: "textarea", label: "Meta description (SEO)" },
      { name: "themeColor", type: "text", label: "Theme colour (hex)" },
      { name: "logo", type: "image", label: "Logo" },
      { name: "heroImage", type: "image", label: "Hero portrait (optional)" },
      { name: "aboutImage", type: "image", label: "About photo (fallback for the 3D scene)" },
      { name: "qrImage", type: "image", label: "Contact QR code" },
      { name: "cvUrl", type: "url", label: "CV file URL (PDF)" },
      { name: "cvFileName", type: "text", label: "CV download file name" },
    ],
  },
  {
    key: "hero",
    label: "Hero",
    description: "The first screen visitors see.",
    fields: [
      { name: "greeting", type: "i18n", label: "Greeting (\"Hi, I'm\")" },
      { name: "name", type: "i18n", label: "Your name" },
      {
        name: "intro",
        type: "i18n",
        label: "Intro line — keep {role} where the rotating word goes",
      },
      { name: "tagline", type: "i18n-textarea", label: "Tagline" },
      { name: "roles", type: "i18n-list", label: "Rotating roles (one per line)" },
      { name: "highlights", type: "tags", label: "Highlighted technologies (chips)" },
    ],
  },
  {
    key: "about",
    label: "About",
    fields: [
      { name: "heading", type: "i18n", label: "Heading" },
      { name: "text", type: "i18n-textarea", label: "Paragraph" },
      { name: "facts", type: "pairs", label: "Quick facts (label → value)" },
    ],
  },
  {
    key: "contact",
    label: "Contact",
    fields: [
      { name: "email", type: "text", label: "Email address" },
      { name: "phone", type: "text", label: "Phone (as displayed)" },
      { name: "phoneLink", type: "url", label: "Phone link (tel: or WhatsApp URL)" },
      { name: "location", type: "i18n", label: "Location" },
      { name: "emailLabel", type: "i18n", label: "Label: Email" },
      { name: "phoneLabel", type: "i18n", label: "Label: Phone" },
      { name: "locationLabel", type: "i18n", label: "Label: Location" },
      { name: "qrText", type: "i18n", label: "Text next to the QR code" },
    ],
  },
  {
    key: "form",
    label: "Contact form",
    description: "Placeholders and messages of the contact form.",
    fields: [
      { name: "name", type: "i18n", label: "Name placeholder" },
      { name: "email", type: "i18n", label: "Email placeholder" },
      { name: "subject", type: "i18n", label: "Subject placeholder" },
      { name: "message", type: "i18n", label: "Message placeholder" },
      { name: "send", type: "i18n", label: "Send button" },
      { name: "sending", type: "i18n", label: "Sending… state" },
      { name: "sent", type: "i18n", label: "Success message" },
      { name: "error", type: "i18n", label: "Error message" },
    ],
  },
  {
    key: "sections",
    label: "Section titles",
    description: "Eyebrow (small label) and title of each section.",
    fields: NAV_IDS.filter((id) => id !== "home").flatMap((id) => [
      { name: `${id}Eyebrow`, type: "i18n", label: `${id} — eyebrow` },
      { name: `${id}Title`, type: "i18n", label: `${id} — title` },
    ]).concat([
      { name: "workVisit", type: "i18n", label: "Work card — \"Visit website\"" },
      { name: "workNote", type: "i18n", label: "Work — note under the grid" },
      { name: "workPerPage", type: "number", label: "Work — projects per page" },
      { name: "experienceHeading", type: "i18n", label: "Experience column heading" },
      { name: "educationHeading", type: "i18n", label: "Education column heading" },
    ]),
  },
  {
    key: "nav",
    label: "Navigation",
    fields: NAV_IDS.map((id) => ({ name: id, type: "i18n", label: id })),
  },
  {
    key: "ui",
    label: "Buttons & UI texts",
    fields: [
      { name: "hireMe", type: "i18n", label: "Hire me" },
      { name: "downloadCv", type: "i18n", label: "Download CV" },
      { name: "viewWork", type: "i18n", label: "View work" },
      { name: "prevPage", type: "i18n", label: "Previous page (aria)" },
      { name: "nextPage", type: "i18n", label: "Next page (aria)" },
      { name: "page", type: "i18n", label: "Page (aria)" },
      { name: "rights", type: "i18n", label: "Footer — all rights reserved" },
    ],
  },
];

/* ================================================================== *
 * COLLECTIONS  (list-type tables)
 *   table     – the Drizzle table name exported from src/lib/db/schema.js
 *   titleField– which field to show in the admin list
 *   fields    – editable columns (id / sort are handled automatically)
 * ================================================================== */
export const COLLECTIONS = {
  projects: {
    label: "Projects",
    singular: "Project",
    table: "projects",
    titleField: "title",
    fields: [
      { name: "title", type: "i18n", label: "Title", required: true },
      { name: "description", type: "i18n-textarea", label: "Short description" },
      { name: "role", type: "i18n", label: "My role" },
      { name: "category", type: "text", label: "Category (WordPress, Custom Code …)" },
      { name: "tech", type: "tags", label: "Technologies" },
      { name: "image", type: "image", label: "Screenshot", required: true },
      { name: "url", type: "url", label: "Live URL (leave empty if none)" },
      { name: "published", type: "boolean", label: "Published" },
    ],
  },
  skills: {
    label: "Skills",
    singular: "Skill group",
    table: "skillGroups",
    titleField: "label",
    fields: [
      { name: "key", type: "text", label: "Key (unique, e.g. frontend)", required: true },
      { name: "icon", type: "select", label: "Icon", options: "lucide" },
      { name: "label", type: "i18n", label: "Group name", required: true },
      { name: "items", type: "tags", label: "Technologies" },
    ],
  },
  services: {
    label: "Services",
    singular: "Service",
    table: "services",
    titleField: "title",
    fields: [
      { name: "key", type: "text", label: "Key (unique)", required: true },
      { name: "icon", type: "select", label: "Icon", options: "lucide" },
      { name: "title", type: "i18n", label: "Title", required: true },
      { name: "description", type: "i18n-textarea", label: "Description", required: true },
    ],
  },
  experience: {
    label: "Experience & Education",
    singular: "Entry",
    table: "experience",
    titleField: "title",
    fields: [
      {
        name: "kind",
        type: "select",
        label: "Column",
        options: [
          { value: "work", label: "Experience" },
          { value: "education", label: "Education" },
        ],
      },
      { name: "year", type: "i18n", label: "Period (e.g. 2021 — Present)", required: true },
      { name: "title", type: "i18n", label: "Title", required: true },
      { name: "place", type: "i18n", label: "Company / school", required: true },
      { name: "description", type: "i18n-textarea", label: "Description", required: true },
    ],
  },
  reviews: {
    label: "Reviews",
    singular: "Review",
    table: "reviews",
    titleField: "name",
    fields: [
      { name: "name", type: "text", label: "Client name", required: true },
      { name: "image", type: "image", label: "Photo" },
      { name: "role", type: "i18n", label: "Role / company", required: true },
      { name: "text", type: "i18n-textarea", label: "Quote", required: true },
      { name: "published", type: "boolean", label: "Published" },
    ],
  },
  socials: {
    label: "Social links",
    singular: "Link",
    table: "socials",
    titleField: "name",
    fields: [
      { name: "name", type: "text", label: "Name", required: true },
      { name: "icon", type: "select", label: "Icon", options: "brand" },
      { name: "url", type: "url", label: "URL", required: true },
    ],
  },
};

/** Empty i18n value: { en: "", fa: "", ps: "" } */
export function emptyI18n() {
  return Object.fromEntries(LANG_CODES.map((c) => [c, ""]));
}

/** Same text in every language — handy for names / brands that never change. */
export function sameI18n(text) {
  return Object.fromEntries(LANG_CODES.map((c) => [c, text]));
}
