"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import SampleImage from "./SampleImage";
import Reveal from "./Reveal";
import { MapPinIcon, ChevronLeftIcon, ChevronRightIcon } from "./Icons";

const PAGE_SIZE = 6;

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
        imgClassName="animate-image-in transition-transform duration-500 group-hover:scale-105"
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

  const itemRefs = useRef([]);
  const [pageStart, setPageStart] = useState(0);
  const showArrows = areas.length > 2;

  function visibleCount() {
    if (typeof window === "undefined") return PAGE_SIZE;
    if (window.innerWidth >= 1024) return 6;
    if (window.innerWidth >= 640) return 3;
    return 2;
  }

  function goTo(index) {
    itemRefs.current[index]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  function prev() {
    const index = Math.max(pageStart - visibleCount(), 0);
    setPageStart(index);
    goTo(index);
  }

  function next() {
    const index = Math.min(pageStart + visibleCount(), areas.length - 1);
    setPageStart(index);
    goTo(index);
  }

  return (
    <div className="relative">
      {showArrows && (
        <button
          type="button"
          onClick={prev}
          aria-label="הקודם"
          className="absolute start-0 top-1/2 z-10 -translate-y-1/2 -translate-x-1/2 rounded-full bg-[var(--color-background)] p-2 shadow-[0_10px_25px_rgba(0,0,0,0.2)] transition hover:scale-105 sm:p-3"
        >
          <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      )}

      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth py-2 [&::-webkit-scrollbar]:hidden sm:gap-5"
        style={{ scrollbarWidth: "none" }}
      >
        {areas.map((area, i) => (
          <div
            key={area.location}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="w-[calc(50%-0.375rem)] shrink-0 snap-start sm:w-[calc(33.333%-0.834rem)] lg:w-[calc(16.6667%-1.0417rem)]"
          >
            <Reveal delay={i * 80}>
              <AreaCard area={area} />
            </Reveal>
          </div>
        ))}
      </div>

      {showArrows && (
        <button
          type="button"
          onClick={next}
          aria-label="הבא"
          className="absolute end-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2 rounded-full bg-[var(--color-background)] p-2 shadow-[0_10px_25px_rgba(0,0,0,0.2)] transition hover:scale-105 sm:p-3"
        >
          <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      )}
    </div>
  );
}
