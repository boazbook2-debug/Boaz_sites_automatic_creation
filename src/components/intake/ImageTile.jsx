import { CloseIcon } from "@/components/Icons";

// Shared preview tile for image grids across the intake tool: shows the
// image, an order badge (active images only), and a toggle that grays it
// out and marks it "מחיקה" without actually deleting anything until save.
// `number`/`draggable`/drag handlers are optional — grids that don't need
// ordering (e.g. a single logo) can omit them entirely.
export default function ImageTile({
  src,
  removed,
  number,
  draggable = false,
  dragOver = false,
  onToggleRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`relative aspect-square overflow-hidden rounded-xl ${draggable ? "cursor-grab active:cursor-grabbing" : ""} ${
        dragOver ? "ring-2 ring-[var(--color-accent2)]" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={`h-full w-full object-cover transition ${removed ? "grayscale opacity-40" : ""}`}
      />
      {!removed && number != null && (
        <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white">
          {number}
        </span>
      )}
      <button
        type="button"
        onClick={onToggleRemove}
        className={`absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow ${
          removed ? "bg-white text-[var(--color-main)]" : "bg-red-600 text-white"
        }`}
      >
        {removed ? "בטל" : "מחיקה"}
        <CloseIcon className="h-3 w-3" />
      </button>
    </div>
  );
}
