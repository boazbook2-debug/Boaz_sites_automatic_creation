import { notFound } from "next/navigation";
import SampleImage from "@/components/SampleImage";
import ContactButtons from "@/components/ContactButtons";
import PropertyGrid from "@/components/PropertyGrid";
import LeadForm from "@/components/LeadForm";
import { QuoteIcon } from "@/components/Icons";
import agents from "@/data/agents";
import properties from "@/data/properties";
import agency from "@/data/agency";
import { pageMetadata, jsonLdScript } from "@/lib/seo";
import { SITE_URL } from "@/lib/siteUrl";

export function generateStaticParams() {
  return agents.map((agent) => ({ id: agent.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const agent = agents.find((a) => a.id === id);
  if (!agent) return { title: "סוכן" };

  const description = `${agent.name}, ${agent.role} ב${agency.name}. ${agent.bio?.slice(0, 130) ?? ""}`;
  return pageMetadata({
    title: agent.name,
    description,
    path: `/agents/${agent.id}`,
    keywords: `${agent.name}, ${agent.role}, ${agency.name}, סוכן נדל״ן`,
    image: agent.photo,
    properties,
  });
}

export default async function AgentProfilePage({ params }) {
  const { id } = await params;
  const agent = agents.find((a) => a.id === id);

  if (!agent) notFound();

  const agentProperties = properties.filter((p) => p.assignedAgentId === agent.id);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: agent.name,
    jobTitle: agent.role,
    description: agent.bio,
    image: agent.photo,
    telephone: agent.phone,
    email: agent.email,
    url: `${SITE_URL}/agents/${agent.id}`,
    worksFor: { "@type": "Organization", name: agency.name, url: SITE_URL },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "עמוד הבית", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "הסוכנים שלנו", item: `${SITE_URL}/agents` },
      { "@type": "ListItem", position: 3, name: agent.name, item: `${SITE_URL}/agents/${agent.id}` },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 sm:py-10 lg:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(personSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema)} />
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-[var(--color-surface)] p-5 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:flex-row sm:gap-6 sm:rounded-[2rem] sm:p-8 sm:text-right">
        <SampleImage
          src={agent.photo}
          alt={agent.name}
          className="h-24 w-24 shrink-0 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.15)] ring-2 ring-[var(--color-background)] sm:h-32 sm:w-32 sm:ring-4"
        />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{agent.name}</h1>
          <p className="mt-1 text-sm font-medium text-[var(--color-accent2)] sm:text-base">{agent.role}</p>
          <div className="mt-2 flex flex-col items-center gap-1 text-sm text-[var(--color-main)]/70 sm:items-start">
            <a
              href={`tel:${agent.phone.replace(/[\s-]/g, "")}`}
              dir="ltr"
              className="underline decoration-[var(--color-main)]/20 underline-offset-2 transition hover:text-[var(--color-main)]"
            >
              {agent.phone}
            </a>
            <a
              href={`mailto:${agent.email}`}
              className="underline decoration-[var(--color-main)]/20 underline-offset-2 transition hover:text-[var(--color-main)]"
            >
              {agent.email}
            </a>
          </div>
          <ContactButtons
            phone={agent.phone}
            whatsapp={agent.whatsapp}
            email={agent.email}
            whatsappMessage={`היי ${agent.name}, אשמח לקבל פרטים נוספים`}
            className="mt-3 justify-center sm:justify-start"
            compact
          />
        </div>
      </div>

      {agent.bio && (
        <div className="mt-5 rounded-2xl bg-[var(--color-surface)] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:mt-6 sm:rounded-[2rem] sm:p-8">
          <QuoteIcon className="h-6 w-6 text-[var(--color-accent2)] sm:h-8 sm:w-8" />
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-main)]/80 sm:text-lg">&ldquo;{agent.bio}&rdquo;</p>
        </div>
      )}

      {agentProperties.length > 0 && (
        <div className="mt-6 sm:mt-10">
          <h2 className="mb-4 text-lg font-extrabold tracking-tight sm:mb-6 sm:text-2xl">הנכסים שלי</h2>
          <PropertyGrid properties={agentProperties} />
        </div>
      )}

      <div className="mt-6 sm:mt-10">
        <LeadForm title={`השאירו פרטים ל${agent.name}`} toEmail={agent.email} />
      </div>
    </div>
  );
}
