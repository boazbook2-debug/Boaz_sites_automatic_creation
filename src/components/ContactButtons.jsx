import { PhoneIcon, WhatsAppIcon, MailIcon } from "./Icons";

// Permanent fixture: phone / WhatsApp / email always render as these three
// buttons everywhere in the site. Only the numbers behind them change per
// client (agency-level) or per agent.
export default function ContactButtons({
  phone,
  whatsapp,
  email,
  whatsappMessage = "היי, ראיתי את הנכס שלכם ואשמח לקבל פרטים נוספים",
  className = "",
}) {
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a
        href={`tel:${phone}`}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent1)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
      >
        <PhoneIcon className="h-4 w-4" />
        חייג
      </a>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent2)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
      >
        <WhatsAppIcon className="h-4 w-4" />
        וואטסאפ
      </a>
      <a
        href={`mailto:${email}`}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-main)]/20 px-5 py-2.5 text-sm font-medium text-[var(--color-main)] transition hover:bg-[var(--color-surface)]"
      >
        <MailIcon className="h-4 w-4" />
        אימייל
      </a>
    </div>
  );
}
