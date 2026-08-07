"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import agency from "@/data/agency";
import navItems from "@/lib/nav";
import useWhatsappHref from "@/lib/useWhatsappHref";
import SocialIcons from "./SocialIcons";
import Logo from "./Logo";
import { MenuIcon, CloseIcon, PhoneIcon, WhatsAppIcon } from "./Icons";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const whatsappHref = useWhatsappHref();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, searchParams]);

  const isActive = (href) => {
    const [hrefPath, hrefQuery] = href.split("?");
    if (hrefPath !== pathname) return false;
    if (!hrefQuery) return !searchParams.get("status");
    const params = new URLSearchParams(hrefQuery);
    return params.get("status") === searchParams.get("status");
  };

  return (
    <header
      className={`sticky top-0 z-40 bg-black text-white transition-shadow duration-300 ${
        scrolled ? "shadow-[0_4px_20px_rgba(0,0,0,0.35)]" : ""
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Logo className="shrink-0" />

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems
            .filter((item) => item.label !== "צור קשר")
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-base font-bold transition-colors ${
                  isActive(item.href) ? "text-[var(--color-accent2)]" : "text-white/75 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-4 lg:flex">
            <SocialIcons facebookUrl={agency.facebookUrl} instagramUrl={agency.instagramUrl} />
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="וואטסאפ"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-[#25D366] transition hover:bg-white/10"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
          </div>

          <a
            href={`tel:${agency.phone}`}
            aria-label="חייגו אלינו"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10"
          >
            <PhoneIcon className="h-4 w-4" />
          </a>

          <Link
            href="/contact"
            className="hidden rounded-full bg-[var(--color-accent2)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 sm:inline-flex"
          >
            צור קשר
          </Link>
          <button
            type="button"
            aria-label="פתח תפריט"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white lg:hidden"
          >
            {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/10 bg-black px-6 py-4 lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2.5 text-base font-bold ${
                isActive(item.href) ? "bg-white/10 text-[var(--color-accent2)]" : "text-white/80"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
