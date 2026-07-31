import Link from "next/link";
import SampleImage from "./SampleImage";
import { formatPrice, statusLabel } from "@/lib/format";

export default function PropertyCard({ property }) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block overflow-hidden rounded-[2rem] bg-[var(--color-background)] shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(0,0,0,0.18)]"
    >
      <SampleImage
        src={property.images[0]}
        alt={property.title}
        className="aspect-[4/3]"
        imgClassName="transition-transform duration-500 group-hover:scale-105"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      >
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium text-white ${
            property.status === "sale" ? "bg-[var(--color-accent1)]" : "bg-[var(--color-accent2)]"
          }`}
        >
          {statusLabel[property.status]}
        </span>
      </SampleImage>

      <div className="p-6">
        <p className="text-xl font-bold tracking-tight">{property.title}</p>
        <p className="mt-1 text-[var(--color-main)]/60">{property.location}</p>

        <div className="mt-5 flex items-center justify-between border-t border-[var(--color-main)]/10 pt-5">
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
