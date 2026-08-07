"use client";

import { useState } from "react";
import { PlusIcon, MinusIcon } from "./Icons";

export default function FAQAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <div className="divide-y divide-[var(--color-main)]/10 overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] sm:rounded-[2rem]">
      {items.map((item, index) => {
        const isOpen = index === openIndex;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right transition-colors duration-300 hover:bg-[var(--color-background)]/60 sm:gap-4 sm:px-7 sm:py-5"
            >
              <span className="flex items-baseline gap-3 sm:gap-5">
                <span className="font-serif text-base font-bold text-[var(--color-accent2)]/40 sm:text-2xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-bold sm:text-lg">{item.question}</span>
              </span>
              <span
                className={`shrink-0 transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)] ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                {isOpen ? (
                  <MinusIcon className="h-4 w-4 text-[var(--color-accent2)] sm:h-5 sm:w-5" />
                ) : (
                  <PlusIcon className="h-4 w-4 text-[var(--color-main)]/50 sm:h-5 sm:w-5" />
                )}
              </span>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.22,.61,.36,1)]"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-4 pb-3 text-sm leading-relaxed text-[var(--color-main)]/70 sm:px-7 sm:pb-5 sm:text-lg">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
