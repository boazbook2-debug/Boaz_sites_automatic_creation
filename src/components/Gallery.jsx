"use client";

import { useCallback, useEffect, useState } from "react";
import SampleImage from "./SampleImage";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./Icons";

export default function Gallery({ images, alt }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goTo = useCallback(
    (index) => setActiveIndex((index + images.length) % images.length),
    [images.length]
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goTo(activeIndex - 1);
      if (e.key === "ArrowRight") goTo(activeIndex + 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, activeIndex, goTo]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="block w-full cursor-zoom-in"
        aria-label="הגדל תמונה"
      >
        <SampleImage
          src={images[activeIndex]}
          alt={alt}
          priority
          className="aspect-[16/10] rounded-2xl"
        />
      </button>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`overflow-hidden rounded-xl transition ${
                index === activeIndex ? "ring-2 ring-[var(--color-accent2)]" : "opacity-80 hover:opacity-100"
              }`}
            >
              <SampleImage src={image} alt={`${alt} - תמונה ${index + 1}`} className="aspect-square" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="סגור"
            onClick={() => setLightboxOpen(false)}
            className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <CloseIcon className="h-5 w-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="הקודם"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(activeIndex - 1);
                }}
                className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="הבא"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(activeIndex + 1);
                }}
                className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
            </>
          )}

          <div
            className="relative h-[80vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SampleImage src={images[activeIndex]} alt={alt} className="h-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
