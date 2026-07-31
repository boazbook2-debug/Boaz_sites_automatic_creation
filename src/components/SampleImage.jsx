import Image from "next/image";
import siteConfig from "@/data/siteConfig";

// Permanent shell component: every property/agent/hero photo renders through
// this wrapper. The "EXAMPLE" watermark is driven entirely by siteConfig — it
// is never on for real client photos, only while showSampleWatermark is true.
export default function SampleImage({
  src,
  alt,
  fill = true,
  width,
  height,
  sizes = "100vw",
  priority = false,
  fit = "cover",
  className = "",
  imgClassName = "",
  children,
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`${fit === "contain" ? "object-contain" : "object-cover"} ${imgClassName}`}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          className={imgClassName}
        />
      )}
      {siteConfig.showSampleWatermark && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="-rotate-[24deg] select-none whitespace-nowrap rounded bg-black/35 px-5 py-1 text-sm font-bold tracking-[0.35em] text-white/90 sm:px-6 sm:text-xl">
            EXAMPLE
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
