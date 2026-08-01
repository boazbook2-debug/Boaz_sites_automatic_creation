import { notFound } from "next/navigation";
import Link from "next/link";
import Gallery from "@/components/Gallery";
import AgentCard from "@/components/AgentCard";
import LeadForm from "@/components/LeadForm";
import PropertyCard from "@/components/PropertyCard";
import properties from "@/data/properties";
import agents from "@/data/agents";
import agency from "@/data/agency";
import { formatPrice, statusLabel } from "@/lib/format";
import { getAgentById, getSimilarProperties } from "@/lib/properties";
import { SITE_URL } from "@/lib/siteUrl";
import { pageMetadata, jsonLdScript } from "@/lib/seo";

export function generateStaticParams() {
  return properties.map((property) => ({ id: property.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = properties.find((p) => p.id === id);
  if (!property) return { title: "נכס" };

  const description = `${property.title} ב${property.location} — ${property.rooms} חדרים, ${statusLabel[property.status]} ב${formatPrice(property.price, property.status)}. ${property.features.slice(0, 3).join(", ")}.`;
  return pageMetadata({
    title: property.title,
    description,
    path: `/properties/${property.id}`,
    keywords: `${property.title}, ${property.location}, ${property.type}, ${statusLabel[property.status]}, ${agency.name}, נדל״ן`,
    image: property.images[0],
    properties,
  });
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "עמוד הבית", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "כל הנכסים", item: `${SITE_URL}/properties` },
      { "@type": "ListItem", position: 3, name: property.title, item: `${SITE_URL}/properties/${property.id}` },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 sm:py-10 lg:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(listingSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema)} />
      <Gallery images={property.images} alt={property.title} />

      <div className="mt-5 grid gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{property.title}</h1>
              <p className="mt-1 text-sm text-[var(--color-main)]/60 sm:text-lg">{property.location}</p>
            </div>
            <span className="text-xl font-extrabold text-[var(--color-accent2)] sm:text-3xl">
              {formatPrice(property.price, property.status)}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-[var(--color-surface)] p-3 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:mt-6 sm:gap-4 sm:rounded-[2rem] sm:p-6">
            <div>
              <p className="text-lg font-extrabold sm:text-2xl">{property.rooms}</p>
              <p className="mt-0.5 text-xs text-[var(--color-main)]/60 sm:mt-1 sm:text-base">חדרים</p>
            </div>
            <div>
              <p className="text-lg font-extrabold sm:text-2xl">{property.type}</p>
              <p className="mt-0.5 text-xs text-[var(--color-main)]/60 sm:mt-1 sm:text-base">סוג נכס</p>
            </div>
            <div>
              <p className="text-lg font-extrabold sm:text-2xl">{statusLabel[property.status]}</p>
              <p className="mt-0.5 text-xs text-[var(--color-main)]/60 sm:mt-1 sm:text-base">סטטוס</p>
            </div>
          </div>

          <div className="mt-5 sm:mt-8">
            <h2 className="text-lg font-extrabold sm:text-2xl">מאפייני הנכס</h2>
            <ul className="mt-2.5 grid gap-2 sm:mt-4 sm:gap-3 sm:grid-cols-2">
              {property.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-[var(--color-main)]/80 sm:text-lg">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent2)] sm:h-2 sm:w-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {agent && <AgentCard agent={agent} className="h-fit" />}
      </div>

      <div className="mt-6 sm:mt-10">
        <LeadForm propertyTitle={property.title} toEmail={agent?.email} />
      </div>

      {similar.length > 0 && (
        <div className="mt-6 sm:mt-12">
          <h2 className="mb-3 text-lg font-extrabold tracking-tight sm:mb-6 sm:text-3xl">נכסים דומים</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-8 lg:grid-cols-3">
            {similar.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 text-center sm:mt-10">
        <Link
          href="/properties"
          className="inline-flex rounded-full bg-[var(--color-main)] px-6 py-3 text-sm font-bold text-white shadow-[0_15px_35px_rgba(0,0,0,0.2)] transition hover:scale-105 sm:px-8 sm:py-3.5 sm:text-base"
        >
          לכל הנכסים
        </Link>
      </div>
    </div>
  );
}
