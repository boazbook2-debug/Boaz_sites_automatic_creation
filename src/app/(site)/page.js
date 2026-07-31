import Link from "next/link";
import Hero from "@/components/Hero";
import QuickSearch from "@/components/QuickSearch";
import PropertyCard from "@/components/PropertyCard";
import AgentCard from "@/components/AgentCard";
import Testimonials from "@/components/Testimonials";
import AreasWeCover from "@/components/AreasWeCover";
import FAQAccordion from "@/components/FAQAccordion";
import Stats from "@/components/Stats";
import SampleImage from "@/components/SampleImage";
import agency from "@/data/agency";
import properties from "@/data/properties";
import agents from "@/data/agents";
import testimonials from "@/data/testimonials";
import faq from "@/data/faq";

export default function HomePage() {
  const featured = properties.slice(0, 6);
  const featuredAgents = agents.slice(0, 4);
  const owner = agents[0];

  return (
    <>
      <Hero images={agency.heroImages} title={agency.name} tagline={agency.tagline} />
      <QuickSearch properties={properties} />

      <section className="mx-auto max-w-7xl px-6 pt-8 pb-8 sm:pt-12 sm:pb-12 lg:px-10">
        <div className="mb-4 flex items-end justify-between sm:mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              נכסים <span className="text-[var(--color-accent2)]">נבחרים</span>
            </h2>
            <p className="mt-1 text-sm text-[var(--color-main)]/60 sm:mt-2 sm:text-lg">
              מבחר מהנכסים הבולטים שלנו כרגע
            </p>
          </div>
          <Link
            href="/properties"
            className="text-sm font-semibold text-[var(--color-accent2)] sm:text-base"
          >
            לכל הנכסים ←
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-8 lg:grid-cols-3">
          {featured.map((p, i) => (
            <PropertyCard key={p.id} property={p} className={i >= 4 ? "hidden lg:block" : ""} />
          ))}
        </div>
      </section>

      <section className="bg-[var(--color-surface)] py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-4 flex items-end justify-between sm:mb-8">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">הסוכנים שלנו</h2>
              <p className="mt-1 text-sm text-[var(--color-main)]/60 sm:mt-2 sm:text-lg">
                צוות מקצועי וזמין שילווה אתכם לאורך כל הדרך
              </p>
            </div>
            <Link
              href="/agents"
              className="text-sm font-semibold text-[var(--color-accent2)] sm:text-base"
            >
              כל הסוכנים ←
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-8 lg:grid-cols-3">
            {featuredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-12">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="flex items-center gap-4 sm:flex-col sm:gap-0 sm:text-center">
            {owner && (
              <SampleImage
                src={owner.photo}
                alt={owner.name}
                className="aspect-square w-20 shrink-0 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.15)] ring-2 ring-[var(--color-surface)] sm:w-32 sm:ring-4"
              />
            )}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight sm:mt-4 sm:text-3xl">אודותינו</h2>
              {owner && (
                <>
                  <p className="mt-1 text-sm font-bold sm:mt-2">{owner.name}</p>
                  <p className="text-xs text-[var(--color-accent2)] sm:text-sm">{owner.role}</p>
                </>
              )}
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-main)]/80 sm:mt-5 sm:text-center sm:text-lg">
            &ldquo;{agency.ownerQuote}&rdquo;
          </p>
          <div className="mt-3 text-center sm:mt-5">
            <Link
              href="/about"
              className="inline-flex rounded-full border-2 border-[var(--color-main)]/20 px-6 py-2.5 text-sm font-semibold transition hover:bg-[var(--color-surface)] sm:px-8 sm:py-3.5 sm:text-base"
            >
              עוד עלינו
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-surface)] py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-4 flex items-end justify-between sm:mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              לקוחות <span className="text-[var(--color-accent2)]">ממליצים</span>
            </h2>
            <Link
              href="/reviews"
              className="text-sm font-semibold text-[var(--color-accent2)] sm:text-base"
            >
              כל הביקורות ←
            </Link>
          </div>
          <Testimonials testimonials={testimonials.slice(0, 6)} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-3 lg:px-10">
        <Stats />
      </section>

      <section className="bg-[var(--color-surface)] py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-4 text-center sm:mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">השכונות המבוקשות שלנו</h2>
            <p className="mt-1 text-sm text-[var(--color-main)]/60 sm:mt-2 sm:text-lg">
              לחצו על אזור לצפייה בנכסים הזמינים בו
            </p>
          </div>
          <AreasWeCover properties={properties} />
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="mb-3 flex items-end justify-between sm:mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">שאלות ותשובות</h2>
            <Link
              href="/faq"
              className="text-sm font-semibold text-[var(--color-accent2)] sm:text-base"
            >
              כל השאלות ←
            </Link>
          </div>
          <FAQAccordion items={faq.slice(0, 4)} />
        </div>
      </section>
    </>
  );
}
