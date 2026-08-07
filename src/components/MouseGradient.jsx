"use client";

import { useEffect, useRef } from "react";

// A very subtle radial-gradient blob that drifts toward the cursor — pure
// ambiance, never interactive, skipped entirely on touch devices and for
// visitors who prefer reduced motion. Position is written straight to the
// DOM via a ref (no re-renders) and rAF-throttled.
export default function MouseGradient() {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = null;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;

    const apply = () => {
      if (ref.current) {
        ref.current.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
      }
      raf = null;
    };
    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 -z-10 hidden h-[600px] w-[600px] rounded-full opacity-[0.06] blur-3xl transition-transform duration-700 ease-out will-change-transform sm:block"
      style={{ background: "radial-gradient(circle, var(--color-accent2) 0%, transparent 70%)" }}
    />
  );
}
