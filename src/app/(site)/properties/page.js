import { Suspense } from "react";
import PropertiesExplorer from "@/components/PropertiesExplorer";
import properties from "@/data/properties";
import agency from "@/data/agency";
import { pageMetadata } from "@/lib/seo";
import { uniqueSorted } from "@/lib/properties";

const locations = uniqueSorted(properties.map((p) => p.location));
const types = uniqueSorted(properties.map((p) => p.type));

export const metadata = pageMetadata({
  title: "כל הנכסים",
  description: `כל הנכסים למכירה ולהשכרה של ${agency.name}${
    locations.length ? ` ב${locations.slice(0, 5).join(", ")}` : ""
  }. ${types.slice(0, 4).join(", ")} ועוד.`,
  path: "/properties",
  keywords: `${agency.name}, נכסים למכירה, נכסים להשכרה, ${locations.join(", ")}, ${types.join(", ")}`,
  properties,
});

export default function PropertiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
      <h1 className="mb-8 text-4xl font-extrabold tracking-tight sm:text-5xl">כל הנכסים</h1>
      <Suspense>
        <PropertiesExplorer properties={properties} />
      </Suspense>
    </div>
  );
}
