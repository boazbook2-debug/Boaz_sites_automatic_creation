import { getIconById } from "@/lib/iconRegistry";
import AnimatedStatValue from "./AnimatedStatValue";
import stats from "@/data/stats";

// Swiss-editorial "data row" rather than a grid of repeated cards: no card
// chrome, just hairline dividers between figures — closer to a spec sheet
// than a dashboard widget.
function StatTile({ iconId, value, label }) {
  const Icon = getIconById(iconId).Icon;
  return (
    <div className="flex flex-col items-center gap-2 px-3 py-6 text-center sm:gap-3 sm:py-9">
      <Icon className="h-5 w-5 text-[var(--color-accent2)] sm:h-6 sm:w-6" />
      <AnimatedStatValue value={value} className="font-serif text-xl font-bold sm:text-3xl lg:text-4xl" />
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-main)]/60 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export default function Stats() {
  const isOdd = stats.length % 2 === 1;

  return (
    <div className="grid grid-cols-2 divide-x divide-y divide-[var(--color-main)]/10 border-y border-[var(--color-main)]/10 sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={isOdd && i === stats.length - 1 ? "col-span-2 flex justify-center sm:col-span-1" : ""}
        >
          <div className={isOdd && i === stats.length - 1 ? "w-1/2 sm:w-full" : "w-full"}>
            <StatTile {...stat} />
          </div>
        </div>
      ))}
    </div>
  );
}
