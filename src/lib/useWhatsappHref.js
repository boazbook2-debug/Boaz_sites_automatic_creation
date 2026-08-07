"use client";

import { usePathname } from "next/navigation";
import agency from "@/data/agency";
import properties from "@/data/properties";
import { toWhatsappNumber } from "./phone";

// Same WhatsApp number everywhere, but the prefilled message adapts: generic
// agency greeting by default, property-specific question when viewing a
// property detail page.
export default function useWhatsappHref() {
  const pathname = usePathname();
  const match = pathname?.match(/^\/properties\/([^/]+)$/);
  const property = match ? properties.find((p) => p.id === match[1]) : null;

  const message = property
    ? `היי, ראיתי את הנכס "${property.title}" באתר ואשמח לקבל פרטים נוספים`
    : `היי, הגעתי מהאתר של ${agency.name} ואשמח לקבל פרטים נוספים`;

  return `https://wa.me/${toWhatsappNumber(agency.whatsapp)}?text=${encodeURIComponent(message)}`;
}
