import { QuoteIcon } from "./Icons";
import Reveal from "./Reveal";

function TestimonialCard({ t }) {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-[var(--color-surface)] p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)] sm:rounded-[2rem] sm:p-6">
      <QuoteIcon className="h-5 w-5 text-[var(--color-accent2)] sm:h-8 sm:w-8" />
      <p className="mt-2 flex-1 text-xs leading-relaxed text-[var(--color-main)]/80 sm:mt-4 sm:text-lg">{t.text}</p>
      <div className="mt-3 border-t border-[var(--color-main)]/10 pt-2 sm:mt-6 sm:pt-4">
        <p className="text-sm font-bold sm:text-base">{t.name}</p>
        <p className="text-xs text-[var(--color-main)]/55 sm:text-sm">{t.context}</p>
      </div>
    </div>
  );
}

export default function Testimonials({ testimonials }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
      {testimonials.map((t, i) => (
        <Reveal key={t.id} delay={i * 80} className={i >= 4 ? "hidden lg:block" : ""}>
          <TestimonialCard t={t} />
        </Reveal>
      ))}
    </div>
  );
}
