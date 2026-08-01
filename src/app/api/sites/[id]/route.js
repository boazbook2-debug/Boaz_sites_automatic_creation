import { getSite } from "@/lib/sitesStore";

export async function GET(request, { params }) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) return Response.json({ error: "not-found" }, { status: 404 });
  return Response.json(site);
}
