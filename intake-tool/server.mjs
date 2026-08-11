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

function loadState(id) {
  const f = stateFileFor(id);
  if (fs.existsSync(f)) {
    try { return JSON.parse(fs.readFileSync(f, "utf-8")); } catch { /* fallthrough */ }
  }
  return { notes: "", ready: false, labels: {} };
}

function saveState(id, state) {
  fs.mkdirSync(intakeDirFor(id), { recursive: true });
  fs.writeFileSync(stateFileFor(id), JSON.stringify(state, null, 2));
}

function listImages(id) {
  const dir = path.join(intakeDirFor(id), "images");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => !f.startsWith(".")).sort();
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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const p = url.pathname;

  try {
    if (p === "/api/prospects" && req.method === "GET") {
      const list = remainingProspects().map(r => {
        const id = r["#"];
        const state = loadState(id);
        return {
          id,
          agency: r.Agency,
          agent: r["Owner/Agent"],
          phone: r.Phone,
          facebook: r.Facebook,
          score: r.Score,
          tier: r.Tier,
          salesRank: r.SalesRank,
          recencyEvidence: r.RecencyEvidence,
          status: r.Status,
          priorNotes: r.Notes,
          notes: state.notes,
          ready: !!state.ready,
          images: listImages(id),
          yad2Url: state.yad2Url || null,
        };
      });
      sendJson(res, 200, { prospects: list });
      return;
    }

    const imgMatch = p.match(/^\/api\/prospects\/([^/]+)\/images\/(.+)$/);
    if (imgMatch && req.method === "GET") {
      const [, id, filename] = imgMatch;
      const filePath = path.join(intakeDirFor(id), "images", filename);
      if (!filePath.startsWith(path.join(intakeDirFor(id), "images")) || !fs.existsSync(filePath)) {
        res.writeHead(404); res.end(); return;
      }
      const ext = path.extname(filePath);
      const data = fs.readFileSync(filePath);
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(data);
      return;
    }

    const uploadMatch = p.match(/^\/api\/prospects\/([^/]+)\/images$/);
    if (uploadMatch && req.method === "POST") {
      const [, id] = uploadMatch;
      const body = await readBody(req);
      const { filename, dataBase64 } = JSON.parse(body.toString("utf-8"));
      const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9_.\-]/g, "_")}`;
      const dir = path.join(intakeDirFor(id), "images");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, safeName), Buffer.from(dataBase64, "base64"));
      sendJson(res, 200, { ok: true, filename: safeName });
      return;
    }

    const delMatch = p.match(/^\/api\/prospects\/([^/]+)\/images\/(.+)$/);
    if (delMatch && req.method === "DELETE") {
      const [, id, filename] = delMatch;
      const filePath = path.join(intakeDirFor(id), "images", filename);
      if (filePath.startsWith(path.join(intakeDirFor(id), "images")) && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
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
            notes: state.notes,
            images: listImages(id).map(f => path.join("prospects", "intake", String(id), "images", f)),
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
