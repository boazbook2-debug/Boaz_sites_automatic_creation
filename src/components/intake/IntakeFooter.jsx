import { WhatsAppIcon } from "@/components/Icons";

const PHONE = "054-684-8641";
const WHATSAPP = "972546848641";

export default function IntakeFooter() {
  const whatsappHref = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("היי בועז, יש לי שאלה לגבי שאלון האתרים")}`;

  return (
    <footer className="border-t border-[var(--color-main)]/10 bg-[var(--color-surface)] px-6 py-8 text-center lg:px-10">
      <p className="text-[var(--color-main)]/70">
        יש לכם שאלות? פנו לבועז 📞 {PHONE}
      </p>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent2)] px-6 py-2.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(176,141,87,0.4)] transition hover:scale-105"
      >
        <WhatsAppIcon className="h-4 w-4" />
        שלחו הודעת וואטסאפ
      </a>
    </footer>
  );
}
