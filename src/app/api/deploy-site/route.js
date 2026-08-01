import {
  generateAgencyFile,
  generateAgentsFile,
  generatePropertiesFile,
  generateTestimonialsFile,
  generateFaqFile,
  generateStatsFile,
} from "@/lib/generateDataFiles";
import { collectTemplateFiles } from "@/lib/collectTemplateFiles";
import { sendNtfy } from "@/lib/ntfy";
import { saveSite } from "@/lib/sitesStore";

const nextSiteId = () => `site-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function slugify(name) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9א-ת\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  // Hebrew names transliterate to nothing useful for a URL — fall back to a
  // generic prefix with a short random suffix so the deploy always has a
  // valid, unique-enough Vercel project name.
  const asciiOnly = /^[a-z0-9-]+$/.test(base) && base.length > 0;
  const slug = asciiOnly ? base : "agency-site";
  return `${slug}-${Math.random().toString(36).slice(2, 7)}`;
}

async function pollDeployment(id, token) {
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(`https://api.vercel.com/v13/deployments/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.readyState === "READY" || data.readyState === "ERROR") return data;
  }
  return { readyState: "TIMEOUT" };
}

export async function POST(request) {
  const token = process.env.VERCEL_DEPLOY_TOKEN;
  if (!token) {
    return Response.json({ ok: false, reason: "no-token" }, { status: 400 });
  }

  const body = await request.json();
  const { agency, agents, properties, testimonials, faq, stats, siteId, projectName: existingProjectName } = body;

  const dataFiles = [
    { file: "src/data/agency.js", data: generateAgencyFile(agency) },
    { file: "src/data/agents.js", data: generateAgentsFile(agents) },
    { file: "src/data/properties.js", data: generatePropertiesFile(properties) },
    { file: "src/data/testimonials.js", data: generateTestimonialsFile(testimonials || []) },
    { file: "src/data/faq.js", data: generateFaqFile(faq || []) },
    {
      file: "src/data/siteConfig.js",
      data: `const siteConfig = { showSampleWatermark: false };\nexport default siteConfig;\n`,
    },
  ];

  let templateFiles;
  try {
    templateFiles = collectTemplateFiles(process.cwd());
  } catch (err) {
    return Response.json({ ok: false, reason: "file-collection-failed", detail: String(err) }, { status: 500 });
  }

  const projectName = existingProjectName || slugify(agency.name);
  const files = [...templateFiles, ...dataFiles];

  const createRes = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name: projectName,
      files,
      target: "production",
      projectSettings: { framework: "nextjs" },
    }),
  });

  const created = await createRes.json();

  if (!createRes.ok) {
    return Response.json({ ok: false, reason: "vercel-api-error", detail: created }, { status: 500 });
  }

  const finalState = await pollDeployment(created.id, token);
  const isReady = finalState.readyState === "READY";
  const isUpdate = Boolean(siteId && existingProjectName);
  const resolvedSiteId = siteId || nextSiteId();

  if (isReady) {
    const now = new Date().toISOString();
    await saveSite({
      id: resolvedSiteId,
      projectName,
      liveUrl: `https://${created.url}`,
      createdAt: isUpdate ? body.createdAt : now,
      updatedAt: now,
      agency,
      agents,
      properties,
      testimonials: testimonials || [],
      faq: faq || [],
      stats: stats || [],
    });
  }

  await sendNtfy({
    title: isReady ? (isUpdate ? "אתר עודכן" : "אתר חדש עלה לאוויר") : isUpdate ? "עדכון אתר נכשל" : "יצירת אתר נכשלה",
    message: `סוכנות: ${agency.name}\nכתובת: https://${created.url}\nסטטוס: ${finalState.readyState}`,
  });

  return Response.json({
    ok: isReady,
    url: `https://${created.url}`,
    projectName,
    siteId: resolvedSiteId,
    status: finalState.readyState,
    error: finalState.errorMessage,
  });
}
