import { Heebo } from "next/font/google";
import "./globals.css";
import agency from "@/data/agency";
import { SITE_URL } from "@/lib/siteUrl";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

const description = agency.aboutText.slice(0, 160);

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${agency.name} | ${agency.tagline}`, template: `%s | ${agency.name}` },
  description,
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: agency.name,
    title: `${agency.name} | ${agency.tagline}`,
    description,
    images: agency.heroImages?.[0] ? [{ url: agency.heroImages[0] }] : [],
  },
  twitter: {
    card: "summary_large_image",
    title: `${agency.name} | ${agency.tagline}`,
    description,
    images: agency.heroImages?.[0] ? [agency.heroImages[0]] : [],
  },
};

export default function RootLayout({ children }) {
  const { colors } = agency;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agency.name,
    description,
    url: SITE_URL,
    telephone: agency.phone,
    email: agency.email,
    address: { "@type": "PostalAddress", streetAddress: agency.address, addressCountry: "IL" },
    sameAs: [agency.facebookUrl, agency.instagramUrl].filter(Boolean),
  };

  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} h-full antialiased`}
      style={{
        "--color-background": colors.background,
        "--color-surface": colors.surface,
        "--color-main": colors.main,
        "--color-accent1": colors.accent1,
        "--color-accent2": colors.accent2,
      }}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-main)] font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
