"use client";

import { useState } from "react";
import { isValidName, isValidPhone } from "@/lib/contactValidation";
import { toWhatsappNumber } from "@/lib/phone";
import agency from "@/data/agency";

export default function LeadForm({ title = "מעוניינים בנכס?", propertyTitle, toWhatsapp }) {
  const [values, setValues] = useState({ name: "", phone: "", message: "" });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
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

    // No backend send — the visitor's own WhatsApp opens with the message
    // already composed (their typed note, the property if any, then name +
    // phone appended); they just have to tap send there to complete it.
    const intro = values.message.trim() || "מעוניין/ת לקבל פרטים נוספים";
    const propertyLine = propertyTitle ? `\nבנוגע לנכס: ${propertyTitle}` : "";
    const text = `${intro}${propertyLine}\n\nשם: ${values.name}\nטלפון: ${values.phone}`;
    const number = toWhatsappNumber(toWhatsapp || agency.whatsapp);
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, "_blank");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-[var(--color-surface)] p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.08)] sm:rounded-[2rem]">
        <p className="text-lg font-bold">הפנייה נשלחה בהצלחה!</p>
        <p className="mt-1 text-sm text-[var(--color-main)]/70">ניצור איתכם קשר בהקדם.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] sm:rounded-[2rem] sm:p-6"
    >
      <p className="text-lg font-bold sm:text-xl">{title}</p>
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="שם מלא"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            className="w-full rounded-full border border-[var(--color-main)]/15 bg-[var(--color-background)] px-5 py-3 text-sm font-medium shadow-sm outline-none transition focus:border-[var(--color-accent2)] focus:shadow-md"
          />
          <input
            type="tel"
            dir="ltr"
            placeholder="טלפון"
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            className="w-full rounded-full border border-[var(--color-main)]/15 bg-[var(--color-background)] px-5 py-3 text-right text-sm font-medium shadow-sm outline-none transition focus:border-[var(--color-accent2)] focus:shadow-md"
          />
        </div>
        <textarea
          placeholder="הודעה (לא חובה)"
          value={values.message}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
          rows={2}
          className="w-full resize-none rounded-2xl border border-[var(--color-main)]/15 bg-[var(--color-background)] px-5 py-3 text-sm font-medium shadow-sm outline-none transition focus:border-[var(--color-accent2)] focus:shadow-md"
        />
        <button
          type="submit"
          className="w-full rounded-full bg-[var(--color-accent2)] px-6 py-3 text-sm font-bold text-white shadow-[0_15px_35px_rgba(176,141,87,0.45)] transition hover:scale-[1.02] hover:shadow-[0_20px_45px_rgba(176,141,87,0.6)] sm:w-auto"
        >
          שליחה
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </form>
  );
}
