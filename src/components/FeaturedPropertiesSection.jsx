import Link from "next/link";
import PropertyGrid from "./PropertyGrid";

export default function FeaturedPropertiesSection({ properties, limit = 3 }) {
  return (
    <section className="bg-[var(--color-surface)] py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">נכסים נבחרים</h2>
        </div>
        <PropertyGrid properties={properties.slice(0, limit)} />
        <div className="mt-8 text-center">
          <Link
            href="/properties"
            className="inline-flex rounded-full bg-[var(--color-main)] px-8 py-3.5 text-base font-bold text-white shadow-[0_15px_35px_rgba(0,0,0,0.2)] transition hover:scale-105"
          >
            לכל הנכסים
          </Link>
        </div>
      </div>
    </section>
  );
}
