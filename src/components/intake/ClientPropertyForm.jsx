"use client";

import { useState } from "react";
import { TextField, TextAreaField, SelectField, SectionCard } from "./FormField";
import { CloseIcon } from "@/components/Icons";
import { validateProperty } from "@/lib/intakeValidation";
import { generatePropertiesFile } from "@/lib/generateDataFiles";

const blankProperty = {
  title: "",
  location: "",
  price: "",
  rooms: "",
  type: "",
  status: "sale",
  features: [""],
};

let imgIdCounter = 0;
const nextImgId = () => `img-${++imgIdCounter}`;

function ImageTile({ src, removed, onToggleRemove }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={`h-full w-full object-cover transition ${removed ? "grayscale opacity-40" : ""}`}
      />
      <button
        type="button"
        onClick={onToggleRemove}
        className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow ${
          removed ? "bg-white text-[var(--color-main)]" : "bg-red-600 text-white"
        }`}
      >
        {removed ? "בטל" : "מחיקה"}
        <CloseIcon className="h-3 w-3" />
      </button>
    </div>
  );
}

export default function ClientPropertyForm({ title, initialProperty, client, onSaved, onBack }) {
  const [property, setProperty] = useState({ ...blankProperty, ...initialProperty });
  const [existingImages, setExistingImages] = useState(
    (initialProperty?.images ?? []).map((src) => ({ id: nextImgId(), src, removed: false }))
  );
  const [newImages, setNewImages] = useState([]);
  const [errors, setErrors] = useState(null);
  const [output, setOutput] = useState(null);

  const handleAddFiles = (fileList) => {
    const added = Array.from(fileList).map((file) => ({
      id: nextImgId(),
      file,
      previewUrl: URL.createObjectURL(file),
      removed: false,
    }));
    setNewImages([...added, ...newImages]);
  };

  const toggleNewImage = (id) =>
    setNewImages(newImages.map((img) => (img.id === id ? { ...img, removed: !img.removed } : img)));

  const toggleExistingImage = (id) =>
    setExistingImages(existingImages.map((img) => (img.id === id ? { ...img, removed: !img.removed } : img)));

  const handleSave = () => {
    const keptExisting = existingImages.filter((img) => !img.removed).map((img) => img.src);
    const keptNew = newImages.filter((img) => !img.removed).map((img) => img.file.name);
    const imageFilenames = [...keptNew, ...keptExisting];

    const candidate = { ...property, imageFilenames };
    const nextErrors = validateProperty(candidate);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const generatedId = property.id ?? property.title.trim().toLowerCase().replace(/\s+/g, "-");
    const finalProperty = { ...candidate, id: generatedId, assignedAgentId: property.assignedAgentId ?? "" };
    setOutput(generatePropertiesFile([finalProperty]));

    fetch("/api/notify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "עדכון נכס מלקוח",
        message: `לקוח: ${client?.email ?? "לא ידוע"}\nנכס: ${finalProperty.title}\nמחיר: ${finalProperty.price}\nמיקום: ${finalProperty.location}`,
      }),
    }).catch(() => {});

    onSaved(finalProperty);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-14 lg:px-10">
      <button type="button" onClick={onBack} className="text-sm font-semibold text-[var(--color-main)]/60">
        ← חזרה
      </button>

      <SectionCard title={title}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="כותרת"
            required
            value={property.title}
            onChange={(v) => setProperty({ ...property, title: v })}
            error={errors?.title}
          />
          <TextField
            label="מיקום"
            required
            value={property.location}
            onChange={(v) => setProperty({ ...property, location: v })}
            error={errors?.location}
          />
          <TextField
            label="מחיר"
            type="number"
            required
            value={property.price}
            onChange={(v) => setProperty({ ...property, price: v })}
            error={errors?.price}
          />
          <TextField
            label="חדרים"
            type="number"
            required
            value={property.rooms}
            onChange={(v) => setProperty({ ...property, rooms: v })}
            error={errors?.rooms}
          />
          <TextField
            label="סוג נכס"
            required
            value={property.type}
            onChange={(v) => setProperty({ ...property, type: v })}
            error={errors?.type}
          />
          <SelectField
            label="סטטוס"
            required
            value={property.status}
            onChange={(v) => setProperty({ ...property, status: v })}
            options={[
              { value: "sale", label: "למכירה" },
              { value: "rent", label: "להשכרה" },
            ]}
            error={errors?.status}
          />
        </div>
        <TextAreaField
          label="מאפייני הנכס (שורה לכל מאפיין, אופציונלי)"
          value={property.features.join("\n")}
          onChange={(v) => setProperty({ ...property, features: v.split("\n") })}
        />

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-[var(--color-main)]/80">
            תמונות הנכס <span className="text-red-500">*</span>
          </span>

          {(newImages.length > 0 || existingImages.length > 0) && (
            <div className="mb-4 grid grid-cols-3 gap-3">
              {newImages.map((img) => (
                <ImageTile
                  key={img.id}
                  src={img.previewUrl}
                  removed={img.removed}
                  onToggleRemove={() => toggleNewImage(img.id)}
                />
              ))}
              {existingImages.map((img) => (
                <ImageTile
                  key={img.id}
                  src={img.src}
                  removed={img.removed}
                  onToggleRemove={() => toggleExistingImage(img.id)}
                />
              ))}
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              handleAddFiles(e.target.files);
              e.target.value = "";
            }}
            className="w-full rounded-xl border border-dashed border-[var(--color-main)]/25 bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none file:ml-3 file:rounded-full file:border-0 file:bg-[var(--color-accent2)] file:px-4 file:py-1.5 file:text-xs file:font-bold file:text-white"
          />
          {errors?.imageFilenames && <p className="mt-1 text-xs font-medium text-red-500">{errors.imageFilenames}</p>}
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-[var(--color-accent2)] px-10 py-3.5 text-base font-bold text-white shadow-[0_15px_35px_rgba(176,141,87,0.45)] transition hover:scale-105"
          >
            שמירה
          </button>
        </div>
      </SectionCard>

      {output && (
        <div className="rounded-2xl bg-[#141414] p-5 text-xs text-white/70">
          <p className="mb-2 font-bold text-[var(--color-accent2)]">
            העתק/י את הפרטים האלה ושלח/י לבועז בוואטסאפ כדי שיעדכן את האתר החי (אין חיבור אוטומטי למסד נתונים בתבנית זו):
          </p>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap" dir="ltr">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
