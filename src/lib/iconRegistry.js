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

// Used for custom stats where the agency owner didn't pick a preset icon —
// matches the label/value text against keywords to pick a sensible icon
// automatically when the site is generated, falling back to the house icon.
const ICON_KEYWORD_RULES = [
  { iconId: "trending-up", keywords: ["שווי", "עסקאות", "מכירות", "מחזור", "גידול", "רווח", "השקעה", "תשואה"] },
  { iconId: "award", keywords: ["שנ", "ותק", "ניסיון", "פרס", "הישג", "מומחיות", "מקצוע"] },
  { iconId: "map-pin", keywords: ["עיר", "ערים", "אזור", "מיקום", "שכונ", "מחוז"] },
  { iconId: "star", keywords: ["לקוח", "דירוג", "מרוצ", "כוכב", "המלצ", "שביעות רצון"] },
  { iconId: "phone", keywords: ["טלפון", "מענה", "שיחו", "זמינ"] },
  { iconId: "whatsapp", keywords: ["וואטסאפ", "whatsapp"] },
  { iconId: "mail", keywords: ["מייל", "אימייל", "email"] },
  { iconId: "quote", keywords: ["ציטוט", "המלצה"] },
  { iconId: "house", keywords: ["נכס", "דירה", "דירות", "בית", "בתים", "וילה", "השכרה", "מכירה", "נדל"] },
];

export function matchIconIdFromText(text) {
  const normalized = (text || "").toLowerCase();
  for (const rule of ICON_KEYWORD_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) {
      return rule.iconId;
    }
  }
  return "house";
}
