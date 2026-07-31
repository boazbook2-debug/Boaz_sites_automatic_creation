"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import siteConfig from "@/data/siteConfig";

const SLIDE_DURATION = 5000;

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
    <section className="relative flex h-[68vh] min-h-[420px] items-center justify-center overflow-hidden bg-black sm:h-[92vh] sm:min-h-[640px]">
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

      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h1 className="hero-text-glow text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-7xl sm:font-extrabold lg:text-8xl">
          {title}
        </h1>
        <p className="hero-text-glow mx-auto mt-3 max-w-2xl text-lg font-bold text-white sm:mt-6 sm:text-2xl sm:font-semibold">
          {tagline}
        </p>
        <Link
          href={ctaHref}
          className="mt-5 inline-flex rounded-full bg-[var(--color-accent2)] px-8 py-3 text-base font-bold text-white shadow-[0_15px_40px_rgba(176,141,87,0.6)] transition hover:scale-105 hover:shadow-[0_20px_50px_rgba(176,141,87,0.75)] sm:mt-10 sm:px-10 sm:py-4 sm:text-lg"
        >
          {ctaLabel}
        </Link>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
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
