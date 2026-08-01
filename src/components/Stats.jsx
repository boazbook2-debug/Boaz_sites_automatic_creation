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
      <Icon className="h-6 w-6 text-[var(--color-accent2)] sm:h-7 sm:w-7" />
      <span className="text-base font-extrabold sm:text-lg">{value}</span>
      <span className="text-xs font-bold text-[var(--color-main)]/70 sm:text-sm">{label}</span>
    </div>
  );
}

export default function Stats() {
  const isOdd = stats.length % 2 === 1;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
