"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SampleImage from "./SampleImage";
import { CloseIcon } from "./Icons";
import showcase from "@/data/showcase";
import properties from "@/data/properties";

// Bullet count is capped at 6 in the intake form — 5 or fewer sit in a
// single row (no wrap), exactly 6 becomes a clean 3x2 grid instead of an
// uneven wrap. Shrink text a step as the count grows so either shape fits
// the fixed-height bottom bar.
function bulletTextSize(count) {
  if (count <= 3) return "text-xs sm:text-base";
  if (count <= 5) return "text-[0.7rem] sm:text-sm";
  return "text-[0.6rem] sm:text-xs";
}

// Site-wide "special showcase project" teaser: fades/grows in 3s after the
// homepage loads. Only ever appears on "/" — navigating to any other page
// (even without closing it first) hides it immediately since `hasContent`
// goes false, and it only comes back on a fresh visit/reload of the homepage
// itself, never by clicking around the site. Renders nothing at all if the
// admin never filled in the showcase section of the intake form for this site.
export default function ShowcasePopup() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);

  const hasContent = pathname === "/" && Boolean(showcase.image && showcase.projectName?.trim());

  useEffect(() => {
    if (!hasContent) return;
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [hasContent]);

  if (!hasContent || closed) return null;

  const bullets = showcase.bullets || [];
  const linkedProperty = showcase.linkedPropertyId
    ? properties.find((p) => p.id === showcase.linkedPropertyId)
    : null;

  return (
    <div
      onClick={() => setClosed(true)}
      // No dark backdrop — the site behind stays exactly as-is; the popup's own
      // heavy drop shadow is what separates it from the page instead.
      className={`fixed inset-0 z-[70] flex items-center justify-center bg-transparent p-4 ${
        visible ? "" : "pointer-events-none"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        // 2s entrance: grows from small/near-invisible to full size/fully opaque
        // ("clarity 100% to solid") rather than the quick fade used elsewhere.
        className={`relative flex w-[90vw] max-w-[400px] flex-col overflow-hidden rounded-3xl bg-white shadow-[0_0_120px_45px_rgba(0,0,0,0.85)] transition-all duration-[2000ms] ease-out aspect-[3/4.3] sm:w-[70vw] sm:max-w-[1150px] sm:aspect-[16/10] ${
          visible ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => setClosed(true)}
          aria-label="סגור"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60 sm:h-11 sm:w-11"
        >
          <CloseIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <div className="relative flex-1 overflow-hidden">
          <SampleImage
            src={showcase.image}
            alt={showcase.projectName}
            className="h-full w-full"
            imgClassName="animate-showcase-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/60" />

          {/* Pinned to the top of the image. On mobile the card is narrow (portrait),
              so agent + headline stack vertically (each gets full width) instead of
              squeezing side by side — that's what was pushing text off-frame. From
              sm+ (wide desktop card) they sit in one row, capped at 20% of height.
              dir="ltr" fixes physical left/right regardless of the page's RTL context. */}
          <div
            dir="ltr"
            className="absolute inset-x-0 top-0 flex max-h-[45%] flex-col items-center justify-center gap-2 overflow-hidden px-4 pt-3 sm:h-[20%] sm:max-h-none sm:flex-row sm:justify-between sm:gap-5 sm:px-8 sm:pt-0"
          >
            {(showcase.agentName || showcase.agentPhone) && (
              <div dir="ltr" className="flex shrink-0 items-center gap-1.5 sm:gap-3">
                {showcase.agentImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={showcase.agentImage}
                    alt={showcase.agentName}
                    className="h-8 w-8 shrink-0 rounded-full border-2 border-white object-cover shadow-[0_4px_20px_rgba(0,0,0,0.6)] sm:h-16 sm:w-16"
                  />
                )}
                <div dir="rtl" className="flex flex-col items-start leading-tight text-white">
                  {showcase.agentName && (
                    <span className="hero-text-glow text-xs font-extrabold sm:text-lg">{showcase.agentName}</span>
                  )}
                  {showcase.agentPhone && (
                    <a
                      href={`tel:${showcase.agentPhone.replace(/\D/g, "")}`}
                      onClick={(e) => e.stopPropagation()}
                      dir="ltr"
                      className="hero-text-glow text-[0.65rem] font-bold text-white/90 underline-offset-2 hover:underline sm:text-sm"
                    >
                      {showcase.agentPhone}
                    </a>
                  )}
                  {linkedProperty && (
                    <a
                      href={`/properties/${linkedProperty.id}`}
                      onClick={(e) => e.stopPropagation()}
                      dir="rtl"
                      className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-[var(--color-accent2)] px-3 py-1 text-[0.6rem] font-bold text-white shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition hover:scale-105 hover:brightness-110 sm:px-5 sm:py-1.5 sm:text-sm"
                    >
                      מידע נוסף על הפרויקט ←
                    </a>
                  )}
                </div>
              </div>
            )}

            <div
              dir="rtl"
              className="flex w-full flex-col items-center gap-0.5 text-center leading-tight text-white sm:w-auto sm:max-w-[65%] sm:items-start sm:pr-14 sm:text-right"
            >
              <h2 className="hero-text-glow text-base font-extrabold tracking-tight sm:text-3xl">
                {showcase.projectName}
              </h2>
              {showcase.description && (
                <p className="hero-text-glow line-clamp-2 text-[0.65rem] text-white/90 sm:line-clamp-1 sm:text-base">
                  {showcase.description}
                </p>
              )}
              {!(showcase.agentName || showcase.agentPhone) && linkedProperty && (
                <a
                  href={`/properties/${linkedProperty.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-0.5 rounded-full bg-white/15 px-3 py-0.5 text-[0.6rem] font-bold text-white shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-sm transition hover:bg-white/25 sm:px-5 sm:py-1 sm:text-sm"
                >
                  מידע נוסף על הפרויקט
                </a>
              )}
            </div>
          </div>
        </div>

        {bullets.length > 0 && (
          <div className="flex shrink-0 basis-[18%] items-center justify-center overflow-hidden bg-white px-3 py-1 sm:basis-[10%]">
            <ul
              className={`w-full items-center gap-x-3 gap-y-0.5 leading-tight ${bulletTextSize(bullets.length)} ${
                bullets.length > 5
                  ? "grid grid-cols-2 sm:grid-cols-3"
                  : "flex flex-wrap justify-center sm:flex-nowrap"
              }`}
            >
              {bullets.slice(0, 6).map((bullet, i) => (
                <li key={i} className="flex items-center justify-center gap-1 font-bold text-[var(--color-main)]/85">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent2)]" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
