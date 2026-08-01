import { CloseIcon } from "@/components/Icons";

// Shared preview tile for property image grids (admin intake form and the
// client-facing property editor): shows the image, and a toggle that grays
// it out and marks it "מחיקה" without actually deleting anything until save.
export default function ImageTile({ src, removed, onToggleRemove }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={`h-full w-full object-cover transition ${removed ? "grayscale opacity-40" : ""}`}
      />
      <button
        type="button"
        onClick={onToggleRemove}
        className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow ${
          removed ? "bg-white text-[var(--color-main)]" : "bg-red-600 text-white"
        }`}
      >
        {removed ? "בטל" : "מחיקה"}
        <CloseIcon className="h-3 w-3" />
      </button>
    </div>
  );
}
