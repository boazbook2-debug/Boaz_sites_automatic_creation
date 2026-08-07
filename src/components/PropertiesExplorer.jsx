"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PropertyGrid from "./PropertyGrid";
import { filterProperties, uniqueSorted } from "@/lib/properties";
import { statusLabel } from "@/lib/format";

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function PropertiesExplorer({ properties }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? "";
  const types = searchParams.getAll("type");
  const rooms = searchParams.getAll("rooms");
  const locations = searchParams.getAll("location");

  const options = useMemo(
    () => ({
      types: uniqueSorted(properties.map((p) => p.type)),
      rooms: uniqueSorted(properties.map((p) => p.rooms)).map(String),
      locations: uniqueSorted(properties.map((p) => p.location)),
    }),
    [properties]
  );

  const filtered = useMemo(
    () => filterProperties(properties, { status, types, rooms, locations }),
    [properties, status, types, rooms, locations]
  );

  const updateParams = (mutator) => {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    router.push(`/properties${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  };

  const setStatus = (value) =>
    updateParams((params) => {
      if (!value || value === status) params.delete("status");
      else params.set("status", value);
    });

  const toggleParam = (key, value) =>
    updateParams((params) => {
      const current = params.getAll(key);
      const next = toggleValue(current, value);
      params.delete(key);
      next.forEach((v) => params.append(key, v));
    });

  const clearAll = () => router.push("/properties", { scroll: false });

  const hasActiveFilters = status || types.length || rooms.length || locations.length;

  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
      <aside className="hidden space-y-8 lg:block">
        <FilterGroup label="סטטוס">
          <div className="flex flex-wrap gap-2">
            {["sale", "rent"].map((value) => (
              <Chip key={value} active={status === value} onClick={() => setStatus(value)}>
                {statusLabel[value]}
              </Chip>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup label="סוג נכס">
          <div className="flex flex-wrap gap-2">
            {options.types.map((value) => (
              <Chip key={value} active={types.includes(value)} onClick={() => toggleParam("type", value)}>
                {value}
              </Chip>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup label="חדרים">
          <div className="flex flex-wrap gap-2">
            {options.rooms.map((value) => (
              <Chip key={value} active={rooms.includes(value)} onClick={() => toggleParam("rooms", value)}>
                {value}
              </Chip>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup label="מיקום">
          <div className="flex flex-wrap gap-2">
            {options.locations.map((value) => (
              <Chip
                key={value}
                active={locations.includes(value)}
                onClick={() => toggleParam("location", value)}
              >
                {value}
              </Chip>
            ))}
          </div>
        </FilterGroup>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-[var(--color-main)]/60 underline underline-offset-4 hover:text-[var(--color-main)]"
          >
            נקה סינון
          </button>
        )}
      </aside>

      {/* Mobile: one compact row per filter (label on the right, a
          single-line horizontally-scrollable chip strip on the left)
          instead of a tall wrapping list — keeps the property grid visible
          near the top of the page. */}
      <div className="mb-4 divide-y divide-[var(--color-main)]/10 border-y border-[var(--color-main)]/10 lg:hidden">
        <FilterRow label="סטטוס">
          {["sale", "rent"].map((value) => (
            <Chip key={value} active={status === value} onClick={() => setStatus(value)}>
              {statusLabel[value]}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="סוג נכס">
          {options.types.map((value) => (
            <Chip key={value} active={types.includes(value)} onClick={() => toggleParam("type", value)}>
              {value}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="חדרים">
          {options.rooms.map((value) => (
            <Chip key={value} active={rooms.includes(value)} onClick={() => toggleParam("rooms", value)}>
              {value}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="מיקום">
          {options.locations.map((value) => (
            <Chip key={value} active={locations.includes(value)} onClick={() => toggleParam("location", value)}>
              {value}
            </Chip>
          ))}
        </FilterRow>

        {hasActiveFilters && (
          <div className="py-2.5">
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-[var(--color-main)]/60 underline underline-offset-4"
            >
              נקה סינון
            </button>
          </div>
        )}
      </div>

      <div>
        <p className="mb-6 text-sm text-[var(--color-main)]/60">{filtered.length} נכסים נמצאו</p>
        <PropertyGrid properties={filtered} />
      </div>
    </div>
  );
}

function FilterRow({ label, children }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="w-14 shrink-0 text-sm font-semibold text-[var(--color-main)]/90">{label}</span>
      <div className="flex flex-1 gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        {children}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-[var(--color-main)]/90">{label}</p>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${
        active
          ? "border-[var(--color-accent2)] bg-[var(--color-accent2)] text-white"
          : "border-[var(--color-main)]/15 text-[var(--color-main)]/75 hover:border-[var(--color-main)]/30"
      }`}
    >
      {children}
    </button>
  );
}
