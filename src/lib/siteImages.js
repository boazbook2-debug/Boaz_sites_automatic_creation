import { get } from "@vercel/blob";

// Uploaded image bytes (logo, hero slideshow, agent photos, property photos)
// keyed by site + filename — separate from sitesStore.js (which only holds
// the JSON site record). The intake form (src/components/intake/IntakeForm.jsx)
// uploads directly here via @vercel/blob/client at the same path, so the
// deploy route just reads back whatever's already there.
const imagePath = (siteId, filename) => `sites/${siteId}/uploads/${filename}`;

export async function getSiteImage(siteId, filename) {
  const result = await get(imagePath(siteId, filename), { access: "private" });
  if (!result || result.statusCode !== 200) return null;
  const arrayBuffer = await new Response(result.stream).arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}
