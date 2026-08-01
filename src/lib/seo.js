import agency from "@/data/agency";
import { SITE_URL } from "./siteUrl";
import { uniqueSorted } from "./properties";

// A broad, generic set of Hebrew real-estate search terms every agency site
// should rank for regardless of client — synonyms, service types, and common
// listing phrasing. Combined at build time with the client's own locations
// and property types (from properties.js) to produce location- and
// type-specific long-tail terms too, e.g. "דירות למכירה בהרצליה פיתוח".
const BASE_SEO_TERMS = [
  "נדל״ן",
  "נדלן",
  "תיווך",
  "תיווך דירות",
  "תיווך נדל״ן",
  "משרד תיווך",
  "סוכנות נדל״ן",
  "סוכן נדל״ן",
  "סוכנת נדל״ן",
  "יועץ נדל״ן",
  "מתווך דירות",
  "דירות למכירה",
  "דירות להשכרה",
  "בתים למכירה",
  "בתים להשכרה",
  "וילות למכירה",
  "נכסים למכירה",
  "נכסים להשכרה",
  "נכסי יוקרה",
  "דירת יוקרה",
  "דירת גן",
  "פנטהאוז",
  "דופלקס",
  "בית פרטי",
  "קוטג'",
  "דירה להשקעה",
  "השקעות נדל״ן",
  "רכישת דירה",
  "מכירת דירה",
  "השכרת דירה",
  "מחירי דירות",
  "שווי נכס",
  "הערכת שווי נכס",
  "ייעוץ נדל״ן",
  "ליווי רכישת דירה",
  "ליווי משפטי בעסקת נדל״ן",
  "דירה ראשונה",
  "שיפוץ לפני מכירה",
  "שמאות מקרקעין",
];

// agencyName defaults to the real site's own data (used by pageMetadata/layout
// below); the intake form passes its own live, still-being-typed agency name
// instead, so its "see all" preview matches what the deployed site will get.
export function buildDefaultSeoTerms(properties = [], agencyName = agency.name) {
  const locations = uniqueSorted(properties.map((p) => p.location).filter(Boolean));
  const types = uniqueSorted(properties.map((p) => p.type).filter(Boolean));

  const locationCombos = locations.flatMap((location) => [
    `דירות למכירה ב${location}`,
    `דירות להשכרה ב${location}`,
    `נכסים ב${location}`,
  ]);
  const typeCombos = types.flatMap((type) => [`${type} למכירה`, `${type} להשכרה`]);

  return [agencyName, ...BASE_SEO_TERMS, ...types, ...typeCombos, ...locations, ...locationCombos].filter(Boolean);
}

// Central metadata builder so every page ships a unique title, description,
// canonical URL, and matching Open Graph/Twitter data — Next.js does NOT
// deep-merge nested metadata objects across layout/page, so every field a
// page needs (including OG basics like siteName) must be repeated here.
export function pageMetadata({ title, description, path = "", keywords, image, properties = [] }) {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || agency.heroImages?.[0];
  const fullTitle = `${title} | ${agency.name}`;
  const fullKeywords = [
    keywords,
    ...buildDefaultSeoTerms(properties),
    ...(agency.customSeoTerms ?? []),
  ]
    .filter(Boolean)
    .join(", ");

  return {
    title,
    description,
    keywords: fullKeywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "he_IL",
      siteName: agency.name,
      title: fullTitle,
      description,
      url,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export function jsonLdScript(schema) {
  return { __html: JSON.stringify(schema) };
}
