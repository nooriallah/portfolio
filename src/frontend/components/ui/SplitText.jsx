"use client";
import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * Reveals a heading word by word, each word rotating up from slightly behind
 * the page. Split on words rather than characters on purpose: Farsi and other
 * Arabic-script text is shaped within a word, so splitting characters would
 * break the letterforms.
 */
export default function SplitText({
  text,
  as: Tag = "h2",
  className = "",
  step = 46,
  delay = 0,
  threshold = 0.3,
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.unobserve(el);
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, threshold]);

  const value = String(text ?? "");
  if (reduced) {
    return (
      <Tag ref={ref} className={className}>
        {value}
      </Tag>
    );
  }

  const words = value.split(" ");

  return (
    <Tag
      ref={ref}
      data-shown={shown ? "true" : "false"}
      className={`split-text ${className}`}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span
            className="split-word"
            style={{ "--stagger-delay": `${delay + i * step}ms` }}
          >
            {word}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
