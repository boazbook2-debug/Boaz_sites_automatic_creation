"use client";

import { useRef } from "react";

const MAX_PULL = 8; // px — kept small so it reads as "premium," not gimmicky

// Wraps a single CTA (Link/button) so it drifts slightly toward the cursor
// on hover, then eases back on leave. Desktop-only by nature — touch devices
// never fire mousemove here, so it's inert (and harmless) on mobile.
export default function MagneticButton({ children, className = "" }) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${(relX / rect.width) * MAX_PULL}px, ${(relY / rect.height) * MAX_PULL}px)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "translate(0, 0)";
  };

  return (
    <span
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      className={`inline-block transition-transform duration-200 ease-out ${className}`}
    >
      {children}
    </span>
  );
}
