import {
  HouseIcon,
  TrendingUpIcon,
  AwardIcon,
  MapPinIcon,
  StarIcon,
  PhoneIcon,
  WhatsAppIcon,
  MailIcon,
  QuoteIcon,
} from "@/components/Icons";

// Shared between the live Stats component and the intake questionnaire's icon
// picker, so presets shown to the agency owner always match what can render.
const iconRegistry = [
  { id: "house", label: "בית", Icon: HouseIcon },
  { id: "trending-up", label: "מגמת עלייה", Icon: TrendingUpIcon },
  { id: "award", label: "פרס / הישג", Icon: AwardIcon },
  { id: "map-pin", label: "מיקום", Icon: MapPinIcon },
  { id: "star", label: "כוכב / דירוג", Icon: StarIcon },
  { id: "phone", label: "טלפון", Icon: PhoneIcon },
  { id: "whatsapp", label: "וואטסאפ", Icon: WhatsAppIcon },
  { id: "mail", label: "מייל", Icon: MailIcon },
  { id: "quote", label: "ציטוט", Icon: QuoteIcon },
];

export default iconRegistry;

export function getIconById(id) {
  return iconRegistry.find((entry) => entry.id === id) ?? iconRegistry[0];
}
