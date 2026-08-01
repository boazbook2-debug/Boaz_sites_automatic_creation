import Testimonials from "@/components/Testimonials";
import FeaturedPropertiesSection from "@/components/FeaturedPropertiesSection";
import testimonials from "@/data/testimonials";
import properties from "@/data/properties";
import agency from "@/data/agency";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "לקוחות ממליצים",
  description: `ביקורות והמלצות אמיתיות מלקוחות של ${agency.name} על תהליך רכישה, מכירה והשכרה של נכסים.`,
  path: "/reviews",
  keywords: `${agency.name}, ביקורות, המלצות, לקוחות מרוצים, נדל״ן`,
});

export default function ReviewsPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">לקוחות ממליצים</h1>
        <p className="mt-3 max-w-xl text-lg text-[var(--color-main)]/60">
          מה הלקוחות שלנו אומרים על התהליך והשירות.
        </p>

        <div className="mt-10">
          <Testimonials testimonials={testimonials} />
        </div>
      </div>

      <FeaturedPropertiesSection properties={properties} />
    </>
  );
}
