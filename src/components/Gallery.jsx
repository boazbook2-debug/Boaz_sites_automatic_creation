"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SampleImage from "./SampleImage";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./Icons";

const SWIPE_THRESHOLD = 40;

export default function Gallery({ images, alt }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef(null);

  const goTo = useCallback(
    (index) => setActiveIndex((index + images.length) % images.length),
    [images.length]
  );

  // Swipe left reveals the next image (from the left, where its chevron
  // button sits); swipe right reveals the previous one — same direction
  // mapping as the arrow buttons, just via touch.
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > SWIPE_THRESHOLD) goTo(activeIndex - 1);
    else if (deltaX < -SWIPE_THRESHOLD) goTo(activeIndex + 1);
    touchStartX.current = null;
  };

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

  // Lock the page behind the lightbox — without this, a fixed-position
  // overlay still lets mobile browsers scroll the page underneath it, which
  // reads as "the gallery itself scrolls".
  useEffect(() => {
    if (!lightboxOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [lightboxOpen]);

  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
        {images.map((src, index) => (
          <div
            key={src}
            className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <SampleImage src={src} alt={alt} priority={index === 0} className="h-full w-full" />
          </div>
        ))}

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute inset-0 cursor-zoom-in"
          aria-label="הגדל תמונה"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="הקודם"
              onClick={(e) => {
                e.stopPropagation();
                goTo(activeIndex - 1);
              }}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60 sm:right-4 sm:h-11 sm:w-11"
            >
              <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              type="button"
              aria-label="הבא"
              onClick={(e) => {
                e.stopPropagation();
                goTo(activeIndex + 1);
              }}
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60 sm:left-4 sm:h-11 sm:w-11"
            >
              <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <div className="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5 sm:bottom-3">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-1000 ${
                    index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-2 grid grid-cols-6 gap-1.5 sm:mt-3 sm:grid-cols-12">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`aspect-square overflow-hidden rounded-md transition ${
                index === activeIndex ? "ring-2 ring-[var(--color-accent2)]" : "opacity-70 hover:opacity-100"
              }`}
            >
              <SampleImage src={image} alt={`${alt} - תמונה ${index + 1}`} className="aspect-square" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex touch-none items-center justify-center overflow-hidden overscroll-none bg-black/90 p-2 sm:p-4"
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

              <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-1.5">
                {images.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-1000 ${
                      index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div
            className="relative h-[90dvh] w-full max-w-5xl touch-none"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {images.map((src, index) => (
              <div
                key={src}
                className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === activeIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <SampleImage src={src} alt={alt} fit="contain" className="h-full w-full" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
