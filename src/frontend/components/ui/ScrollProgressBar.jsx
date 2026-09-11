"use client";
import { usePageProgress } from "../../hooks/useScrollProgress.js";
import { useLang } from "@frontend/i18n/LanguageProvider.jsx";

/** Reading progress for the whole page, as a hairline under the header. */
export default function ScrollProgressBar() {
  const { dir } = useLang();
  usePageProgress();

  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-px bg-accent/70"
      style={{
        transform: "scaleX(var(--page-progress, 0))",
        transformOrigin: dir === "rtl" ? "100% 50%" : "0 50%",
      }}
    />
  );
}
