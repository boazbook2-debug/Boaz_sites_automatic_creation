import Link from "next/link";
import SampleImage from "./SampleImage";
import ContactButtons from "./ContactButtons";

export default function AgentCard({ agent, className = "" }) {
  return (
    <div
      className={`flex flex-col items-center rounded-[2rem] bg-[var(--color-surface)] p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)] ${className}`}
    >
      <SampleImage
        src={agent.photo}
        alt={agent.name}
        className="h-32 w-32 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.15)] ring-4 ring-[var(--color-background)]"
      />
      <p className="mt-6 text-xl font-bold">{agent.name}</p>
      <p className="mt-1 font-medium text-[var(--color-accent2)]">{agent.role}</p>
      <ContactButtons
        phone={agent.phone}
        whatsapp={agent.whatsapp}
        email={agent.email}
        whatsappMessage={`היי ${agent.name}, אשמח לקבל פרטים נוספים`}
        className="mt-6 justify-center"
      />
      <Link
        href={`/agents/${agent.id}`}
        className="mt-4 w-full rounded-full bg-[var(--color-accent2)] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(176,141,87,0.4)] transition hover:scale-105"
      >
        כניסה לפרופיל של {agent.name}
      </Link>
    </div>
  );
}
