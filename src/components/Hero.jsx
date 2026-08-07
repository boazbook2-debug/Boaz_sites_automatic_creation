"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import siteConfig from "@/data/siteConfig";
import MagneticButton from "./MagneticButton";

const SLIDE_DURATION = 5000;

// Editorial composition: on mobile the headline stays centered (a tight,
// short viewport has no room for asymmetry to read well), but from sm+ the
// whole text block anchors to the bottom-start corner of the frame instead
// of dead-center — a poster/magazine-cover placement rather than a
// centered "hero template" block.
export default function Hero({ images, title, tagline, ctaLabel = "לצפייה בנכסים", ctaHref = "/properties" }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <section className="relative flex h-[68vh] min-h-[420px] items-center justify-center overflow-hidden bg-black sm:h-[92vh] sm:min-h-[640px] sm:items-end sm:justify-start">
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={src}
              alt={title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="animate-kenburns object-cover"
            />
          </div>
          {siteConfig.showSampleWatermark && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="-rotate-[24deg] select-none whitespace-nowrap rounded bg-black/35 px-6 py-1 text-xl font-bold tracking-[0.35em] text-white/90">
                EXAMPLE
              </span>
            </div>
          )}
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
      <div className="absolute inset-0 hidden bg-gradient-to-t from-black/20 via-transparent to-transparent sm:block" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:mx-0 sm:ms-16 sm:mb-16 sm:max-w-xl sm:px-0 sm:text-right lg:ms-24 lg:mb-20 lg:max-w-2xl">
        <div
          className="animate-page-in mx-auto mb-5 hidden h-[3px] w-14 bg-[var(--color-accent2)] sm:mx-0 sm:block"
          style={{ animationDelay: "0ms" }}
        />
        <h1
          className="hero-text-glow animate-page-in font-serif text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl sm:font-extrabold lg:text-7xl"
          style={{ animationDelay: "100ms" }}
        >
          {title}
        </h1>
        <p
          className="hero-text-glow animate-page-in mx-auto mt-3 max-w-2xl text-lg font-bold text-white sm:mx-0 sm:mt-5 sm:text-xl sm:font-semibold"
          style={{ animationDelay: "250ms" }}
        >
          {tagline}
        </p>
        <div className="animate-page-in mt-5 sm:mt-8" style={{ animationDelay: "400ms" }}>
          <MagneticButton>
            <Link
              href={ctaHref}
              className="inline-flex rounded-full bg-[var(--color-accent2)] px-8 py-3 text-base font-bold text-white shadow-[0_15px_40px_rgba(176,141,87,0.6)] transition hover:scale-105 hover:shadow-[0_20px_50px_rgba(176,141,87,0.75)] sm:px-10 sm:py-4 sm:text-lg"
            >
              {ctaLabel}
            </Link>
          </MagneticButton>
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-8 left-8 z-10 hidden gap-2 sm:flex">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              aria-label={`תמונה ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex ? "w-8 bg-[var(--color-accent2)]" : "w-2 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
