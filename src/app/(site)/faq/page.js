import FAQAccordion from "@/components/FAQAccordion";
import FeaturedPropertiesSection from "@/components/FeaturedPropertiesSection";
import faq from "@/data/faq";
import properties from "@/data/properties";

export const metadata = {
  title: "שאלות ותשובות",
};

export default function FAQPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl px-6 py-12 lg:px-10">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">שאלות ותשובות</h1>
        <p className="mt-3 text-lg text-[var(--color-main)]/60">התשובות לשאלות הנפוצות ביותר שאנו נשאלים.</p>

        <div className="mt-10">
          <FAQAccordion items={faq} />
        </div>
      </div>

      <FeaturedPropertiesSection properties={properties} />
    </>
  );
}
