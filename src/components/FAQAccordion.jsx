"use client";

import { useState } from "react";
import { PlusIcon, MinusIcon } from "./Icons";

export default function FAQAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <div className="divide-y divide-[var(--color-main)]/10 overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:rounded-[2rem]">
      {items.map((item, index) => {
        const isOpen = index === openIndex;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right sm:gap-4 sm:px-7 sm:py-5"
            >
              <span className="text-sm font-bold sm:text-lg">{item.question}</span>
              {isOpen ? (
                <MinusIcon className="h-4 w-4 shrink-0 text-[var(--color-accent2)] sm:h-5 sm:w-5" />
              ) : (
                <PlusIcon className="h-4 w-4 shrink-0 text-[var(--color-main)]/50 sm:h-5 sm:w-5" />
              )}
            </button>
            {isOpen && (
              <p className="px-4 pb-3 text-sm leading-relaxed text-[var(--color-main)]/70 sm:px-7 sm:pb-5 sm:text-lg">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
