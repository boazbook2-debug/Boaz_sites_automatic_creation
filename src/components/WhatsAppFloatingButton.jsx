"use client";

import useWhatsappHref from "@/lib/useWhatsappHref";
import { WhatsAppIcon } from "./Icons";

export default function WhatsAppFloatingButton() {
  const href = useWhatsappHref();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="שלחו לנו הודעת וואטסאפ"
      className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:opacity-90"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
