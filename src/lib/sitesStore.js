import { put, list, get } from "@vercel/blob";

// Persists each client site's full questionnaire data (agency/agents/
// properties/testimonials/faq/stats + which Vercel project it deployed to)
// as one private JSON blob per site, so the admin dashboard can list sites
// and reload one for editing/redeploying. Low write volume, no relational
// queries — a plain key-value JSON store is all this needs.
const PREFIX = "sites/";

async function readBlob(pathname) {
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200) return null;
  const text = await new Response(result.stream).text();
  return JSON.parse(text);
}

export async function listSites() {
  const { blobs } = await list({ prefix: PREFIX });
  const records = await Promise.all(blobs.map((b) => readBlob(b.pathname)));
  return records
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getSite(id) {
  return readBlob(`${PREFIX}${id}.json`);
}

export async function saveSite(record) {
  await put(`${PREFIX}${record.id}.json`, JSON.stringify(record), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return record;
}
