import whyUs from "@/data/whyUs";
import Reveal from "./Reveal";

export default function WhyUs() {
  if (!whyUs?.heading?.trim() || !whyUs?.cards?.length) return null;

  const cards = whyUs.cards;

  return (
    <Reveal as="section" className="py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-6 text-center sm:mb-10">
          <div className="mx-auto mb-3 h-[3px] w-14 bg-[var(--color-accent2)]" />
          <h2 className="text-2xl font-serif font-bold tracking-tight sm:text-4xl lg:text-5xl">{whyUs.heading}</h2>
        </div>

        {/* Mobile: same Swiss-editorial data-row treatment as the Stats
            section (no card chrome, just hairline dividers) instead of a
            grid of full-size cards. */}
        <div className="grid grid-cols-2 divide-x divide-y divide-[var(--color-main)]/10 border-y border-[var(--color-main)]/10 sm:hidden">
          {cards.map((card, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 px-3 py-5 text-center">
              <h3 className="font-serif text-sm font-bold leading-tight tracking-tight">{card.title}</h3>
              <p className="text-xs leading-snug text-[var(--color-main)]/60">{card.description}</p>
            </div>
          ))}
        </div>

        <div className="hidden sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {cards.map((card, i) => (
            <Reveal
              key={i}
              delay={i * 80}
              className="rounded-2xl bg-[var(--color-background)] p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.15)] sm:rounded-[2rem] sm:p-8"
            >
              <h3 className="font-serif text-lg font-bold tracking-tight sm:text-xl">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-main)]/70 sm:mt-3 sm:text-base">
                {card.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
