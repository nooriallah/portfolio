"use client";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * Reveals its children one after another when the group scrolls into view.
 *
 * One IntersectionObserver for the whole group, and the entrance itself is
 * pure CSS driven by a per-child `--stagger-delay`. A list of forty skill
 * chips therefore costs one observer and zero per-item JavaScript.
 */
export default function Stagger({
  children,
  step = 55,
  start = 0,
  threshold = 0.12,
  className = "",
  ...rest
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

  let index = 0;
  const items = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const delay = start + index++ * step;
    return cloneElement(child, {
      className: `stagger-item ${child.props.className ?? ""}`,
      style: {
        ...(child.props.style ?? {}),
        "--stagger-delay": `${delay}ms`,
      },
    });
  });

  return (
    <div
      ref={ref}
      data-shown={reduced || shown ? "true" : "false"}
      className={className}
      {...rest}
    >
      {items}
    </div>
  );
}
