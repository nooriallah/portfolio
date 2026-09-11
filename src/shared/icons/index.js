/**
 * src/shared/icons/index.js — ICON NAME → COMPONENT.
 *
 * The database stores icons as plain names ("Layout", "github"), never as
 * components. This file turns those names back into React components for the
 * public site, and gives the admin panel the list of allowed names.
 *
 * To offer a new lucide icon in the admin dropdown: import it from
 * "lucide-react" and add it to LUCIDE_ICONS.
 */
import {
  Layout,
  Server,
  Database,
  Wrench,
  Code2,
  Globe,
  Smartphone,
  Palette,
  ShoppingCart,
  Cloud,
  Shield,
  Zap,
  Cpu,
  PenTool,
  Search,
  BarChart3,
  Rocket,
  Terminal,
} from "lucide-react";
import {
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Telegram,
  Whatsapp,
  Dribbble,
  Behance,
} from "./BrandIcons.jsx";

// General purpose icons (skills, services).
export const LUCIDE_ICONS = {
  Layout,
  Server,
  Database,
  Wrench,
  Code2,
  Globe,
  Smartphone,
  Palette,
  ShoppingCart,
  Cloud,
  Shield,
  Zap,
  Cpu,
  PenTool,
  Search,
  BarChart3,
  Rocket,
  Terminal,
};

// Social network icons (socials table).
export const BRAND_ICONS = {
  github: Github,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  telegram: Telegram,
  whatsapp: Whatsapp,
  dribbble: Dribbble,
  behance: Behance,
};

export const LUCIDE_ICON_NAMES = Object.keys(LUCIDE_ICONS);
export const BRAND_ICON_NAMES = Object.keys(BRAND_ICONS);

/** Returns the component for a lucide icon name, falling back to Code2. */
export function lucideIcon(name) {
  return LUCIDE_ICONS[name] || Code2;
}

/** Returns the component for a brand icon name, falling back to Globe. */
export function brandIcon(name) {
  return BRAND_ICONS[name] || Globe;
}
