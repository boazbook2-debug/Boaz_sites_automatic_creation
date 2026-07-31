import { sendNtfy } from "@/lib/ntfy";

export async function POST(request) {
  const { title, message } = await request.json();
  await sendNtfy({ title, message });
  return Response.json({ ok: true });
}
