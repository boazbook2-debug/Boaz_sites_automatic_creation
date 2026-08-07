import FAQAccordion from "@/components/FAQAccordion";
import FeaturedPropertiesSection from "@/components/FeaturedPropertiesSection";
import Reveal from "@/components/Reveal";
import faq from "@/data/faq";
import properties from "@/data/properties";
import agency from "@/data/agency";
import { pageMetadata, jsonLdScript } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "שאלות ותשובות",
  description: `תשובות לשאלות הנפוצות ביותר על תהליך רכישה, מכירה והשכרה של נכסים עם ${agency.name}.`,
  path: "/faq",
  keywords: `${agency.name}, שאלות ותשובות, נדל״ן, תהליך רכישת דירה, מכירת דירה`,
  properties,
});

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqSchema)} />
      <Reveal className="mx-auto max-w-3xl px-6 py-8 lg:px-10">
        <h1 className="text-4xl font-serif font-bold tracking-tight sm:text-5xl">שאלות ותשובות</h1>
        <p className="mt-3 text-lg text-[var(--color-main)]/60">התשובות לשאלות הנפוצות ביותר שאנו נשאלים.</p>

        <div className="mt-10">
          <FAQAccordion items={faq} />
        </div>
      </Reveal>

      <FeaturedPropertiesSection properties={properties} />
    </>
  );
}
