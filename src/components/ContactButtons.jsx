import { PhoneIcon, WhatsAppIcon, MailIcon } from "./Icons";
import { toWhatsappNumber } from "@/lib/phone";

// Permanent fixture: phone / WhatsApp / email always render as these three
// buttons everywhere in the site. Only the numbers behind them change per
// client (agency-level) or per agent.
export default function ContactButtons({
  phone,
  whatsapp,
  email,
  whatsappMessage = "היי, ראיתי את הנכס שלכם ואשמח לקבל פרטים נוספים",
  className = "",
  compact = false,
}) {
  const waHref = `https://wa.me/${toWhatsappNumber(whatsapp)}?text=${encodeURIComponent(whatsappMessage)}`;
  const pillClass = compact
    ? "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition"
    : "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition";
  const iconClass = compact ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className={`flex flex-wrap gap-2 sm:gap-3 ${className}`}>
      <a href={`tel:${phone}`} className={`${pillClass} bg-[var(--color-accent1)] text-white hover:opacity-90`}>
        <PhoneIcon className={iconClass} />
        חייג
      </a>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${pillClass} bg-[#25D366] text-white hover:opacity-90`}
      >
        <WhatsAppIcon className={iconClass} />
        וואטסאפ
      </a>
      <a
        href={`mailto:${email}`}
        className={`${pillClass} border border-[var(--color-main)]/20 text-[var(--color-main)] hover:bg-[var(--color-surface)]`}
      >
        <MailIcon className={iconClass} />
        אימייל
      </a>
    </div>
  );
}
