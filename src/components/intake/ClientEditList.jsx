import properties from "@/data/properties";
import { formatPrice } from "@/lib/format";
import { SectionCard } from "./FormField";

export default function ClientEditList({ client, onSelect, onBack }) {
  const myProperties = properties.filter((p) => client.propertyIds.includes(p.id));

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-14 lg:px-10">
      <button type="button" onClick={onBack} className="text-sm font-semibold text-[var(--color-main)]/60">
        ← חזרה
      </button>

      <SectionCard title="הנכסים שלי" description="בחרו נכס לעריכה">
        {myProperties.length === 0 && (
          <p className="text-[var(--color-main)]/60">לא נמצאו נכסים המשויכים לחשבון זה.</p>
        )}
        <div className="space-y-3">
          {myProperties.map((property) => (
            <button
              key={property.id}
              type="button"
              onClick={() => onSelect(property)}
              className="flex w-full items-center justify-between rounded-xl border border-[var(--color-main)]/10 p-5 text-right transition hover:border-[var(--color-accent2)]"
            >
              <div>
                <p className="font-bold">{property.title}</p>
                <p className="text-sm text-[var(--color-main)]/60">{property.location}</p>
              </div>
              <span className="font-bold text-[var(--color-accent2)]">
                {formatPrice(property.price, property.status)}
              </span>
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
