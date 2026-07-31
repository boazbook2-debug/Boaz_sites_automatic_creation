import { FacebookIcon, InstagramIcon } from "./Icons";

export default function SocialIcons({ facebookUrl, instagramUrl, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-current/20 transition hover:bg-[var(--color-surface)]"
      >
        <FacebookIcon className="h-4 w-4" />
      </a>
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-current/20 transition hover:bg-[var(--color-surface)]"
      >
        <InstagramIcon className="h-4 w-4" />
      </a>
    </div>
  );
}
