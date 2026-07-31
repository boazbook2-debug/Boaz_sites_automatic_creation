import AgentCard from "@/components/AgentCard";
import FeaturedPropertiesSection from "@/components/FeaturedPropertiesSection";
import agents from "@/data/agents";
import properties from "@/data/properties";

export const metadata = {
  title: "הסוכנים שלנו",
};

export default function AgentsPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">הסוכנים שלנו</h1>
        <p className="mt-3 max-w-xl text-lg text-[var(--color-main)]/60">
          צוות מקצועי וזמין שילווה אתכם לאורך כל הדרך.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      <FeaturedPropertiesSection properties={properties} />
    </>
  );
}
