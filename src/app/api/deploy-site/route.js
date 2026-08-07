import {
  generateAgencyFile,
  generateAgentsFile,
  generatePropertiesFile,
  generateTestimonialsFile,
  generateFaqFile,
  generateStatsFile,
  generateShowcaseFile,
  generateWhyUsFile,
} from "@/lib/generateDataFiles";
import { collectTemplateFiles } from "@/lib/collectTemplateFiles";
import { sendNtfy } from "@/lib/ntfy";
import { saveSite } from "@/lib/sitesStore";
import { getSiteImage } from "@/lib/siteImages";

const nextSiteId = () => `site-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// Every filename the generated data files reference — anything not present
// in `newImages` (this request's freshly-uploaded bytes) must already exist
// in this site's Blob-backed upload store from a previous deploy.
function collectReferencedFilenames({ agency, agents, properties, showcase }) {
  const names = new Set();
  if (agency?.logoFilename) names.add(agency.logoFilename);
  for (const f of agency?.heroImageFilenames || []) names.add(f);
  for (const a of agents || []) {
    if (a.photoFilename) names.add(a.photoFilename);
  }
  for (const p of properties || []) {
    for (const f of p.imageFilenames || []) names.add(f);
  }
  if (showcase?.imageFilename) names.add(showcase.imageFilename);
  if (showcase?.agentImageFilename) names.add(showcase.agentImageFilename);
  return [...names];
}

// Resolves every referenced image to actual bytes from this site's Blob
// upload store — the intake form uploads images there directly as soon as
// they're picked (bypassing this route's own request body, which has a
// ~4.5MB cap real photos blow past easily). Missing images are skipped
// rather than failing the whole deploy.
async function resolveImageFiles({ siteId, filenames }) {
  const files = [];
  await Promise.all(
    filenames.map(async (filename) => {
      const base64 = await getSiteImage(siteId, filename);
      if (!base64) return;
      files.push({ file: `public/uploads/${filename}`, data: base64, encoding: "base64" });
    })
  );
  return files;
}

function slugify(value) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// The admin can type an explicit English slug (so the Vercel project reads
// as "nadlan-com" instead of a random string) — used as-is, no suffix,
// since it's a deliberate choice they'll notice if it collides. Falling
// back to the agency name only happens when they skip that field, and
// Hebrew names (the common case) transliterate to nothing useful for a URL,
// so that path keeps the random suffix to guarantee a valid, unique slug.
function resolveProjectName({ projectSlug, agencyName }) {
  const explicit = slugify(projectSlug);
  if (explicit) return explicit;
  const auto = slugify(agencyName) || "agency-site";
  return `${auto}-${Math.random().toString(36).slice(2, 7)}`;
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
  const {
    agency,
    agents,
    properties,
    testimonials,
    faq,
    stats,
    showcase,
    whyUs,
    siteId,
    projectName: existingProjectName,
    projectSlug,
  } = body;
  const resolvedSiteId = siteId || nextSiteId();

  const dataFiles = [
    { file: "src/data/agency.js", data: generateAgencyFile(agency) },
    { file: "src/data/agents.js", data: generateAgentsFile(agents) },
    { file: "src/data/properties.js", data: generatePropertiesFile(properties) },
    { file: "src/data/testimonials.js", data: generateTestimonialsFile(testimonials || []) },
    { file: "src/data/faq.js", data: generateFaqFile(faq || []) },
    { file: "src/data/stats.js", data: generateStatsFile(stats || []) },
    { file: "src/data/showcase.js", data: generateShowcaseFile(showcase || {}) },
    { file: "src/data/whyUs.js", data: generateWhyUsFile(whyUs || {}) },
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

  const projectName = existingProjectName || resolveProjectName({ projectSlug, agencyName: agency.name });
  const referencedFilenames = collectReferencedFilenames({ agency, agents, properties, showcase });
  const imageFiles = await resolveImageFiles({ siteId: resolvedSiteId, filenames: referencedFilenames });
  const files = [...templateFiles, ...dataFiles, ...imageFiles];

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

  // `created.url` is the raw per-deployment hostname (e.g. agency-site-uwzmc-2inuk9z6t-....vercel.app)
  // — Vercel gates that specific URL behind a login wall by default, even
  // though the project's own public alias (<projectName>.vercel.app, which
  // every "production" target deployment gets automatically) is fully open.
  // Sharing the raw URL is exactly what broke access for real client links,
  // so every reference to the live site must use the clean alias instead.
  const liveUrl = `https://${projectName}.vercel.app`;

  if (isReady) {
    const now = new Date().toISOString();
    await saveSite({
      id: resolvedSiteId,
      projectName,
      liveUrl,
      createdAt: isUpdate ? body.createdAt : now,
      updatedAt: now,
      agency,
      agents,
      properties,
      testimonials: testimonials || [],
      faq: faq || [],
      stats: stats || [],
      showcase: showcase || {},
      whyUs: whyUs || {},
    });
  }

  await sendNtfy({
    title: isReady ? (isUpdate ? "אתר עודכן" : "אתר חדש עלה לאוויר") : isUpdate ? "עדכון אתר נכשל" : "יצירת אתר נכשלה",
    message: `סוכנות: ${agency.name}\nכתובת: ${liveUrl}\nסטטוס: ${finalState.readyState}`,
  });

  return Response.json({
    ok: isReady,
    url: liveUrl,
    projectName,
    siteId: resolvedSiteId,
    status: finalState.readyState,
    error: finalState.errorMessage,
  });
}
