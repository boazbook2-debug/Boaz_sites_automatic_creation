import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CHART_PATH = path.join(ROOT, "prospects", "campaign-chart.csv");
const SALES_QUALIFIED_PATH = path.join(ROOT, "prospects", "sales-qualified-2026-08.csv");
const INTAKE_DIR = path.join(ROOT, "prospects", "intake");
const QUEUE_PATH = path.join(INTAKE_DIR, "_generate_queue.json");

fs.mkdirSync(INTAKE_DIR, { recursive: true });

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function readCsvFile(filePath) {
  const raw = fs.readFileSync(filePath);
  const clean = raw.toString("utf-8").replace(/^﻿/, ""); // strip BOM
  const rows = parseCsv(clean);
  const header = rows[0];
  return rows.slice(1).filter(r => r.length > 1 && r[0]).map(r => {
    const obj = {};
    header.forEach((h, i) => { obj[h] = r[i] ?? ""; });
    return obj;
  });
}

function readChart() {
  return readCsvFile(CHART_PATH);
}

function chartById() {
  const map = new Map();
  for (const r of readChart()) map.set(String(r["#"]), r);
  return map;
}

function remainingProspects() {
  // Source of truth is the SALES-qualified list (survivors of the commercial gates from the
  // original ~100), ordered by sales tier/rank — not raw demo-production status. Already-built
  // (READY_TO_SEND) prospects are excluded since they don't need intake material anymore.
  const chart = chartById();
  const qualified = readCsvFile(SALES_QUALIFIED_PATH);
  return qualified
    .filter(q => {
      const c = chart.get(String(q["Original Prospect ID"]));
      return !c || c.Status !== "READY_TO_SEND";
    })
    .map(q => {
      const c = chart.get(String(q["Original Prospect ID"])) || {};
      return {
        "#": q["Original Prospect ID"],
        Agency: q.Agency,
        "Owner/Agent": q.Agent,
        Phone: q.Phone || c.Phone || "",
        Facebook: q["Facebook URL"] || c.Facebook || "",
        Score: q["TOTAL /100"],
        Tier: q.Tier,
        SalesRank: q.Rank,
        RecencyEvidence: q["Recency Evidence"],
        Reasoning: q["Short Reason"] || "",
        Status: c.Status || "Pending",
        Notes: c.Notes || "",
      };
    });
}

function readySites() {
  const rows = readChart();
  return rows.filter(r => r.Status === "READY_TO_SEND");
}

function intakeDirFor(id) {
  return path.join(INTAKE_DIR, String(id));
}

function stateFileFor(id) {
  return path.join(intakeDirFor(id), "state.json");
}

function imagesDirFor(id) {
  return path.join(intakeDirFor(id), "images");
}

function emptyState() {
  return {
    schemaVersion: 2,
    notes: "",
    ready: false,
    labels: {},
    yad2Url: null,
    agentPhoto: null,       // filename or null
    logo: null,              // filename or null
    propertyPhotos: [],      // ordered array of filenames
    customUploads: [],       // [{id, filename, description, order}]
    nextCustomId: 1,
  };
}

// Migrates old-shape state (pre schemaVersion:2) forward. Old cards only ever had a flat
// `images/` folder with no role info — those files are ambiguous, so they become legacy
// custom uploads with an empty description rather than being guessed at. Nothing is deleted.
function migrateState(raw, id) {
  if (raw.schemaVersion === 2) return raw;
  const next = emptyState();
  next.notes = raw.notes || "";
  next.ready = !!raw.ready;
  next.labels = raw.labels || {};
  next.yad2Url = raw.yad2Url || null;

  const dir = imagesDirFor(id);
  const legacyFiles = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter(f => !f.startsWith(".")).sort()
    : [];
  let order = 0;
  for (const filename of legacyFiles) {
    next.customUploads.push({
      id: next.nextCustomId++,
      filename,
      description: "",
      order: order++,
    });
  }
  return next;
}

function loadState(id) {
  const f = stateFileFor(id);
  let raw = null;
  if (fs.existsSync(f)) {
    try { raw = JSON.parse(fs.readFileSync(f, "utf-8")); } catch { raw = null; }
  }
  if (!raw) return emptyState();
  const migrated = migrateState(raw, id);
  if (migrated !== raw) saveState(id, migrated);
  return migrated;
}

function saveState(id, state) {
  fs.mkdirSync(intakeDirFor(id), { recursive: true });
  fs.writeFileSync(stateFileFor(id), JSON.stringify(state, null, 2));
}

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > 30 * 1024 * 1024) { reject(new Error("too large")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function safeName(filename) {
  return `${Date.now()}_${filename.replace(/[^a-zA-Z0-9_.\-]/g, "_")}`;
}

function saveUploadedFile(id, filename, dataBase64) {
  const dir = imagesDirFor(id);
  fs.mkdirSync(dir, { recursive: true });
  const stored = safeName(filename);
  fs.writeFileSync(path.join(dir, stored), Buffer.from(dataBase64, "base64"));
  return stored;
}

function deleteFileIfExists(id, filename) {
  if (!filename) return;
  const filePath = path.join(imagesDirFor(id), filename);
  if (filePath.startsWith(imagesDirFor(id)) && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };

function serveStatic(req, res, urlPath) {
  const rel = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.join(__dirname, "public", rel);
  if (!filePath.startsWith(path.join(__dirname, "public"))) { res.writeHead(403); res.end(); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

function likelihoodToPay(score) {
  const n = Number(score) || 0;
  if (n >= 85) return "VERY HIGH";
  if (n >= 70) return "HIGH";
  if (n >= 55) return "MEDIUM";
  return "LOW";
}

function prospectToJson(r, state) {
  const id = r["#"];
  return {
    id,
    agency: r.Agency,
    agent: r["Owner/Agent"],
    phone: r.Phone,
    facebook: r.Facebook,
    score: r.Score,
    likelihood: likelihoodToPay(r.Score),
    tier: r.Tier,
    salesRank: r.SalesRank,
    recencyEvidence: r.RecencyEvidence,
    reasoning: r.Reasoning || r.RecencyEvidence || "",
    status: r.Status,
    priorNotes: r.Notes,
    notes: state.notes,
    ready: !!state.ready,
    yad2Url: state.yad2Url || null,
    agentPhoto: state.agentPhoto || null,
    logo: state.logo || null,
    propertyPhotos: state.propertyPhotos || [],
    customUploads: (state.customUploads || []).slice().sort((a, b) => a.order - b.order),
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const p = url.pathname;

  try {
    if (p === "/api/prospects" && req.method === "GET") {
      const list = remainingProspects().map(r => prospectToJson(r, loadState(r["#"])));
      sendJson(res, 200, { prospects: list });
      return;
    }

    const imgMatch = p.match(/^\/api\/prospects\/([^/]+)\/images\/(.+)$/);
    if (imgMatch && req.method === "GET") {
      const [, id, filename] = imgMatch;
      const filePath = path.join(imagesDirFor(id), filename);
      if (!filePath.startsWith(imagesDirFor(id)) || !fs.existsSync(filePath)) {
        res.writeHead(404); res.end(); return;
      }
      const ext = path.extname(filePath);
      const data = fs.readFileSync(filePath);
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(data);
      return;
    }

    // Single-slot photo fields: agent photo, logo. One file each, replace clears the old one.
    const slotMatch = p.match(/^\/api\/prospects\/([^/]+)\/photo\/(agent|logo)$/);
    if (slotMatch && req.method === "POST") {
      const [, id, slot] = slotMatch;
      const body = await readBody(req);
      const { filename, dataBase64 } = JSON.parse(body.toString("utf-8"));
      const stateKey = slot === "agent" ? "agentPhoto" : "logo";
      const state = loadState(id);
      deleteFileIfExists(id, state[stateKey]);
      const stored = saveUploadedFile(id, filename, dataBase64);
      state[stateKey] = stored;
      saveState(id, state);
      sendJson(res, 200, { ok: true, filename: stored });
      return;
    }
    if (slotMatch && req.method === "DELETE") {
      const [, id, slot] = slotMatch;
      const stateKey = slot === "agent" ? "agentPhoto" : "logo";
      const state = loadState(id);
      deleteFileIfExists(id, state[stateKey]);
      state[stateKey] = null;
      saveState(id, state);
      sendJson(res, 200, { ok: true });
      return;
    }

    // Property photos: multi-file, ordered.
    const propMatch = p.match(/^\/api\/prospects\/([^/]+)\/photos\/property$/);
    if (propMatch && req.method === "POST") {
      const [, id] = propMatch;
      const body = await readBody(req);
      const { filename, dataBase64 } = JSON.parse(body.toString("utf-8"));
      const stored = saveUploadedFile(id, filename, dataBase64);
      const state = loadState(id);
      state.propertyPhotos = [...(state.propertyPhotos || []), stored];
      saveState(id, state);
      sendJson(res, 200, { ok: true, filename: stored });
      return;
    }
    const propDelMatch = p.match(/^\/api\/prospects\/([^/]+)\/photos\/property\/(.+)$/);
    if (propDelMatch && req.method === "DELETE") {
      const [, id, filename] = propDelMatch;
      const state = loadState(id);
      state.propertyPhotos = (state.propertyPhotos || []).filter(f => f !== filename);
      saveState(id, state);
      deleteFileIfExists(id, filename);
      sendJson(res, 200, { ok: true });
      return;
    }
    const propReorderMatch = p.match(/^\/api\/prospects\/([^/]+)\/photos\/property\/reorder$/);
    if (propReorderMatch && req.method === "POST") {
      const [, id] = propReorderMatch;
      const body = await readBody(req);
      const { order } = JSON.parse(body.toString("utf-8"));
      const state = loadState(id);
      const known = new Set(state.propertyPhotos || []);
      const cleanOrder = (order || []).filter(f => known.has(f));
      for (const f of state.propertyPhotos || []) if (!cleanOrder.includes(f)) cleanOrder.push(f);
      state.propertyPhotos = cleanOrder;
      saveState(id, state);
      sendJson(res, 200, { ok: true });
      return;
    }

    // Custom uploads: repeatable file + description blocks.
    const customMatch = p.match(/^\/api\/prospects\/([^/]+)\/custom$/);
    if (customMatch && req.method === "POST") {
      const [, id] = customMatch;
      const body = await readBody(req);
      const { filename, dataBase64 } = JSON.parse(body.toString("utf-8"));
      const stored = saveUploadedFile(id, filename, dataBase64);
      const state = loadState(id);
      const entry = { id: state.nextCustomId++, filename: stored, description: "", order: (state.customUploads || []).length };
      state.customUploads = [...(state.customUploads || []), entry];
      saveState(id, state);
      sendJson(res, 200, { ok: true, entry });
      return;
    }
    const customItemMatch = p.match(/^\/api\/prospects\/([^/]+)\/custom\/(\d+)$/);
    if (customItemMatch && req.method === "PATCH") {
      const [, id, customId] = customItemMatch;
      const body = await readBody(req);
      const patch = JSON.parse(body.toString("utf-8"));
      const state = loadState(id);
      const entry = (state.customUploads || []).find(e => String(e.id) === customId);
      if (entry && typeof patch.description === "string") entry.description = patch.description;
      saveState(id, state);
      sendJson(res, 200, { ok: true });
      return;
    }
    if (customItemMatch && req.method === "DELETE") {
      const [, id, customId] = customItemMatch;
      const state = loadState(id);
      const entry = (state.customUploads || []).find(e => String(e.id) === customId);
      state.customUploads = (state.customUploads || []).filter(e => String(e.id) !== customId);
      saveState(id, state);
      if (entry) deleteFileIfExists(id, entry.filename);
      sendJson(res, 200, { ok: true });
      return;
    }

    const stateMatch = p.match(/^\/api\/prospects\/([^/]+)\/state$/);
    if (stateMatch && req.method === "POST") {
      const [, id] = stateMatch;
      const body = await readBody(req);
      const patch = JSON.parse(body.toString("utf-8"));
      const current = loadState(id);
      const next = { ...current, ...patch };
      saveState(id, next);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (p === "/api/generate" && req.method === "POST") {
      const list = remainingProspects();
      const ready = [];
      for (const r of list) {
        const id = r["#"];
        const state = loadState(id);
        if (state.ready) {
          ready.push({
            id,
            agency: r.Agency,
            agent: r["Owner/Agent"],
            phone: r.Phone,
            facebook: r.Facebook,
            yad2Url: state.yad2Url || null,
            notes: state.notes,
            agentPhoto: state.agentPhoto ? path.join("prospects", "intake", String(id), "images", state.agentPhoto) : null,
            logo: state.logo ? path.join("prospects", "intake", String(id), "images", state.logo) : null,
            propertyPhotos: (state.propertyPhotos || []).map(f => path.join("prospects", "intake", String(id), "images", f)),
            customUploads: (state.customUploads || [])
              .slice()
              .sort((a, b) => a.order - b.order)
              .map(e => ({
                path: path.join("prospects", "intake", String(id), "images", e.filename),
                description: e.description,
              })),
          });
        }
      }
      fs.writeFileSync(QUEUE_PATH, JSON.stringify({ queuedAt: new Date().toISOString(), prospects: ready }, null, 2));
      sendJson(res, 200, { ok: true, queued: ready.length, queueFile: "prospects/intake/_generate_queue.json" });
      return;
    }

    if (p === "/api/generate/status" && req.method === "GET") {
      if (fs.existsSync(QUEUE_PATH)) {
        sendJson(res, 200, JSON.parse(fs.readFileSync(QUEUE_PATH, "utf-8")));
      } else {
        sendJson(res, 200, { prospects: [] });
      }
      return;
    }

    if (p === "/api/results" && req.method === "GET") {
      const sites = readySites().map(r => ({
        id: r["#"],
        agency: r.Agency,
        agent: r["Owner/Agent"],
        phone: r.Phone,
        demoUrl: r["Demo URL"],
        whatsappUrl: r["WhatsApp Send Link"],
        notes: r.Notes,
      }));
      sendJson(res, 200, { sites, count: sites.length, updatedAt: new Date().toISOString() });
      return;
    }

    if (p.startsWith("/api/")) { sendJson(res, 404, { error: "not found" }); return; }

    serveStatic(req, res, p);
  } catch (e) {
    sendJson(res, 500, { error: String(e && e.message || e) });
  }
});

const PORT = process.env.PORT || 4545;
server.listen(PORT, () => {
  console.log(`Intake tool running at http://localhost:${PORT}`);
});
