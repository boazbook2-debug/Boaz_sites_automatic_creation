import ContactButtons from "@/components/ContactButtons";
import LeadForm from "@/components/LeadForm";
import FeaturedPropertiesSection from "@/components/FeaturedPropertiesSection";
import MapEmbed from "@/components/MapEmbed";
import Reveal from "@/components/Reveal";
import agency from "@/data/agency";
import properties from "@/data/properties";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "צור קשר",
  description: `צרו קשר עם ${agency.name} בכתובת ${agency.address}, בטלפון ${agency.phone} או בהודעה. נשמח לעזור במציאת הנכס המושלם עבורכם.`,
  path: "/contact",
  keywords: `${agency.name}, צור קשר, יצירת קשר, נדל״ן, ${agency.address}`,
  properties,
});

export default function ContactPage() {
  return (
    <>
      <Reveal className="mx-auto max-w-4xl px-6 py-8 lg:px-10">
        <h1 className="text-4xl font-serif font-bold tracking-tight sm:text-5xl">צור קשר</h1>
        <p className="mt-3 max-w-xl text-lg text-[var(--color-main)]/60">
          נשמח לשמוע מכם ולעזור במציאת הנכס המושלם.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <p className="font-bold text-[var(--color-accent2)]">כתובת</p>
              <p className="mt-1 text-lg text-[var(--color-main)]/70">{agency.address}</p>
            </div>
            <div>
              <p className="font-bold text-[var(--color-accent2)]">פרטי התקשרות</p>
              <p className="mt-1 text-right text-lg text-[var(--color-main)]/70" dir="ltr">
                <a
                  href={`tel:${agency.phone.replace(/[\s-]/g, "")}`}
                  className="underline decoration-[var(--color-main)]/20 underline-offset-2 transition hover:text-[var(--color-main)]"
                >
                  {agency.phone}
                </a>
              </p>
              <p className="text-lg text-[var(--color-main)]/70">
                <a
                  href={`mailto:${agency.email}`}
                  className="underline decoration-[var(--color-main)]/20 underline-offset-2 transition hover:text-[var(--color-main)]"
                >
                  {agency.email}
                </a>
              </p>
            </div>
            <ContactButtons phone={agency.phone} whatsapp={agency.whatsapp} email={agency.email} />

            <MapEmbed address={agency.address} className="aspect-video" />
          </div>

          <LeadForm title="השאירו פרטים ונחזור אליכם בהקדם" />
        </div>
      </Reveal>

      <FeaturedPropertiesSection properties={properties} />
    </>
  );
}
