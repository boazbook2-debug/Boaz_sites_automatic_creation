import AgentCard from "@/components/AgentCard";
import FeaturedPropertiesSection from "@/components/FeaturedPropertiesSection";
import agency from "@/data/agency";
import agents from "@/data/agents";
import properties from "@/data/properties";

export const metadata = {
  title: "אודות",
};

export default function AboutPage() {
  return (
    <>
      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{agency.name}</h1>
        <p className="mt-2 text-lg text-[var(--color-main)]/60">{agency.tagline}</p>
        <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-[var(--color-main)]/80">
          {agency.aboutText}
        </p>

        <div className="mt-10">
          <h2 className="mb-8 text-3xl font-extrabold tracking-tight">הצוות שלנו</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-8 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </div>

      <FeaturedPropertiesSection properties={properties} />
    </>
  );
}
