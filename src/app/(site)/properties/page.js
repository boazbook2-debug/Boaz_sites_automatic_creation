import { Suspense } from "react";
import PropertiesExplorer from "@/components/PropertiesExplorer";
import properties from "@/data/properties";

export const metadata = {
  title: "כל הנכסים",
};

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
