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

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function imgSrc(id, filename) {
  return `/api/prospects/${encodeURIComponent(id)}/images/${encodeURIComponent(filename)}`;
}

function render() {
  const main = document.getElementById("main");
  if (!PROSPECTS.length) {
    main.innerHTML = '<div class="empty">אין מועמדים שנותרו לעיבוד 🎉</div>';
    updateStats();
    return;
  }
  main.innerHTML = PROSPECTS.map(cardHtml).join("");
  wireDropzones();
  updateStats();
}

function cardHtml(p) {
  const fbUrl = isRealUrl(p.facebook) ? p.facebook : null;
  const yad2Confirmed = isRealUrl(p.yad2Url) ? p.yad2Url : null;
  const yad2Url = yad2Confirmed || yad2SearchUrl(p.agency);
  const yad2Label = yad2Confirmed ? "✓ עמוד יד2 (מאומת)" : "חפש ביד2 (לא נמצא עמוד ישיר)";

  return `
  <section class="card ${p.ready ? "ready" : ""}" id="card-${p.id}">
    <div class="card-head">
      <div>
        <h2><span class="tier tier-${escapeHtml(p.tier || "C")}">Tier ${escapeHtml(p.tier || "?")}</span> #${escapeHtml(p.salesRank || p.id)} — ${escapeHtml(p.agency)}</h2>
        <div class="meta">${escapeHtml(p.agent || "")} · ${escapeHtml(p.phone || "אין טלפון מאומת")}</div>
        <div class="score-row">${escapeHtml(p.score || "")}/100 — ${escapeHtml(p.likelihood || "")}</div>
        ${p.reasoning ? `<div class="why">למה: ${escapeHtml(p.reasoning)}</div>` : ""}
        ${p.priorNotes ? `<div class="prior-notes">${escapeHtml(p.priorNotes)}</div>` : ""}
      </div>
    </div>

    <div class="links">
      <a href="${fbUrl || "#"}" target="_blank" class="${fbUrl ? "" : "disabled"}">פתח פייסבוק</a>
      <a href="${yad2Url}" target="_blank" class="${yad2Confirmed ? "yad2-confirmed" : "yad2-unconfirmed"}">${yad2Label}</a>
    </div>

    ${slotFieldHtml(p, "agent", "תמונת סוכן / בעלים", p.agentPhoto)}
    ${slotFieldHtml(p, "logo", "לוגו", p.logo)}
    ${propertyPhotosHtml(p)}
    ${customUploadsHtml(p)}

    <small class="label">מידע חופשי מפייסבוק / יד2 / מקורות אחרים — הדבק הכל, בלי לנקות או לסדר</small>
    <textarea id="text-${p.id}" oninput="onNotesInput('${p.id}')">${escapeHtml(p.notes || "")}</textarea>

    <div class="ready-row">
      <label><input type="checkbox" id="ready-${p.id}" ${p.ready ? "checked" : ""} onchange="onReadyChange('${p.id}')" /> ✓ READY FOR GENERATION</label>
    </div>
    <div class="result" id="result-${p.id}" style="display:none"></div>
  </section>`;
}

function slotFieldHtml(p, slot, label, filename) {
  const body = filename
    ? `<div class="slot-filled">
        <img src="${imgSrc(p.id, filename)}" />
        <button type="button" class="btn-tiny" onclick="replaceSlot('${p.id}','${slot}')">החלף</button>
        <button type="button" class="btn-tiny" onclick="removeSlot('${p.id}','${slot}')">הסר</button>
       </div>`
    : `<div class="slot-drop" id="slotdrop-${slot}-${p.id}" data-id="${p.id}" data-slot="${slot}" tabindex="0">גרור תמונה, הדבק, או לחץ לבחירה</div>`;
  return `
    <div class="field-block">
      <div class="field-label">${label}</div>
      ${body}
      <input type="file" id="slotfile-${slot}-${p.id}" accept="image/*" style="display:none" onchange="handleSlotFile('${p.id}','${slot}', this.files[0])" />
    </div>`;
}

function propertyPhotosHtml(p) {
  const thumbs = (p.propertyPhotos || []).map(f => `
    <div class="thumb" draggable="true" data-id="${p.id}" data-file="${f}">
      <img src="${imgSrc(p.id, f)}" />
      <div class="rm" onclick="removePropertyPhoto('${p.id}','${f}')">✕</div>
    </div>`).join("");
  return `
    <div class="field-block">
      <div class="field-label">תמונות נכס</div>
      <div class="drop" id="drop-property-${p.id}" data-id="${p.id}" data-slot="property" tabindex="0">גרור תמונות (אפשר כמה בבת אחת), הדבק, או לחץ לבחירה</div>
      <input type="file" id="file-property-${p.id}" multiple accept="image/*" style="display:none" onchange="handlePropertyFiles('${p.id}', this.files)" />
      <div class="thumbs" id="thumbs-property-${p.id}">${thumbs}</div>
    </div>`;
}

function customUploadsHtml(p) {
  const items = (p.customUploads || []).map(u => `
    <div class="custom-item" data-id="${p.id}" data-custom-id="${u.id}">
      <img src="${imgSrc(p.id, u.filename)}" class="custom-thumb" />
      <input type="text" class="custom-desc" placeholder="תיאור: מה זה ולמה להשתמש בו"
        value="${escapeHtml(u.description || "")}"
        oninput="onCustomDescInput('${p.id}', ${u.id})" id="customdesc-${p.id}-${u.id}" />
      <button type="button" class="btn-tiny" onclick="removeCustomUpload('${p.id}', ${u.id})">Remove</button>
    </div>`).join("");
  return `
    <div class="field-block">
      <div class="field-label">העלאות נוספות</div>
      <div class="custom-list" id="customlist-${p.id}">${items}</div>
      <div class="drop drop-add" id="drop-custom-${p.id}" data-id="${p.id}" data-slot="custom" tabindex="0">+ הוסף העלאה נוספת (גרור, הדבק, או לחץ)</div>
      <input type="file" id="file-custom-${p.id}" accept="image/*,application/pdf" style="display:none" onchange="handleCustomFile('${p.id}', this.files[0])" />
    </div>`;
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

function onCustomDescInput(id, customId) {
  const key = `custom-${id}-${customId}`;
  clearTimeout(debounceTimers[key]);
  debounceTimers[key] = setTimeout(async () => {
    const text = document.getElementById(`customdesc-${id}-${customId}`).value;
    await fetch(`/api/prospects/${encodeURIComponent(id)}/custom/${customId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: text }),
    });
    const p = PROSPECTS.find(x => x.id === id);
    if (p) { const u = (p.customUploads || []).find(x => x.id === customId); if (u) u.description = text; }
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
  if (checked) scrollNextIncomplete();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// --- Agent photo / logo (single-slot fields) ---

function replaceSlot(id, slot) {
  document.getElementById(`slotfile-${slot}-${id}`).click();
}

async function handleSlotFile(id, slot, file) {
  if (!file) return;
  const dataBase64 = await fileToBase64(file);
  const r = await fetch(`/api/prospects/${encodeURIComponent(id)}/photo/${slot}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, dataBase64 }),
  });
  const j = await r.json();
  if (j.ok) {
    const p = PROSPECTS.find(x => x.id === id);
    if (p) { if (slot === "agent") p.agentPhoto = j.filename; else p.logo = j.filename; }
    render();
  }
}

async function removeSlot(id, slot) {
  await fetch(`/api/prospects/${encodeURIComponent(id)}/photo/${slot}`, { method: "DELETE" });
  const p = PROSPECTS.find(x => x.id === id);
  if (p) { if (slot === "agent") p.agentPhoto = null; else p.logo = null; }
  render();
}

// --- Property photos (multi, ordered) ---

async function handlePropertyFiles(id, files) {
  for (const file of files) {
    const dataBase64 = await fileToBase64(file);
    const r = await fetch(`/api/prospects/${encodeURIComponent(id)}/photos/property`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, dataBase64 }),
    });
    const j = await r.json();
    if (j.ok) {
      const p = PROSPECTS.find(x => x.id === id);
      if (p) { p.propertyPhotos = p.propertyPhotos || []; p.propertyPhotos.push(j.filename); }
    }
  }
  render();
}

async function removePropertyPhoto(id, filename) {
  await fetch(`/api/prospects/${encodeURIComponent(id)}/photos/property/${encodeURIComponent(filename)}`, { method: "DELETE" });
  const p = PROSPECTS.find(x => x.id === id);
  if (p) p.propertyPhotos = (p.propertyPhotos || []).filter(f => f !== filename);
  render();
}

async function persistPropertyOrder(id) {
  const p = PROSPECTS.find(x => x.id === id);
  if (!p) return;
  await fetch(`/api/prospects/${encodeURIComponent(id)}/photos/property/reorder`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order: p.propertyPhotos }),
  });
}

// --- Custom uploads (repeatable file + description) ---

function addCustomUpload(id) {
  document.getElementById(`file-custom-${id}`).click();
}

async function handleCustomFile(id, file) {
  if (!file) return;
  const dataBase64 = await fileToBase64(file);
  const r = await fetch(`/api/prospects/${encodeURIComponent(id)}/custom`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, dataBase64 }),
  });
  const j = await r.json();
  if (j.ok) {
    const p = PROSPECTS.find(x => x.id === id);
    if (p) { p.customUploads = p.customUploads || []; p.customUploads.push(j.entry); }
    render();
  }
}

async function removeCustomUpload(id, customId) {
  await fetch(`/api/prospects/${encodeURIComponent(id)}/custom/${customId}`, { method: "DELETE" });
  const p = PROSPECTS.find(x => x.id === id);
  if (p) p.customUploads = (p.customUploads || []).filter(u => u.id !== customId);
  render();
}

function scrollNextIncomplete() {
  const next = PROSPECTS.find(p => !p.ready);
  if (!next) { alert("הכל מוכן ✓"); return; }
  const el = document.getElementById(`card-${next.id}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function generateAll() {
  const r = await fetch("/api/generate", { method: "POST" });
  const j = await r.json();
  alert(`נשלחו ${j.queued} מועמדים לתור היצירה (${j.queueFile}). Claude יעבד אותם כעת.`);
}

document.addEventListener("dragover", (e) => e.preventDefault());
document.addEventListener("drop", (e) => e.preventDefault());

function wireDropzones() {
  // Single-slot drop zones (agent photo, logo)
  document.querySelectorAll(".slot-drop").forEach(zone => {
    const id = zone.dataset.id;
    const slot = zone.dataset.slot;
    zone.addEventListener("click", () => document.getElementById(`slotfile-${slot}-${id}`).click());
    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("drag"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("drag"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault(); zone.classList.remove("drag");
      if (e.dataTransfer.files.length) handleSlotFile(id, slot, e.dataTransfer.files[0]);
    });
    zone.addEventListener("paste", (e) => {
      const items = e.clipboardData.items;
      const file = [...items].find(i => i.type.startsWith("image/"));
      if (file) handleSlotFile(id, slot, file.getAsFile());
    });
  });

  // Property photo multi-drop zone
  document.querySelectorAll("[id^='drop-property-']").forEach(zone => {
    const id = zone.dataset.id;
    zone.addEventListener("click", () => document.getElementById(`file-property-${id}`).click());
    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("drag"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("drag"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault(); zone.classList.remove("drag");
      if (e.dataTransfer.files.length) handlePropertyFiles(id, e.dataTransfer.files);
    });
    zone.addEventListener("paste", (e) => {
      const items = e.clipboardData.items;
      const files = [...items].filter(i => i.type.startsWith("image/")).map(i => i.getAsFile());
      if (files.length) handlePropertyFiles(id, files);
    });
  });

  // Custom upload "add" drop zone
  document.querySelectorAll("[id^='drop-custom-']").forEach(zone => {
    const id = zone.dataset.id;
    zone.addEventListener("click", () => addCustomUpload(id));
    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("drag"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("drag"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault(); zone.classList.remove("drag");
      if (e.dataTransfer.files.length) handleCustomFile(id, e.dataTransfer.files[0]);
    });
    zone.addEventListener("paste", (e) => {
      const items = e.clipboardData.items;
      const file = [...items].find(i => i.type.startsWith("image/"));
      if (file) handleCustomFile(id, file.getAsFile());
    });
  });

  // Property photo reorder via drag
  document.querySelectorAll(".thumbs").forEach(gallery => {
    let dragFile = null;
    gallery.querySelectorAll(".thumb").forEach(thumb => {
      thumb.addEventListener("dragstart", () => { dragFile = thumb.dataset.file; });
      thumb.addEventListener("dragover", (e) => e.preventDefault());
      thumb.addEventListener("drop", (e) => {
        e.preventDefault();
        if (!dragFile || dragFile === thumb.dataset.file) return;
        const id = thumb.dataset.id;
        const p = PROSPECTS.find(x => x.id === id);
        if (!p) return;
        const arr = p.propertyPhotos;
        const from = arr.indexOf(dragFile);
        const to = arr.indexOf(thumb.dataset.file);
        arr.splice(from, 1);
        arr.splice(to, 0, dragFile);
        persistPropertyOrder(id);
        render();
      });
    });
  });
}

load();
