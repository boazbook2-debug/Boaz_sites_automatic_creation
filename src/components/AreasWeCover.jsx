import Link from "next/link";
import SampleImage from "./SampleImage";
import { MapPinIcon } from "./Icons";

function AreaCard({ area }) {
  return (
    <Link
      href={`/properties?location=${encodeURIComponent(area.location)}`}
      className="group block overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.2)] sm:rounded-[2rem]"
    >
      <SampleImage
        src={area.image}
        alt={area.location}
        className="aspect-square"
        imgClassName="transition-transform duration-500 group-hover:scale-105"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-2.5 text-white sm:p-5">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <MapPinIcon className="h-3.5 w-3.5 text-[var(--color-accent2)] sm:h-5 sm:w-5" />
            <p className="text-sm font-bold sm:text-lg">{area.location}</p>
          </div>
          <p className="mt-0.5 text-xs text-white/80 sm:text-sm">
            {area.count} {area.count === 1 ? "נכס" : "נכסים"}
          </p>
        </div>
      </SampleImage>
    </Link>
  );
}

export default function AreasWeCover({ properties }) {
  const areas = [];
  for (const property of properties) {
    const existing = areas.find((a) => a.location === property.location);
    if (existing) existing.count += 1;
    else areas.push({ location: property.location, count: 1, image: property.images[0] });
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {areas.map((area) => (
        <AreaCard key={area.location} area={area} />
      ))}
    </div>
  );
}
