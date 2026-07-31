import { HouseIcon, TrendingUpIcon, AwardIcon, MapPinIcon, StarIcon, PhoneIcon } from "./Icons";

const stats = [
  { icon: HouseIcon, value: "450+", label: "נכסים שנמכרו והושכרו" },
  { icon: TrendingUpIcon, value: "₪280M+", label: "שווי עסקאות מצטבר" },
  { icon: AwardIcon, value: "15+", label: "שנות ותק בתחום" },
  { icon: MapPinIcon, value: "6", label: "ערים באזור המרכז" },
  { icon: StarIcon, value: "300+", label: "לקוחות מרוצים" },
  { icon: PhoneIcon, value: "24/7", label: "מענה אישי וזמין" },
];

function StatItem({ icon: Icon, value, label }) {
  return (
    <div className="flex shrink-0 items-center gap-2 pl-8 sm:gap-3 sm:pl-10">
      <Icon className="h-5 w-5 shrink-0 text-[var(--color-accent2)] sm:h-8 sm:w-8" />
      <div className="whitespace-nowrap">
        <span className="text-sm font-extrabold sm:text-lg">{value}</span>
        <span className="mr-1.5 text-xs font-bold text-[var(--color-main)]/70 sm:text-base">{label}</span>
      </div>
    </div>
  );
}

export default function Stats() {
  return (
    <div className="overflow-hidden py-2 sm:py-4">
      <div className="flex w-max animate-marquee">
        {[...stats, ...stats].map((stat, i) => (
          <StatItem key={i} {...stat} />
        ))}
      </div>
    </div>
  );
}
