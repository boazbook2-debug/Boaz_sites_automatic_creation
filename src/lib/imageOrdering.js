// Shared ordering rules for every image grid in the intake form (hero
// slideshow, property photos): the array is always kept sorted with active
// (non-removed) images first — in their display order — followed by removed
// images in the order they were removed. Numbering, dragging, and the
// restore-goes-to-the-end behavior all fall out of that one invariant.

let idCounter = 0;
export const nextImageId = () => `img-${Date.now().toString(36)}-${++idCounter}`;

// New uploads join the end of the active segment (i.e. after the last
// active image, before any removed ones) so they display last until dragged.
export function addImages(images, newItems) {
  const activeCount = images.filter((img) => !img.removed).length;
  return [...images.slice(0, activeCount), ...newItems, ...images.slice(activeCount)];
}

// Removing pushes the image to the very end (past any already-removed
// images); restoring re-inserts it right after the current active images,
// so it picks up the next number, before whatever is still removed.
export function toggleImageRemoved(images, id) {
  const target = images.find((img) => img.id === id);
  if (!target) return images;
  const rest = images.filter((img) => img.id !== id);
  if (target.removed) {
    const activeCount = rest.filter((img) => !img.removed).length;
    return [...rest.slice(0, activeCount), { ...target, removed: false }, ...rest.slice(activeCount)];
  }
  return [...rest, { ...target, removed: true }];
}

// Drag-and-drop reorder — only meaningful within the active segment, since
// removed images have no position/number to move to.
export function reorderImages(images, draggedId, targetId) {
  if (draggedId === targetId) return images;
  const activeIds = images.filter((img) => !img.removed).map((img) => img.id);
  const from = activeIds.indexOf(draggedId);
  const to = activeIds.indexOf(targetId);
  if (from === -1 || to === -1) return images;

  const reordered = [...activeIds];
  const [moved] = reordered.splice(from, 1);
  reordered.splice(to, 0, moved);

  const byId = new Map(images.map((img) => [img.id, img]));
  const removedImages = images.filter((img) => img.removed);
  return [...reordered.map((id) => byId.get(id)), ...removedImages];
}

// Storage filename for a freshly-picked File — keyed by the tile's own id
// (already unique) rather than the original filename, so two uploads named
// e.g. "photo.jpg" for different agents/properties never collide once they
// all land together in one site's /uploads folder.
export function filenameForUpload(id, file) {
  const dot = file.name.lastIndexOf(".");
  const ext = dot >= 0 ? file.name.slice(dot) : "";
  return `${id}${ext}`;
}

// New uploads carry a File (filenameForUpload gives the eventual
// /uploads/<name>); existing images loaded from a saved site only have a
// previewUrl already pointing at /uploads/<name> — strip that prefix back to
// the bare filename so it round-trips through the generated data file
// unchanged either way. Order matches the active segment (display order).
export function storageFilename(img) {
  if (img.file) return filenameForUpload(img.id, img.file);
  return img.previewUrl.replace(/^\/uploads\//, "");
}

export function syncImageFilenames(images) {
  return images.filter((img) => !img.removed).map(storageFilename);
}
