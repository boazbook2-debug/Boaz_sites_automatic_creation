import { notFound } from "next/navigation";
import SampleImage from "@/components/SampleImage";
import ContactButtons from "@/components/ContactButtons";
import PropertyGrid from "@/components/PropertyGrid";
import LeadForm from "@/components/LeadForm";
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
    <div className="mx-auto max-w-6xl px-6 py-14 lg:px-10">
      <div className="flex flex-col items-center gap-8 rounded-[2rem] bg-[var(--color-surface)] p-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:flex-row sm:text-right">
        <SampleImage
          src={agent.photo}
          alt={agent.name}
          className="h-40 w-40 shrink-0 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.15)] ring-4 ring-[var(--color-background)]"
        />
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">{agent.name}</h1>
          <p className="mt-1 text-lg font-medium text-[var(--color-accent2)]">{agent.role}</p>
          <ContactButtons
            phone={agent.phone}
            whatsapp={agent.whatsapp}
            email={agent.email}
            whatsappMessage={`היי ${agent.name}, אשמח לקבל פרטים נוספים`}
            className="mt-6 justify-center sm:justify-start"
          />
        </div>
      </div>

      {agentProperties.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-8 text-3xl font-extrabold tracking-tight">הנכסים שלי</h2>
          <PropertyGrid properties={agentProperties} />
        </div>
      )}

      <div className="mt-14">
        <LeadForm title={`השאירו פרטים ל${agent.name}`} />
      </div>
    </div>
  );
}
