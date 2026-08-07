import Testimonials from "@/components/Testimonials";
import FeaturedPropertiesSection from "@/components/FeaturedPropertiesSection";
import Reveal from "@/components/Reveal";
import testimonials from "@/data/testimonials";
import properties from "@/data/properties";
import agency from "@/data/agency";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "לקוחות ממליצים",
  description: `ביקורות והמלצות אמיתיות מלקוחות של ${agency.name} על תהליך רכישה, מכירה והשכרה של נכסים.`,
  path: "/reviews",
  keywords: `${agency.name}, ביקורות, המלצות, לקוחות מרוצים, נדל״ן`,
  properties,
});

export default function ReviewsPage() {
  return (
    <>
      <Reveal className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        <h1 className="text-4xl font-serif font-bold tracking-tight sm:text-5xl">לקוחות ממליצים</h1>
        <p className="mt-3 max-w-xl text-lg text-[var(--color-main)]/60">
          מה הלקוחות שלנו אומרים על התהליך והשירות.
        </p>

        <div className="mt-10">
          <Testimonials testimonials={testimonials} />
        </div>
      </Reveal>

      <FeaturedPropertiesSection properties={properties} />
    </>
  );
}
