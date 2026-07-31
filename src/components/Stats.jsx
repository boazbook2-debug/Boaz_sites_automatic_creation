import { HouseIcon, TrendingUpIcon, AwardIcon, MapPinIcon, StarIcon, PhoneIcon } from "./Icons";

const stats = [
  { icon: HouseIcon, value: "450+", label: "נכסים שנמכרו והושכרו" },
  { icon: TrendingUpIcon, value: "₪280M+", label: "שווי עסקאות מצטבר" },
  { icon: AwardIcon, value: "15+", label: "שנות ותק בתחום" },
  { icon: MapPinIcon, value: "6", label: "ערים באזור המרכז" },
  { icon: StarIcon, value: "300+", label: "לקוחות מרוצים" },
  { icon: PhoneIcon, value: "24/7", label: "מענה אישי וזמין" },
];

function StatTile({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-[var(--color-surface)] px-3 py-4 text-center">
      <Icon className="h-6 w-6 text-[var(--color-accent2)]" />
      <span className="text-base font-extrabold">{value}</span>
      <span className="text-xs font-bold text-[var(--color-main)]/70">{label}</span>
    </div>
  );
}

function StatItem({ icon: Icon, value, label }) {
  return (
    <div className="flex shrink-0 items-center gap-3 pl-10">
      <Icon className="h-8 w-8 shrink-0 text-[var(--color-accent2)]" />
      <div className="whitespace-nowrap">
        <span className="text-lg font-extrabold">{value}</span>
        <span className="mr-1.5 text-base font-bold text-[var(--color-main)]/70">{label}</span>
      </div>
    </div>
  );
}

export default function Stats() {
  const isOdd = stats.length % 2 === 1;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={isOdd && i === stats.length - 1 ? "col-span-2 flex justify-center" : ""}
          >
            <div className={isOdd && i === stats.length - 1 ? "w-1/2" : "w-full"}>
              <StatTile {...stat} />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden py-4 sm:block">
        <div className="flex w-max animate-marquee">
          {[...stats, ...stats].map((stat, i) => (
            <StatItem key={i} {...stat} />
          ))}
        </div>
      </div>
    </>
  );
}
