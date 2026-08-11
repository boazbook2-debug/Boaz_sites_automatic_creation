let PROSPECTS = [];
const debounceTimers = {};

async function load() {
  const r = await fetch("/api/prospects");
  const data = await r.json();
  PROSPECTS = data.prospects;
  render();
}

function yad2SearchUrl(agency) {
  return "https://www.yad2.co.il/realestate/agencies?word=" + encodeURIComponent(agency || "");
}

function isRealUrl(s) {
  return typeof s === "string" && /^https?:\/\//.test(s.trim());
}

function render() {
  const main = document.getElementById("main");
  if (!PROSPECTS.length) {
    main.innerHTML = '<div class="empty">אין מועמדים שנותרו לעיבוד 🎉</div>';
    updateStats();
    return;
  }
  main.innerHTML = PROSPECTS.map(cardHtml).join("");
  updateStats();
}

function cardHtml(p) {
  const fbUrl = isRealUrl(p.facebook) ? p.facebook : null;
  const yad2Confirmed = isRealUrl(p.yad2Url) ? p.yad2Url : null;
  const yad2Url = yad2Confirmed || yad2SearchUrl(p.agency);
  const yad2Label = yad2Confirmed ? "✓ עמוד יד2 (מאומת)" : "חפש ביד2 (לא נמצא עמוד ישיר)";
  const thumbs = p.images.map(f => `
    <div class="thumb" data-id="${p.id}" data-file="${f}">
      <img src="/api/prospects/${encodeURIComponent(p.id)}/images/${encodeURIComponent(f)}" />
      <div class="rm" onclick="removeImage('${p.id}','${f}')">✕</div>
    </div>`).join("");
  return `
  <section class="card ${p.ready ? "ready" : ""}" id="card-${p.id}">
    <div class="card-head">
      <div>
        <h2><span class="tier tier-${escapeHtml(p.tier || "C")}">Tier ${escapeHtml(p.tier || "?")}</span> #${escapeHtml(p.salesRank || p.id)} — ${escapeHtml(p.agency)}</h2>
        <div class="meta">${escapeHtml(p.agent || "")} · ${escapeHtml(p.phone || "אין טלפון מאומת")} · ציון מכירתי ${escapeHtml(p.score || "")}/100</div>
        <div class="why">למה זה ליד טוב: ${escapeHtml(p.recencyEvidence || "—")}</div>
        ${p.priorNotes ? `<div class="meta">הערת ייצור קודמת: ${escapeHtml(p.priorNotes)}</div>` : ""}
      </div>
    </div>
    <div class="links">
      <a href="${fbUrl || "#"}" target="_blank" class="${fbUrl ? "" : "disabled"}">פתח פייסבוק</a>
      <a href="${yad2Url}" target="_blank" class="${yad2Confirmed ? "yad2-confirmed" : "yad2-unconfirmed"}">${yad2Label}</a>
    </div>
    <div class="drop" id="drop-${p.id}" tabindex="0">גרור לכאן תמונות (או הדבק/בחר קובץ)</div>
    <input type="file" id="file-${p.id}" multiple accept="image/*" style="display:none" onchange="handleFiles('${p.id}', this.files)" />
    <div class="thumbs" id="thumbs-${p.id}">${thumbs}</div>
    <small class="label">הדבק כאן מידע מפייסבוק / יד2 (טקסט גולמי, לא צריך לנקות)</small>
    <textarea id="text-${p.id}" oninput="onNotesInput('${p.id}')">${escapeHtml(p.notes || "")}</textarea>
    <div class="ready-row">
      <label><input type="checkbox" id="ready-${p.id}" ${p.ready ? "checked" : ""} onchange="onReadyChange('${p.id}')" /> ✓ READY FOR GENERATION</label>
    </div>
    <div class="result" id="result-${p.id}" style="display:none"></div>
  </section>`;
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function updateStats() {
  const total = PROSPECTS.length;
  const readyCount = PROSPECTS.filter(p => p.ready).length;
  document.getElementById("stat-total").textContent = `${total} נותרו`;
  document.getElementById("stat-ready").textContent = `${readyCount} מוכן`;
  document.getElementById("bar").style.width = total ? `${(readyCount / total) * 100}%` : "0%";
}

function onNotesInput(id) {
  clearTimeout(debounceTimers[id]);
  debounceTimers[id] = setTimeout(async () => {
    const text = document.getElementById(`text-${id}`).value;
    await fetch(`/api/prospects/${encodeURIComponent(id)}/state`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: text }),
    });
    const p = PROSPECTS.find(x => x.id === id); if (p) p.notes = text;
  }, 600);
}

async function onReadyChange(id) {
  const checked = document.getElementById(`ready-${id}`).checked;
  await fetch(`/api/prospects/${encodeURIComponent(id)}/state`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ready: checked }),
  });
  const p = PROSPECTS.find(x => x.id === id); if (p) p.ready = checked;
  document.getElementById(`card-${id}`).classList.toggle("ready", checked);
  updateStats();
}

async function handleFiles(id, files) {
  for (const file of files) {
    const dataBase64 = await fileToBase64(file);
    const r = await fetch(`/api/prospects/${encodeURIComponent(id)}/images`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, dataBase64 }),
    });
    const j = await r.json();
    if (j.ok) {
      const thumbs = document.getElementById(`thumbs-${id}`);
      thumbs.insertAdjacentHTML("beforeend", `
        <div class="thumb"><img src="/api/prospects/${encodeURIComponent(id)}/images/${encodeURIComponent(j.filename)}" />
        <div class="rm" onclick="removeImage('${id}','${j.filename}')">✕</div></div>`);
      const p = PROSPECTS.find(x => x.id === id); if (p) p.images.push(j.filename);
    }
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function removeImage(id, filename) {
  await fetch(`/api/prospects/${encodeURIComponent(id)}/images/${encodeURIComponent(filename)}`, { method: "DELETE" });
  const thumbs = document.getElementById(`thumbs-${id}`);
  const el = [...thumbs.children].find(c => c.querySelector("img").src.includes(encodeURIComponent(filename)));
  if (el) el.remove();
  const p = PROSPECTS.find(x => x.id === id); if (p) p.images = p.images.filter(f => f !== filename);
}

function scrollNextIncomplete() {
  const next = PROSPECTS.find(p => !p.ready);
  if (!next) { alert("הכל מוכן ✓"); return; }
  document.getElementById(`card-${next.id}`).scrollIntoView({ behavior: "smooth", block: "center" });
}

async function generateAll() {
  const r = await fetch("/api/generate", { method: "POST" });
  const j = await r.json();
  alert(`נשלחו ${j.queued} מועמדים לתור היצירה (${j.queueFile}). Claude יעבד אותם כעת.`);
}

document.addEventListener("dragover", (e) => e.preventDefault());
document.addEventListener("drop", (e) => e.preventDefault());

function wireDropzones() {
  document.querySelectorAll(".drop").forEach(zone => {
    const id = zone.id.replace("drop-", "");
    zone.addEventListener("click", () => document.getElementById(`file-${id}`).click());
    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("drag"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("drag"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault(); zone.classList.remove("drag");
      if (e.dataTransfer.files.length) handleFiles(id, e.dataTransfer.files);
    });
    zone.addEventListener("paste", (e) => {
      const items = e.clipboardData.items;
      const files = [...items].filter(i => i.type.startsWith("image/")).map(i => i.getAsFile());
      if (files.length) handleFiles(id, files);
    });
  });
}

const origRender = render;
render = function () { origRender(); wireDropzones(); };

load();
