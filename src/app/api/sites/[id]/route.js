import { getSite, deleteSite } from "@/lib/sitesStore";
import { sendNtfy } from "@/lib/ntfy";

export async function GET(request, { params }) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) return Response.json({ error: "not-found" }, { status: 404 });
  return Response.json(site);
}

// Permanently deletes both the site record (+ its uploaded images) and the
// live Vercel project it deployed to — the admin-password confirmation
// screen (src/components/intake/IntakeFlow.jsx) is the only guard in front
// of this, so this route itself does no further confirmation.
export async function DELETE(request, { params }) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) return Response.json({ error: "not-found" }, { status: 404 });

  const token = process.env.VERCEL_DEPLOY_TOKEN;
  if (token && site.projectName) {
    const res = await fetch(`https://api.vercel.com/v9/projects/${site.projectName}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });
    if (!res.ok && res.status !== 404) {
      const detail = await res.json().catch(() => null);
      return Response.json({ ok: false, reason: "vercel-delete-failed", detail }, { status: 500 });
    }
  }

  await deleteSite(id);

  await sendNtfy({
    title: "אתר נמחק",
    message: `סוכנות: ${site.agency?.name || id}\nכתובת: ${site.liveUrl || ""}`,
  });

  return Response.json({ ok: true });
}
