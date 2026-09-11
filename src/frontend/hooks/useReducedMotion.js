"use client";
/**
 * src/frontend/hooks/useReducedMotion.js — "prefers-reduced-motion" as a hook.
 *
 * True when the visitor has asked the OS to reduce motion. Every animation on
 * the site reads this and either stops moving or degrades to a plain fade.
 *
 * Uses useSyncExternalStore so the server render (which cannot know the
 * preference) and the first client render agree — no hydration mismatch.
 */
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false;

export default function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
