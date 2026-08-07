import agency from "@/data/agency";

const COOKIE_NAME = "demo_access";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request) {
  const { code } = await request.json();
  if (!agency.demoAccessCode || code !== agency.demoAccessCode) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const res = Response.json({ ok: true });
  res.headers.set(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(code)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}`
  );
  return res;
}
