import Link from "next/link";
import SampleImage from "./SampleImage";
import { formatPrice, statusLabel } from "@/lib/format";

// Single responsive card: compact (image + name/location/rooms) below the lg
// breakpoint, full detail (price/rooms/type row) at lg+ — used identically
// everywhere a property grid appears sitewide.
export default function PropertyCard({ property, className = "" }) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className={`group block overflow-hidden rounded-2xl bg-[var(--color-background)] shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(0,0,0,0.14)] lg:rounded-[2rem] lg:hover:-translate-y-2 lg:hover:shadow-[0_24px_48px_rgba(0,0,0,0.18)] ${className}`}
    >
      <SampleImage
        src={property.images[0]}
        alt={property.title}
        className="aspect-[4/3]"
        imgClassName="transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      >
        <span
          className={`absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-medium text-white lg:right-3 lg:top-3 lg:px-3 lg:py-1 lg:text-xs ${
            property.status === "sale" ? "bg-[var(--color-accent1)]" : "bg-[var(--color-accent2)]"
          }`}
        >
          {statusLabel[property.status]}
        </span>
      </SampleImage>

      <div className="p-3 lg:p-6">
        <p className="truncate text-sm font-bold tracking-tight lg:text-xl">{property.title}</p>
        <p className="mt-0.5 truncate text-xs text-[var(--color-main)]/60 lg:mt-1 lg:text-base">{property.location}</p>
        <p className="mt-1 text-xs text-[var(--color-main)]/50 lg:hidden">{property.rooms} חדרים</p>
        <p className="mt-0.5 text-sm font-extrabold text-[var(--color-accent2)] lg:hidden">
          {formatPrice(property.price, property.status)}
        </p>

        <div className="mt-4 hidden items-center justify-between border-t border-[var(--color-main)]/10 pt-4 lg:flex lg:mt-5 lg:pt-5">
          <span className="text-xl font-extrabold text-[var(--color-accent2)]">
            {formatPrice(property.price, property.status)}
          </span>
          <span className="font-medium text-[var(--color-main)]/70">
            {property.rooms} חדרים · {property.type}
          </span>
        </div>
      </div>
    </Link>
  );
}
