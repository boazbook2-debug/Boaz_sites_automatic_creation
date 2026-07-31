import { HouseIcon } from "@/components/Icons";

export default function IntakeHeader() {
  return (
    <header className="border-b border-[var(--color-main)]/10 bg-[var(--color-background)]">
      <div className="mx-auto flex h-20 max-w-7xl items-center px-6 lg:px-10">
        <span className="inline-flex items-center gap-2.5">
          <HouseIcon className="h-7 w-7 shrink-0 text-[var(--color-accent2)]" />
          <span className="text-xl font-extrabold tracking-tight">Boaz Template Site</span>
        </span>
      </div>
    </header>
  );
}
