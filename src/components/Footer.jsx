"use client";

import { useState } from "react";
import Link from "next/link";
import agency from "@/data/agency";
import navItems from "@/lib/nav";
import SocialIcons from "./SocialIcons";
import Logo from "./Logo";
import MapEmbed from "./MapEmbed";
import { isValidName, isValidPhone } from "@/lib/contactValidation";

const footerExtraLinks = [
  { label: "לקוחות ממליצים", href: "/reviews" },
  { label: "שאלות ותשובות", href: "/faq" },
];

function FooterContactForm() {
  const [values, setValues] = useState({ name: "", phone: "", message: "" });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidName(values.name)) {
      setError("נא להזין שם תקין");
      return;
    }
    if (!isValidPhone(values.phone)) {
      setError("נא להזין מספר טלפון תקין");
      return;
    }
    setError("");
    try {
      await fetch("/api/send-lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, to: agency.email }),
      });
    } catch {
      // Non-fatal.
    } finally {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return <p className="text-lg font-semibold text-white">תודה! קיבלנו את הפרטים ונחזור אליכם בהקדם.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="שם מלא"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-base font-medium text-white placeholder:text-white/50 outline-none transition focus:border-[var(--color-accent2)] sm:w-52"
        />
        <input
          type="tel"
          dir="ltr"
          placeholder="טלפון"
          value={values.phone}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-right text-base font-medium text-white placeholder:text-white/50 outline-none transition focus:border-[var(--color-accent2)] sm:w-52"
        />
      </div>
      <textarea
        placeholder="הודעה (לא חובה)"
        value={values.message}
        onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
        rows={2}
        className="w-full max-w-xl resize-none rounded-3xl border border-white/20 bg-white/10 px-6 py-3.5 text-base font-medium text-white placeholder:text-white/50 outline-none transition focus:border-[var(--color-accent2)]"
      />
      <button
        type="submit"
        className="shrink-0 self-start rounded-full bg-[var(--color-accent2)] px-8 py-3.5 text-base font-bold text-white shadow-[0_15px_35px_rgba(176,141,87,0.45)] transition hover:scale-105"
      >
        שליחה
      </button>
      {error && <p className="text-sm font-medium text-red-300">{error}</p>}
    </form>
  );
}

export default function Footer() {
  return (
    <footer className="mt-12 bg-[var(--color-main)] text-white sm:mt-24">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:py-12 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-5 border-b border-white/10 pb-6 sm:gap-8 sm:pb-10 lg:flex-row lg:items-center">
          <div>
            <p className="text-xl font-bold sm:text-2xl">
              השאירו פרטים <span className="text-[var(--color-accent2)]">ונחזור אליכם בהקדם</span>
            </p>
            <p className="mt-1.5 text-sm text-white/60 sm:mt-2 sm:text-base">נשמח לענות על כל שאלה ולעזור במציאת הנכס המתאים</p>
          </div>
          <FooterContactForm />
        </div>

        <div className="grid gap-6 py-6 sm:grid-cols-2 sm:gap-10 sm:py-10 lg:grid-cols-4">
          <div>
            <p className="font-semibold text-[var(--color-accent2)]">ניווט</p>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
              {[...navItems, ...footerExtraLinks].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/60 transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-[var(--color-accent2)]">יצירת קשר</p>
            <ul className="mt-3 space-y-2 text-white/60 sm:mt-4 sm:space-y-2.5">
              <li>{agency.address}</li>
              <li dir="ltr" className="text-right">
                <a href={`tel:${agency.phone.replace(/[\s-]/g, "")}`} className="underline decoration-white/30 underline-offset-2 transition hover:text-white">
                  {agency.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${agency.email}`} className="underline decoration-white/30 underline-offset-2 transition hover:text-white">
                  {agency.email}
                </a>
              </li>
            </ul>
            <MapEmbed address={agency.address} className="mt-4 h-[250px] w-[250px]" />
          </div>

          <div>
            <p className="font-semibold text-[var(--color-accent2)]">עקבו אחרינו</p>
            <SocialIcons
              facebookUrl={agency.facebookUrl}
              instagramUrl={agency.instagramUrl}
              className="mt-4"
            />
          </div>

          <div className="flex flex-col items-start justify-center sm:col-span-2 lg:col-span-1 lg:items-end">
            <Logo size="large" className="drop-shadow-[0_20px_45px_rgba(0,0,0,0.5)]" />
            <p className="mt-3 max-w-xs text-white/60 lg:text-right">{agency.tagline}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-4 sm:py-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center sm:gap-3 lg:flex-row">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {agency.name}. כל הזכויות שמורות.
          </p>
          <a
            href="https://boazmedia.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-shine-gold text-base font-extrabold sm:text-lg"
          >
            <span className="animate-sparkle">✨</span> נבנה על ידי בועז מדיה <span className="animate-sparkle">✨</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
