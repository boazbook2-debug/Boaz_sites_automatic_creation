// Formats a raw Unsplash photo id into a ready-to-use source URL.
// Used only by sample data in src/data — client photos will be real uploaded files.
export function unsplash(id, width = 1600) {
  return `https://images.unsplash.com/photo-${id}?q=80&w=${width}&auto=format&fit=crop`;
}
