import AgentCard from "@/components/AgentCard";
import FeaturedPropertiesSection from "@/components/FeaturedPropertiesSection";
import Reveal from "@/components/Reveal";
import agents from "@/data/agents";
import properties from "@/data/properties";
import agency from "@/data/agency";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "הסוכנים שלנו",
  description: `הכירו את סוכני הנדל״ן של ${agency.name} — צוות מקצועי וזמין המלווה אתכם ברכישה, מכירה והשכרה של נכסים.`,
  path: "/agents",
  keywords: `${agency.name}, סוכני נדל״ן, סוכן נדלן, תיווך`,
  properties,
});

export default function AgentsPage() {
  return (
    <>
      <Reveal className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        <h1 className="text-4xl font-serif font-bold tracking-tight sm:text-5xl">הסוכנים שלנו</h1>
        <p className="mt-3 max-w-xl text-lg text-[var(--color-main)]/60">
          צוות מקצועי וזמין שילווה אתכם לאורך כל הדרך.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-8 lg:grid-cols-3">
          {agents.map((agent, i) => (
            <Reveal key={agent.id} delay={i * 90}>
              <AgentCard agent={agent} />
            </Reveal>
          ))}
        </div>
      </Reveal>

      <FeaturedPropertiesSection properties={properties} />
    </>
  );
}
