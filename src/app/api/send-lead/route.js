import agency from "@/data/agency";

export async function POST(request) {
  const body = await request.json();
  const { name, phone, message, propertyTitle, to } = body;
  const apiKey = process.env.RESEND_API_KEY;

  // eslint-disable-next-line no-console
  console.log("Lead received:", { name, phone, message, propertyTitle, to });

  if (!apiKey) {
    // No email service configured yet — the lead is still logged server-side
    // above so nothing is lost, it just isn't emailed until RESEND_API_KEY is set.
    return Response.json({ sent: false, reason: "no-api-key" });
  }

  const subjectSuffix = propertyTitle ? ` — ${propertyTitle}` : "";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: [to || agency.email],
        subject: `פנייה חדשה מהאתר — ${agency.name}${subjectSuffix}`,
        text: `שם: ${name}\nטלפון: ${phone}\n${propertyTitle ? `נכס: ${propertyTitle}\n` : ""}הודעה: ${message || "(ללא הודעה)"}`,
      }),
    });

    if (!res.ok) return Response.json({ sent: false, reason: "send-failed" });
    return Response.json({ sent: true });
  } catch {
    return Response.json({ sent: false, reason: "network-error" });
  }
}
