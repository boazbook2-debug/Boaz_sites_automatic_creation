import agency from "@/data/agency";
import { SITE_URL } from "./siteUrl";

// Central metadata builder so every page ships a unique title, description,
// canonical URL, and matching Open Graph/Twitter data — Next.js does NOT
// deep-merge nested metadata objects across layout/page, so every field a
// page needs (including OG basics like siteName) must be repeated here.
export function pageMetadata({ title, description, path = "", keywords, image }) {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || agency.heroImages?.[0];
  const fullTitle = `${title} | ${agency.name}`;
  const fullKeywords = [keywords, ...(agency.customSeoTerms ?? [])].filter(Boolean).join(", ");

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
