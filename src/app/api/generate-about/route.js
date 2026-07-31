const MODEL = "claude-sonnet-4-5-20250929";

function buildPrompt({ agencyName, yearsInBusiness, whatMakesSpecial, areas, approach }) {
  return `כתוב שני טקסטים שיווקיים בעברית עבור אתר של משרד תיווך בשם "${agencyName}", בהתבסס על התשובות הבאות:
שנות ותק: ${yearsInBusiness}
מה מייחד אותם: ${whatMakesSpecial}
אזורי פעילות: ${areas}
גישה וערכים: ${approach}

החזר אך ורק אובייקט JSON תקין בפורמט הבא, ללא טקסט נוסף:
{"aboutText": "פסקת 'אודות' מקצועית ונעימה, כ-4-5 משפטים, בגוף שלישי", "ownerQuote": "ציטוט אישי קצר בגוף ראשון מבעל המשרד, 2-3 משפטים, חם ואותנטי"}`;
}

function fallback({ agencyName, yearsInBusiness, whatMakesSpecial, areas, approach }) {
  return {
    aboutText: `${agencyName} פועל בתחום הנדל"ן כבר ${yearsInBusiness || "מספר"} שנים, ופעיל באזורים ${areas || "המרכז"}. ${whatMakesSpecial || "הצוות מתמחה בליווי אישי ומקצועי לאורך כל התהליך"}. הגישה שלנו: ${approach || "שקיפות, מקצועיות וזמינות מלאה ללקוח"}.`,
    ownerQuote: `כל לקוח שאני פוגש מקבל ממני יחס אישי ומחויבות מלאה. המטרה שלי היא שתרגישו בטוחים ומלווים לאורך כל הדרך, מהרגע הראשון ועד למסירת המפתח.`,
  };
}

export async function POST(request) {
  const body = await request.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json(fallback(body));
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        messages: [{ role: "user", content: buildPrompt(body) }],
      }),
    });

    if (!res.ok) return Response.json(fallback(body));

    const data = await res.json();
    const text = data.content?.[0]?.text ?? "";
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");

    if (!parsed.aboutText || !parsed.ownerQuote) return Response.json(fallback(body));
    return Response.json(parsed);
  } catch {
    return Response.json(fallback(body));
  }
}
