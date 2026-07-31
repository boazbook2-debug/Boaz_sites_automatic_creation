import { notFound } from "next/navigation";
import Link from "next/link";
import Gallery from "@/components/Gallery";
import AgentCard from "@/components/AgentCard";
import LeadForm from "@/components/LeadForm";
import PropertyCard from "@/components/PropertyCard";
import properties from "@/data/properties";
import agents from "@/data/agents";
import { formatPrice, statusLabel } from "@/lib/format";
import { getAgentById, getSimilarProperties } from "@/lib/properties";
import { SITE_URL } from "@/lib/siteUrl";

export function generateStaticParams() {
  return properties.map((property) => ({ id: property.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = properties.find((p) => p.id === id);
  if (!property) return { title: "נכס" };

  const description = `${property.title} ב${property.location} — ${property.rooms} חדרים, ${formatPrice(property.price, property.status)}.`;
  return {
    title: property.title,
    description,
    openGraph: { title: property.title, description, images: [{ url: property.images[0] }] },
    twitter: { card: "summary_large_image", title: property.title, description, images: [property.images[0]] },
  };
}

export default async function PropertyDetailPage({ params }) {
  const { id } = await params;
  const property = properties.find((p) => p.id === id);

  if (!property) notFound();

  const agent = getAgentById(agents, property.assignedAgentId);
  const similar = getSimilarProperties(property, properties);

  const listingSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.features.join(", "),
    url: `${SITE_URL}/properties/${property.id}`,
    image: property.images,
    address: { "@type": "PostalAddress", addressLocality: property.location, addressCountry: "IL" },
    numberOfRooms: property.rooms,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "ILS",
      availability: "https://schema.org/InStock",
      businessFunction: property.status === "rent" ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }} />
      <Gallery images={property.images} alt={property.title} />

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{property.title}</h1>
              <p className="mt-1 text-lg text-[var(--color-main)]/60">{property.location}</p>
            </div>
            <span className="text-3xl font-extrabold text-[var(--color-accent2)]">
              {formatPrice(property.price, property.status)}
            </span>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 rounded-[2rem] bg-[var(--color-surface)] p-6 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <div>
              <p className="text-2xl font-extrabold">{property.rooms}</p>
              <p className="mt-1 text-[var(--color-main)]/60">חדרים</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold">{property.type}</p>
              <p className="mt-1 text-[var(--color-main)]/60">סוג נכס</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold">{statusLabel[property.status]}</p>
              <p className="mt-1 text-[var(--color-main)]/60">סטטוס</p>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-extrabold">מאפייני הנכס</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {property.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-lg text-[var(--color-main)]/80">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent2)]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {agent && <AgentCard agent={agent} className="h-fit" />}
      </div>

      <div className="mt-12">
        <LeadForm propertyTitle={property.title} />
      </div>

      {similar.length > 0 && (
        <div className="mt-10 sm:mt-16">
          <h2 className="mb-4 text-2xl font-extrabold tracking-tight sm:mb-8 sm:text-3xl">נכסים דומים</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-8 lg:grid-cols-3">
            {similar.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/properties"
          className="inline-flex rounded-full bg-[var(--color-main)] px-8 py-3.5 text-base font-bold text-white shadow-[0_15px_35px_rgba(0,0,0,0.2)] transition hover:scale-105"
        >
          לכל הנכסים
        </Link>
      </div>
    </div>
  );
}
