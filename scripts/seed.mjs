/**
 * scripts/seed.mjs — FILL THE DATABASE WITH THE CURRENT SITE CONTENT.
 *
 * Run once after `npm run db:push`:
 *     npm run db:seed
 *
 * What it does:
 *  1. Inserts every settings group (site, hero, about, …) — skipped if the
 *     row already exists, so your admin edits are never overwritten.
 *  2. Inserts projects, skills, services, experience, reviews and socials —
 *     only when that table is still EMPTY.
 *  3. Creates the first admin user from ADMIN_EMAIL / ADMIN_PASSWORD in
 *     .env.local (skipped if that email already exists).
 *
 * The texts come from the old hard-coded files
 * (src/backend/seed-data/translations.js and .../projects.js), which are
 * kept only as the seed source and are no longer used by the site itself.
 */
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { getDb, schema } from "../src/backend/db/index.js";
import { translations } from "../src/backend/seed-data/translations.js";
import { projects as legacyProjects } from "../src/backend/seed-data/projects.js";

const { en, fa, ps } = translations;

/** Build an i18n object from a getter applied to each language. */
const i18n = (get) => ({ en: get(en) ?? "", fa: get(fa) ?? "", ps: get(ps) ?? "" });
const same = (text) => ({ en: text, fa: text, ps: text });

/* ------------------------------------------------------------------ *
 * 1. SETTINGS
 * ------------------------------------------------------------------ */
const SETTINGS = {
  site: {
    title: "Noorullah Qayoumi — Web Developer",
    description: "Noorullah Qayoumi — Web Developer, Programmer & Freelancer.",
    themeColor: "#2563eb",
    logo: "https://nooriallah.netlify.app/img/logo.webp",
    heroImage: "https://nooriallah.netlify.app/img/me/hero_pic3.webp",
    aboutImage: "https://nooriallah.netlify.app/img/me/about_pic.webp",
    qrImage: "https://nooriallah.netlify.app/img/qrcode.png",
    cvUrl: "/cv/Noorullah_Qayoumi_CV.pdf",
    cvFileName: "Noorullah_Qayoumi_CV.pdf",
  },
  hero: {
    greeting: i18n((t) => t.hero.greeting),
    name: i18n((t) => t.hero.name),
    intro: i18n((t) => t.hero.intro),
    tagline: i18n((t) => t.hero.tagline),
    roles: i18n((t) => t.roles), // i18n-list: array per language
    highlights: ["React.js", "Laravel", "Tailwind CSS"],
  },
  about: {
    heading: i18n((t) => t.about.heading),
    text: i18n((t) => t.about.text),
    facts: en.about.facts.map((_, i) => ({
      label: i18n((t) => t.about.facts[i][0]),
      value: i18n((t) => t.about.facts[i][1]),
    })),
  },
  contact: {
    email: "nooriallah18@gmail.com",
    phone: "+93 (0) 773 77 17 16",
    phoneLink: "https://wa.link/qz0jh5",
    location: i18n((t) => t.contact.items[2].value),
    emailLabel: i18n((t) => t.contact.items[0].label),
    phoneLabel: i18n((t) => t.contact.items[1].label),
    locationLabel: i18n((t) => t.contact.items[2].label),
    qrText: i18n((t) => t.contact.qrText),
  },
  form: Object.fromEntries(
    ["name", "email", "subject", "message", "send", "sending", "sent", "error"].map(
      (k) => [k, i18n((t) => t.contact.form[k])],
    ),
  ),
  sections: {
    ...Object.fromEntries(
      ["about", "work", "experience", "skills", "services", "reviews", "contact"].flatMap(
        (id) => [
          [`${id}Eyebrow`, i18n((t) => t.sections[id].eyebrow)],
          [`${id}Title`, i18n((t) => t.sections[id].title)],
        ],
      ),
    ),
    workVisit: i18n((t) => t.sections.work.visit),
    workNote: i18n((t) => t.workNote),
    workPerPage: 9,
    experienceHeading: i18n((t) => t.experience.heading),
    educationHeading: i18n((t) => t.education.heading),
  },
  nav: Object.fromEntries(
    Object.keys(en.nav).map((id) => [id, i18n((t) => t.nav[id])]),
  ),
  ui: {
    ...Object.fromEntries(
      Object.keys(en.ui).map((k) => [k, i18n((t) => t.ui[k])]),
    ),
    rights: i18n((t) => t.footer.rights),
  },
};

/* ------------------------------------------------------------------ *
 * 2. COLLECTIONS
 * ------------------------------------------------------------------ */
const SKILLS = [
  { key: "frontend", icon: "Layout", items: ["HTML5", "CSS3", "JavaScript", "React.js", "jQuery", "Tailwind CSS", "Bootstrap 5"] },
  { key: "backend", icon: "Server", items: ["PHP", "Laravel", "Livewire"] },
  { key: "databases", icon: "Database", items: ["MySQL", "SQLlite"] },
  { key: "tools", icon: "Wrench", items: ["WordPress", "Webflow", "OJS", "Git", "STRAPI"] },
  { key: "languages", icon: "Code2", items: ["PHP", "JavaScript", "Java", "Python"] },
].map((s, i) => ({ ...s, label: i18n((t) => t.skills[s.key]), sort: i }));

const SERVICES = [
  { key: "frontend", icon: "Layout" },
  { key: "backend", icon: "Server" },
  { key: "cms", icon: "Globe" },
  { key: "apps", icon: "Code2" },
  { key: "db", icon: "Database" },
  { key: "support", icon: "Wrench" },
].map((s, i) => ({
  ...s,
  title: i18n((t) => t.services[s.key].title),
  description: i18n((t) => t.services[s.key].desc),
  sort: i,
}));

const EXPERIENCE = [
  ...en.experience.items.map((_, i) => ({
    kind: "work",
    year: i18n((t) => t.experience.items[i].year),
    title: i18n((t) => t.experience.items[i].title),
    place: i18n((t) => t.experience.items[i].place),
    description: i18n((t) => t.experience.items[i].desc),
    sort: i,
  })),
  ...en.education.items.map((_, i) => ({
    kind: "education",
    year: i18n((t) => t.education.items[i].year),
    title: i18n((t) => t.education.items[i].title),
    place: i18n((t) => t.education.items[i].place),
    description: i18n((t) => t.education.items[i].desc),
    sort: i,
  })),
];

const REVIEWS = [
  { name: "S. Basir Rashha", image: "https://nooriallah.netlify.app/img/clients/testimonial-1.jpg" },
  { name: "Omid Amini", image: "https://nooriallah.netlify.app/img/clients/testimonial-2.jpg" },
  { name: "Hussain Rajabi", image: "https://nooriallah.netlify.app/img/clients/testimonial-3.jpg" },
].map((r, i) => ({
  ...r,
  role: i18n((t) => t.reviews[i].role),
  text: i18n((t) => t.reviews[i].text),
  sort: i,
}));

const SOCIALS = [
  { name: "GitHub", icon: "github", url: "https://github.com/nooriallah/" },
  { name: "LinkedIn", icon: "linkedin", url: "https://www.linkedin.com/in/eng-nooriallah/" },
  { name: "Facebook", icon: "facebook", url: "https://www.facebook.com/eng.noorullah0" },
  { name: "Instagram", icon: "instagram", url: "https://www.instagram.com/eng.noorullah_/" },
].map((s, i) => ({ ...s, sort: i }));

const PROJECTS = legacyProjects.map((p, i) => ({
  title: same(p.title),
  description: same(""),
  role: same(""),
  tech: [],
  category: p.category,
  image: "/" + p.image.replace(/^\/+/, ""), // "img/…" → "/img/…" (served from public/)
  url: p.url || null,
  sort: i,
  published: true,
}));

/* ------------------------------------------------------------------ *
 * 3. RUN
 * ------------------------------------------------------------------ */
async function seedTableIfEmpty(db, table, rows, name) {
  const [{ count }] = await db.select({ count: sql`count(*)::int` }).from(table);
  if (count > 0) {
    console.log(`• ${name}: already has ${count} rows — skipped`);
    return;
  }
  await db.insert(table).values(rows);
  console.log(`✓ ${name}: inserted ${rows.length} rows`);
}

async function main() {
  const db = await getDb();

  // Settings — insert only the groups that do not exist yet.
  for (const [key, value] of Object.entries(SETTINGS)) {
    const res = await db
      .insert(schema.settings)
      .values({ key, value })
      .onConflictDoNothing()
      .returning({ key: schema.settings.key });
    console.log(res.length ? `✓ settings.${key} inserted` : `• settings.${key} exists — skipped`);
  }

  await seedTableIfEmpty(db, schema.projects, PROJECTS, "projects");
  await seedTableIfEmpty(db, schema.skillGroups, SKILLS, "skill_groups");
  await seedTableIfEmpty(db, schema.services, SERVICES, "services");
  await seedTableIfEmpty(db, schema.experience, EXPERIENCE, "experience");
  await seedTableIfEmpty(db, schema.reviews, REVIEWS, "reviews");
  await seedTableIfEmpty(db, schema.socials, SOCIALS, "socials");

  // First admin user.
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const passwordHash = await bcrypt.hash(password, 12);
    const res = await db
      .insert(schema.adminUsers)
      .values({ email: email.toLowerCase(), passwordHash })
      .onConflictDoNothing()
      .returning({ id: schema.adminUsers.id });
    console.log(res.length ? `✓ admin user ${email} created` : `• admin user ${email} exists — skipped`);
  } else {
    console.log("• ADMIN_EMAIL / ADMIN_PASSWORD not set — no admin user created");
  }

  console.log("\nDone. Start the site with `npm run dev` and open /admin.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
