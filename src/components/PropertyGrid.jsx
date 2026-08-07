import PropertyCard from "./PropertyCard";
import Reveal from "./Reveal";

export default function PropertyGrid({ properties, emptyMessage = "לא נמצאו נכסים התואמים לחיפוש." }) {
  if (properties.length === 0) {
    return (
      <p className="rounded-xl bg-[var(--color-surface)] px-6 py-12 text-center text-[var(--color-main)]/60">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-8 lg:grid-cols-3">
      {properties.map((property, i) => (
        <Reveal key={property.id} delay={i * 90}>
          <PropertyCard property={property} />
        </Reveal>
      ))}
    </div>
  );
}
