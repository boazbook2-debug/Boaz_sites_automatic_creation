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

// A password-gated demo shouldn't leak the agency's identity in metadata that
// renders before the gate ever checks the code (page <title>, OG tags) —
// keep those generic for these builds instead of the real name/tagline.
const isGatedDemo = Boolean(agency.demoAccessCode);
const publicTitle = isGatedDemo ? "תצוגה מוגנת בסיסמה" : `${agency.name} | ${agency.tagline}`;
const publicDescription = isGatedDemo ? "עמוד זה דורש קוד גישה לצפייה." : description;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: publicTitle, template: isGatedDemo ? "%s" : `%s | ${agency.name}` },
  description: publicDescription,
  keywords: isGatedDemo ? undefined : keywords,
  applicationName: isGatedDemo ? undefined : agency.name,
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
    images: isGatedDemo ? [] : agency.heroImages?.[0] ? [{ url: agency.heroImages[0] }] : [],
  },
  twitter: {
    card: "summary_large_image",
    title: publicTitle,
    description: publicDescription,
    images: isGatedDemo ? [] : agency.heroImages?.[0] ? [agency.heroImages[0]] : [],
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
