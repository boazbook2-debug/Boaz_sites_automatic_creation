import Link from "next/link";
import Hero from "@/components/Hero";
import QuickSearch from "@/components/QuickSearch";
import PropertyCard from "@/components/PropertyCard";
import AgentCard from "@/components/AgentCard";
import Testimonials from "@/components/Testimonials";
import AreasWeCover from "@/components/AreasWeCover";
import WhyUs from "@/components/WhyUs";
import FAQAccordion from "@/components/FAQAccordion";
import Stats from "@/components/Stats";
import SampleImage from "@/components/SampleImage";
import Reveal from "@/components/Reveal";
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

      <Reveal as="section" className="mx-auto max-w-7xl px-6 pt-8 pb-16 sm:pt-12 sm:pb-24 lg:px-10">
        <div className="mb-3 flex items-end justify-between sm:mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold tracking-tight sm:text-4xl lg:text-5xl">
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
            <Reveal key={p.id} delay={i * 90} className={i >= 4 ? "hidden lg:block" : ""}>
              <PropertyCard property={p} />
            </Reveal>
          ))}
        </div>
      </Reveal>

      <Reveal
        as="section"
        className="relative z-10 -mt-8 rounded-t-[2.5rem] bg-[var(--color-surface)] pb-6 pt-12 shadow-[0_-25px_60px_-25px_rgba(0,0,0,0.18)] sm:-mt-16 sm:rounded-t-[3.5rem] sm:pb-8 sm:pt-20"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-3 flex items-end justify-between sm:mb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold tracking-tight sm:text-4xl lg:text-5xl">הסוכנים שלנו</h2>
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
            {featuredAgents.map((agent, i) => (
              <Reveal key={agent.id} delay={i * 90}>
                <AgentCard agent={agent} compact />
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="pt-6 pb-16 sm:pt-8 sm:pb-24">
        <div className="mx-auto max-w-3xl px-6 lg:max-w-5xl lg:px-10">
          <div className="lg:grid lg:grid-cols-[340px_1fr] lg:items-center lg:gap-16">
            {owner && (
              <SampleImage
                src={owner.photo}
                alt={owner.name}
                className="mx-auto aspect-square w-20 shrink-0 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.15)] ring-2 ring-[var(--color-surface)] sm:w-32 sm:ring-4 lg:aspect-[4/5] lg:w-full lg:rounded-[2rem] lg:shadow-[0_35px_80px_-25px_rgba(0,0,0,0.3)] lg:ring-0"
              />
            )}

            <div className="text-center lg:text-right">
              <h2 className="mt-4 text-xl font-serif font-bold tracking-tight sm:mt-6 sm:text-3xl lg:mt-0">אודותינו</h2>
              {owner && (
                <div className="mt-1">
                  <p className="text-sm font-bold sm:text-base">{owner.name}</p>
                  <p className="text-xs text-[var(--color-accent2)] sm:text-sm">{owner.role}</p>
                  {owner.yearsOfExperience && (
                    <p className="text-xs text-[var(--color-main)]/60 sm:text-sm">
                      {owner.yearsOfExperience} שנות ניסיון
                    </p>
                  )}
                </div>
              )}
              <p className="mt-4 font-serif text-base italic leading-relaxed text-[var(--color-main)]/80 sm:mt-5 sm:text-xl lg:text-2xl">
                &ldquo;{agency.ownerQuote}&rdquo;
              </p>
              <div className="mt-4 sm:mt-6 lg:flex lg:justify-end">
                <Link
                  href="/about"
                  className="inline-flex rounded-full border-2 border-[var(--color-main)]/20 px-6 py-2.5 text-sm font-semibold transition hover:bg-[var(--color-surface)] sm:px-8 sm:py-3.5 sm:text-base"
                >
                  עוד עלינו
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal
        as="section"
        className="relative z-10 -mt-8 rounded-t-[2.5rem] bg-[var(--color-surface)] pb-6 pt-12 shadow-[0_-25px_60px_-25px_rgba(0,0,0,0.18)] sm:-mt-16 sm:rounded-t-[3.5rem] sm:pb-8 sm:pt-20"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-3 flex items-end justify-between sm:mb-6">
            <h2 className="text-2xl font-serif font-bold tracking-tight sm:text-4xl lg:text-5xl">
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
      </Reveal>

      <Reveal as="section" className="mx-auto max-w-7xl px-6 pt-3 pb-16 sm:pb-24 lg:px-10">
        <Stats />
      </Reveal>

      <Reveal
        as="section"
        className="relative z-10 -mt-8 rounded-t-[2.5rem] bg-[var(--color-surface)] pb-6 pt-12 shadow-[0_-25px_60px_-25px_rgba(0,0,0,0.18)] sm:-mt-16 sm:rounded-t-[3.5rem] sm:pb-8 sm:pt-20"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-3 text-center sm:mb-6">
            <h2 className="text-2xl font-serif font-bold tracking-tight sm:text-4xl lg:text-5xl">השכונות המבוקשות שלנו</h2>
            <p className="mt-1 text-sm text-[var(--color-main)]/60 sm:mt-2 sm:text-lg">
              לחצו על אזור לצפייה בנכסים הזמינים בו
            </p>
          </div>
          <AreasWeCover properties={properties} />
        </div>
      </Reveal>

      <WhyUs />

      <Reveal as="section" className="py-6 sm:py-8">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="mb-3 flex items-end justify-between sm:mb-6">
            <h2 className="text-2xl font-serif font-bold tracking-tight sm:text-4xl lg:text-5xl">שאלות ותשובות</h2>
            <Link
              href="/faq"
              className="text-sm font-semibold text-[var(--color-accent2)] sm:text-base"
            >
              כל השאלות ←
            </Link>
          </div>
          <FAQAccordion items={faq.slice(0, 4)} />
        </div>
      </Reveal>
    </>
  );
}
