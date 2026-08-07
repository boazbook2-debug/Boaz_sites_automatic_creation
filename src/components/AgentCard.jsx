import Link from "next/link";
import SampleImage from "./SampleImage";
import ContactButtons from "./ContactButtons";

export default function AgentCard({ agent, compact = false, className = "" }) {
  if (compact) {
    return (
      <Link
        href={`/agents/${agent.id}`}
        className={`flex flex-col items-center rounded-2xl bg-[var(--color-surface)] p-4 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)] sm:rounded-[2rem] sm:p-6 ${className}`}
      >
        <SampleImage
          src={agent.photo}
          alt={agent.name}
          className="h-16 w-16 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.15)] ring-2 ring-[var(--color-background)] sm:h-32 sm:w-32 sm:ring-4"
        />
        <p className="mt-3 font-serif text-sm font-bold sm:mt-6 sm:text-xl">{agent.name}</p>
        <p className="mt-0.5 text-xs font-medium text-[var(--color-accent2)] sm:mt-1 sm:text-base">{agent.role}</p>
        {agent.yearsOfExperience && (
          <p className="mt-0.5 text-xs font-bold sm:mt-1 sm:text-base">{agent.yearsOfExperience} שנות ניסיון</p>
        )}
        <span className="mt-3 w-full rounded-full bg-[var(--color-accent2)] px-4 py-2 text-xs font-bold text-white shadow-[0_12px_30px_rgba(176,141,87,0.4)] sm:mt-6 sm:px-6 sm:py-3 sm:text-sm">
          לפרופיל הסוכן/ת
        </span>
      </Link>
    );
  }

  return (
    <div
      className={`flex flex-col items-center rounded-2xl bg-[var(--color-surface)] p-4 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)] sm:rounded-[2rem] sm:p-6 ${className}`}
    >
      <SampleImage
        src={agent.photo}
        alt={agent.name}
        className="h-20 w-20 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.15)] ring-2 ring-[var(--color-background)] sm:h-28 sm:w-28 sm:ring-4"
      />
      <p className="mt-3 font-serif text-base font-bold sm:mt-4 sm:text-lg">{agent.name}</p>
      <p className="mt-0.5 text-sm font-medium text-[var(--color-accent2)]">{agent.role}</p>
      {agent.yearsOfExperience && (
        <p className="mt-0.5 text-sm font-bold">{agent.yearsOfExperience} שנות ניסיון</p>
      )}
      <ContactButtons
        phone={agent.phone}
        whatsapp={agent.whatsapp}
        email={agent.email}
        whatsappMessage={`היי ${agent.name}, אשמח לקבל פרטים נוספים`}
        className="mt-3 justify-center sm:mt-4"
        compact
      />
      <Link
        href={`/agents/${agent.id}`}
        className="mt-3 w-full rounded-full bg-[var(--color-accent2)] px-5 py-2 text-xs font-bold text-white shadow-[0_12px_30px_rgba(176,141,87,0.4)] transition hover:scale-105 sm:text-sm"
      >
        לפרופיל הסוכן/ת
      </Link>
    </div>
  );
}
