import { Heebo, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";
import agency from "@/data/agency";
import properties from "@/data/properties";
import { SITE_URL } from "@/lib/siteUrl";
import { uniqueSorted } from "@/lib/properties";
import { buildDefaultSeoTerms } from "@/lib/seo";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

// Editorial serif for headings only — body copy stays on Heebo for readability.
const frankRuhlLibre = Frank_Ruhl_Libre({
  variable: "--font-display",
  subsets: ["hebrew", "latin"],
  weight: ["500", "700", "900"],
  display: "swap",
});

const description = agency.aboutText.slice(0, 160);
const locations = uniqueSorted(properties.map((p) => p.location));
const keywords = [...buildDefaultSeoTerms(properties), ...(agency.customSeoTerms ?? [])].join(", ");

// Gated demos still keep the real branding in title/OG tags — link previews
// (WhatsApp, etc.) are how these get shared privately with the agent, so a
// generic "password protected" card reads as broken/untrustworthy. The gate
// itself (password check) and `robots: noindex` below are what actually keep
// these private — they don't depend on the metadata being generic.
const isGatedDemo = Boolean(agency.demoAccessCode);
const publicTitle = `${agency.name} | ${agency.tagline}`;
const publicDescription = description;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: publicTitle, template: `%s | ${agency.name}` },
  description: publicDescription,
  keywords,
  applicationName: agency.name,
  robots: agency.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: publicTitle,
    title: publicTitle,
    description: publicDescription,
    url: SITE_URL,
    images: agency.heroImages?.[0] ? [{ url: agency.heroImages[0] }] : [],
  },
  twitter: {
    card: "summary_large_image",
    title: publicTitle,
    description: publicDescription,
    images: agency.heroImages?.[0] ? [agency.heroImages[0]] : [],
  },
};

export default function RootLayout({ children }) {
  const { colors } = agency;

  const prices = properties.map((p) => p.price).filter((p) => p > 0);
  const priceRange = prices.length
    ? `₪${Math.min(...prices).toLocaleString("he-IL")} - ₪${Math.max(...prices).toLocaleString("he-IL")}`
    : undefined;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    "@id": `${SITE_URL}#organization`,
    name: agency.name,
    description,
    url: SITE_URL,
    telephone: agency.phone,
    email: agency.email,
    image: agency.heroImages?.[0],
    logo: agency.logo ? `${SITE_URL}${agency.logo}` : undefined,
    priceRange,
    areaServed: locations.map((location) => ({ "@type": "Place", name: location })),
    address: { "@type": "PostalAddress", streetAddress: agency.address, addressCountry: "IL" },
    sameAs: [agency.facebookUrl, agency.instagramUrl].filter(Boolean),
  };

  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} ${frankRuhlLibre.variable} h-full antialiased`}
      style={{
        "--color-background": colors.background,
        "--color-surface": colors.surface,
        "--color-main": colors.main,
        "--color-accent1": colors.accent1,
        "--color-accent2": colors.accent2,
        ...(colors.headerBg ? { "--color-header-bg": colors.headerBg } : {}),
        ...(colors.headerText ? { "--color-header-text": colors.headerText } : {}),
      }}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-main)] font-sans">
        {!isGatedDemo && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
        )}
        {children}
      </body>
    </html>
  );
}
