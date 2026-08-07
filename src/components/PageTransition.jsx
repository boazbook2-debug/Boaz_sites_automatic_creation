"use client";

import { usePathname } from "next/navigation";

// Keying on pathname forces React to remount this wrapper on every route
// change, which replays the CSS mount animation — a lightweight page
// transition with no extra libraries.
export default function PageTransition({ children }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}
