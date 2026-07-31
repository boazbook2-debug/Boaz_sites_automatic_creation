"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { uniqueSorted } from "@/lib/properties";
import { ChevronUpIcon, ChevronDownIcon } from "./Icons";

const MIN_ROOMS = 1;
const MAX_ROOMS = 8;

export default function QuickSearch({ properties }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [rooms, setRooms] = useState(null);

  const locations = useMemo(() => uniqueSorted(properties.map((p) => p.location)), [properties]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (location) params.set("location", location);
    if (rooms) params.append("rooms", String(rooms));
    router.push(`/properties${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="relative z-10 mx-auto -mt-8 w-full max-w-5xl px-6 sm:-mt-14">
      <div className="rounded-2xl bg-[var(--color-background)] p-5 shadow-[0_20px_45px_rgba(0,0,0,0.12)] sm:p-8">
        <h2 className="mb-4 text-center text-lg font-extrabold tracking-tight sm:mb-6 sm:text-2xl">
          מצאו את הנכס <span className="text-[var(--color-accent2)]">הבא שלכם</span>
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-[1fr_1fr_auto_auto]">
        <div>
          <label className="mb-2 block text-xs font-semibold text-[var(--color-main)]/60">סטטוס</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-full border border-[var(--color-main)]/15 bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent2)]"
          >
            <option value="">הכל</option>
            <option value="sale">למכירה</option>
            <option value="rent">להשכרה</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-[var(--color-main)]/60">מיקום</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-full border border-[var(--color-main)]/15 bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent2)]"
          >
            <option value="">כל האזורים</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-[var(--color-main)]/60">חדרים</label>
          <div className="flex items-center gap-3 rounded-full border border-[var(--color-main)]/15 px-4 py-2">
            <span className="w-10 text-center text-sm font-medium">
              {rooms ? (rooms >= MAX_ROOMS ? `${MAX_ROOMS}+` : rooms) : "הכל"}
            </span>
            <div className="flex flex-col">
              <button
                type="button"
                aria-label="הוסף חדר"
                onClick={() => setRooms((r) => Math.min((r ?? MIN_ROOMS - 1) + 1, MAX_ROOMS))}
                className="text-[var(--color-main)]/60 hover:text-[var(--color-accent2)]"
              >
                <ChevronUpIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="הפחת חדר"
                onClick={() => setRooms((r) => (r === null ? null : r <= MIN_ROOMS ? null : r - 1))}
                className="text-[var(--color-main)]/60 hover:text-[var(--color-accent2)]"
              >
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleSearch}
            className="w-full rounded-full bg-[var(--color-accent2)] px-8 py-2.5 text-sm font-medium text-white transition hover:opacity-90 lg:w-auto"
          >
            חיפוש
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
