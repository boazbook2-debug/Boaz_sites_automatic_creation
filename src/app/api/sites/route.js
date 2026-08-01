import { listSites } from "@/lib/sitesStore";

export async function GET() {
  const sites = await listSites();
  const summaries = sites.map((s) => ({
    id: s.id,
    name: s.agency?.name || s.projectName,
    liveUrl: s.liveUrl,
    updatedAt: s.updatedAt,
  }));
  return Response.json({ sites: summaries });
}
