import { notFound } from "next/navigation";
import SampleImage from "@/components/SampleImage";
import ContactButtons from "@/components/ContactButtons";
import PropertyGrid from "@/components/PropertyGrid";
import LeadForm from "@/components/LeadForm";
import { QuoteIcon } from "@/components/Icons";
import agents from "@/data/agents";
import properties from "@/data/properties";

export function generateStaticParams() {
  return agents.map((agent) => ({ id: agent.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const agent = agents.find((a) => a.id === id);
  return { title: agent?.name ?? "סוכן" };
}

export default async function AgentProfilePage({ params }) {
  const { id } = await params;
  const agent = agents.find((a) => a.id === id);

  if (!agent) notFound();

  const agentProperties = properties.filter((p) => p.assignedAgentId === agent.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 sm:py-10 lg:px-10">
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
        <LeadForm title={`השאירו פרטים ל${agent.name}`} />
      </div>
    </div>
  );
}
