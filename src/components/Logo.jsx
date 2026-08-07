import Link from "next/link";
import agency from "@/data/agency";
import { HouseIcon } from "./Icons";

const SIZES = {
  default: { icon: "h-8 w-8", image: "h-16", text: "text-xl sm:text-2xl", gap: "gap-2" },
  large: { icon: "h-16 w-16 sm:h-20 sm:w-20", image: "h-16 sm:h-20", text: "text-4xl sm:text-5xl", gap: "gap-4" },
};

export default function Logo({ size = "default", className = "" }) {
  const s = SIZES[size];

  if (agency.logo) {
    return (
      <Link href="/" className={`inline-flex items-center ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- uploaded logo has no known dimensions for next/image */}
        <img src={agency.logo} alt={agency.name} className={`${s.image} w-auto object-contain`} />
      </Link>
    );
  }

  return (
    <Link href="/" className={`inline-flex items-center ${s.gap} ${className}`}>
      <HouseIcon
        className={`${s.icon} shrink-0 text-[var(--color-accent2)] drop-shadow-[0_8px_20px_rgba(176,141,87,0.55)]`}
      />
      <span className={`${s.text} font-extrabold tracking-tight`}>{agency.name}</span>
    </Link>
  );
}
