"use client";

import { useEffect, useRef, useState } from "react";

// Wraps any section/card so it fades + rises into place whenever it scrolls
// into view — and fades back out if it scrolls back past the threshold
// (scrolling up reverses the animation instead of leaving it revealed
// forever). Styling lives in globals.css under [data-reveal]. `delay` (ms)
// staggers a group of siblings; `as` picks the wrapper tag so this never has
// to introduce an extra <div> where a <section> etc is expected.
export default function Reveal({ children, delay = 0, as: Tag = "div", className = "" }) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setRevealed(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal
      data-reveal-size={Tag === "section" ? "lg" : "sm"}
      data-revealed={revealed}
      style={{ transitionDelay: revealed ? `${delay}ms` : "0ms" }}
      className={className}
    >
      {children}
    </Tag>
  );
}
