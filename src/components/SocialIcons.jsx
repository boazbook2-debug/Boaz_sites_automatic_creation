import { FacebookIcon, InstagramIcon, ExternalLinkIcon } from "./Icons";

export default function SocialIcons({ facebookUrl, instagramUrl, madlanUrl, yad2Url, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-current/20 transition hover:bg-white/10"
      >
        <FacebookIcon className="h-4 w-4" />
      </a>
      <a
        href={instagramUrl || "https://instagram.com"}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-current/20 transition hover:bg-white/10"
      >
        <InstagramIcon className="h-4 w-4" />
      </a>
      {madlanUrl && (
        <a
          href={madlanUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="מדלן"
          title="מדלן"
          className="flex h-9 items-center justify-center gap-1 rounded-full border border-current/20 px-3 text-xs font-medium transition hover:bg-white/10"
        >
          <ExternalLinkIcon className="h-3.5 w-3.5" />
          מדלן
        </a>
      )}
      {yad2Url && (
        <a
          href={yad2Url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="יד2"
          title="יד2"
          className="flex h-9 items-center justify-center gap-1 rounded-full border border-current/20 px-3 text-xs font-medium transition hover:bg-white/10"
        >
          <ExternalLinkIcon className="h-3.5 w-3.5" />
          יד2
        </a>
      )}
    </div>
  );
}
