"use client";

import { useState } from "react";
import ImageTile from "./ImageTile";

// Renders an image list with drag-to-reorder and delete/restore. Callers own
// the array and just apply the ordering rules from @/lib/imageOrdering in
// their onToggleRemove/onReorder handlers — this component only handles the
// drag interaction and numbering (active images only, in array order).
export default function SortableImageGrid({ images, onToggleRemove, onReorder, columns = "grid-cols-3" }) {
  const [draggedId, setDraggedId] = useState(null);
  const [overId, setOverId] = useState(null);

  let counter = 0;

  return (
    <div className={`grid ${columns} gap-3`}>
      {images.map((img) => {
        const number = img.removed ? null : ++counter;
        return (
          <ImageTile
            key={img.id}
            src={img.previewUrl}
            removed={img.removed}
            number={number}
            draggable={!img.removed}
            dragOver={overId === img.id && draggedId !== img.id}
            onToggleRemove={() => onToggleRemove(img.id)}
            onDragStart={() => setDraggedId(img.id)}
            onDragOver={(e) => {
              if (img.removed) return;
              e.preventDefault();
              setOverId(img.id);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedId && !img.removed) onReorder(draggedId, img.id);
              setDraggedId(null);
              setOverId(null);
            }}
            onDragEnd={() => {
              setDraggedId(null);
              setOverId(null);
            }}
          />
        );
      })}
    </div>
  );
}
