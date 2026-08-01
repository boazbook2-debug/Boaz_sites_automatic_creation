"use client";

import { useEffect, useRef, useState } from "react";

const DURATION = 5000;

// Splits a stat value like "450+", "₪280M+", or "15+" into a leading prefix,
// the number to count up to, and a trailing suffix. Ratio-style labels like
// "24/7" (suffix starting with "/") aren't a count, so they're left static.
function parseValue(value) {
  const match = /^([^\d]*)(\d+)(.*)$/.exec(value);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  if (suffix.startsWith("/")) return null;
  return { prefix, target: parseInt(digits, 10), suffix };
}

export default function AnimatedStatValue({ value, className = "" }) {
  const parsed = parseValue(value);
  const [display, setDisplay] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!parsed || started.current || !ref.current) return;
    const el = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        setVisible(true);
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / DURATION, 1);
          setDisplay(Math.round(progress * parsed.target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [parsed]);

  if (!parsed) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span
      ref={ref}
      className={className}
      style={{ opacity: visible ? 1 : 0, transition: `opacity ${DURATION}ms ease-out` }}
    >
      {parsed.prefix}
      {display}
      {parsed.suffix}
    </span>
  );
}
