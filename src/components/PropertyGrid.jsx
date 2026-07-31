import PropertyCard from "./PropertyCard";

export default function PropertyGrid({ properties, emptyMessage = "לא נמצאו נכסים התואמים לחיפוש." }) {
  if (properties.length === 0) {
    return (
      <p className="rounded-xl bg-[var(--color-surface)] px-6 py-12 text-center text-[var(--color-main)]/60">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
