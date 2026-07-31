"use client";

import { useState } from "react";
import { TextField, TextAreaField, SelectField, ColorField, FileField, SectionCard } from "./FormField";
import iconRegistry from "@/lib/iconRegistry";
import {
  generateAgencyFile,
  generateAgentsFile,
  generatePropertiesFile,
  generateTestimonialsFile,
  generateFaqFile,
  generateStatsFile,
} from "@/lib/generateDataFiles";
import {
  validateAgency,
  validateColors,
  validateBrandStory,
  validateAgent,
  validateProperty,
  validateFaqItem,
  isEmpty,
} from "@/lib/intakeValidation";

const iconImportNames = {
  house: "HouseIcon",
  "trending-up": "TrendingUpIcon",
  award: "AwardIcon",
  "map-pin": "MapPinIcon",
  star: "StarIcon",
  phone: "PhoneIcon",
  whatsapp: "WhatsAppIcon",
  mail: "MailIcon",
  quote: "QuoteIcon",
};

let idCounter = 0;
const nextId = (prefix) => `${prefix}-${++idCounter}`;

function CodeOutput({ filename, content }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl bg-[#141414] p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-[var(--color-accent2)]">{filename}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
        >
          {copied ? "הועתק!" : "העתק"}
        </button>
      </div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-white/80" dir="ltr">
        {content}
      </pre>
    </div>
  );
}

export default function IntakeForm({ onBack }) {
  const [agency, setAgency] = useState({
    name: "",
    tagline: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    facebookUrl: "",
    instagramUrl: "",
    logoFilename: "",
    heroImageFilenames: [],
  });
  const [colors, setColors] = useState({
    background: "#FFFFFF",
    surface: "#F4F4F5",
    main: "#141414",
    accent1: "#1B2A41",
    accent2: "#B08D57",
  });
  const [brandStory, setBrandStory] = useState({
    yearsInBusiness: "",
    whatMakesSpecial: "",
    areas: "",
    approach: "",
  });
  const [generated, setGenerated] = useState({ aboutText: "", ownerQuote: "" });
  const [generating, setGenerating] = useState(false);

  const [agents, setAgents] = useState([
    { id: nextId("agent"), name: "", role: "", photoFilename: "", phone: "", whatsapp: "", email: "" },
  ]);
  const [properties, setProperties] = useState([
    {
      id: nextId("property"),
      title: "",
      location: "",
      price: "",
      rooms: "",
      type: "",
      status: "sale",
      features: [""],
      imageFilenames: [],
      assignedAgentId: "",
    },
  ]);
  const [testimonials, setTestimonials] = useState([{ id: nextId("t"), name: "", context: "", text: "" }]);
  const [faq, setFaq] = useState([{ question: "", answer: "" }]);
  const [stats, setStats] = useState([]);

  const [output, setOutput] = useState(null);
  const [errors, setErrors] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState(null);

  const handleGenerateAbout = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-about", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ agencyName: agency.name, ...brandStory }),
      });
      const data = await res.json();
      setGenerated(data);
    } finally {
      setGenerating(false);
    }
  };

  const runValidation = () => {
    const nextErrors = {
      agency: validateAgency(agency),
      colors: validateColors(colors),
      brandStory: validateBrandStory(brandStory),
      agents: agents.map(validateAgent),
      properties: properties.map(validateProperty),
      faq: faq.map(validateFaqItem),
    };
    setErrors(nextErrors);

    return (
      isEmpty(nextErrors.agency) &&
      isEmpty(nextErrors.colors) &&
      isEmpty(nextErrors.brandStory) &&
      nextErrors.agents.every(isEmpty) &&
      nextErrors.properties.every(isEmpty) &&
      nextErrors.faq.every(isEmpty)
    );
  };

  const handleBuild = () => {
    const valid = runValidation();
    if (!valid) {
      setOutput(null);
      return;
    }
    setOutput({
      agency: generateAgencyFile({ ...agency, ...generated }),
      agents: generateAgentsFile(agents),
      properties: generatePropertiesFile(properties),
      testimonials: generateTestimonialsFile(testimonials),
      faq: generateFaqFile(faq),
      stats: generateStatsFile(stats.map((s) => ({ ...s, iconImport: iconImportNames[s.iconId] }))),
    });

    fetch("/api/notify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "אתר חדש נוצר",
        message: `סוכנות: ${agency.name}\nאימייל: ${agency.email}`,
      }),
    }).catch(() => {});
  };

  const handleDeploy = async () => {
    const valid = runValidation();
    if (!valid) return;

    setDeploying(true);
    setDeployResult(null);
    try {
      const res = await fetch("/api/deploy-site", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          agency: { ...agency, ...generated },
          agents,
          properties,
          testimonials,
          faq,
          stats: stats.map((s) => ({ ...s, iconImport: iconImportNames[s.iconId] })),
        }),
      });
      const data = await res.json();
      setDeployResult(data);
    } catch {
      setDeployResult({ ok: false, reason: "network-error" });
    } finally {
      setDeploying(false);
    }
  };

  const hasErrors =
    errors &&
    (!isEmpty(errors.agency) ||
      !isEmpty(errors.colors) ||
      !isEmpty(errors.brandStory) ||
      !errors.agents.every(isEmpty) ||
      !errors.properties.every(isEmpty) ||
      !errors.faq.every(isEmpty));

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-14 lg:px-10">
      <div>
        {onBack && (
          <button type="button" onClick={onBack} className="mb-4 text-sm font-semibold text-[var(--color-main)]/60">
            ← חזרה
          </button>
        )}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">שאלון הקמת אתר ללקוח חדש</h1>
        <p className="mt-2 text-lg text-[var(--color-main)]/60">
          מלאו את הפרטים הבאים כדי לייצר את קובצי הנתונים המוכנים להטמעה באתר. שדות עם * הם שדות חובה.
        </p>
      </div>

      {hasErrors && (
        <div className="rounded-2xl border-2 border-red-400 bg-red-50 px-6 py-4 text-red-700">
          יש להשלים את כל שדות החובה (מסומנים ב-*) לפני יצירת הקבצים.
        </div>
      )}

      <SectionCard title="פרטי הסוכנות">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="שם הסוכנות"
            required
            value={agency.name}
            onChange={(v) => setAgency({ ...agency, name: v })}
            error={errors?.agency.name}
          />
          <TextField
            label="סלוגן / משפט מיתוג"
            required
            value={agency.tagline}
            onChange={(v) => setAgency({ ...agency, tagline: v })}
            error={errors?.agency.tagline}
          />
          <TextField
            label="טלפון"
            required
            value={agency.phone}
            onChange={(v) => setAgency({ ...agency, phone: v })}
            error={errors?.agency.phone}
          />
          <TextField
            label="וואטסאפ (כולל קידומת מדינה, לדוגמה 972501234567)"
            required
            value={agency.whatsapp}
            onChange={(v) => setAgency({ ...agency, whatsapp: v })}
            error={errors?.agency.whatsapp}
          />
          <TextField
            label="אימייל"
            required
            value={agency.email}
            onChange={(v) => setAgency({ ...agency, email: v })}
            error={errors?.agency.email}
          />
          <TextField
            label="כתובת"
            required
            value={agency.address}
            onChange={(v) => setAgency({ ...agency, address: v })}
            error={errors?.agency.address}
          />
          <TextField
            label="קישור לפייסבוק (אופציונלי)"
            value={agency.facebookUrl}
            onChange={(v) => setAgency({ ...agency, facebookUrl: v })}
          />
          <TextField
            label="קישור לאינסטגרם (אופציונלי)"
            value={agency.instagramUrl}
            onChange={(v) => setAgency({ ...agency, instagramUrl: v })}
          />
        </div>
        <FileField
          label="לוגו (אופציונלי)"
          onChange={(file) => setAgency({ ...agency, logoFilename: file?.name ?? "" })}
        />
        <FileField
          label="תמונות לסליידשואו בעמוד הבית (ניתן לבחור כמה)"
          required
          multiple
          onChange={(files) => setAgency({ ...agency, heroImageFilenames: files.map((f) => f.name) })}
          error={errors?.agency.heroImageFilenames}
        />
      </SectionCard>

      <SectionCard title="צבעי האתר" description="קוד צבע (hex) לכל שדה">
        <div className="grid gap-5 sm:grid-cols-2">
          <ColorField
            label="רקע (background)"
            required
            value={colors.background}
            onChange={(v) => setColors({ ...colors, background: v })}
            error={errors?.colors.background}
          />
          <ColorField
            label="משטח משני (surface)"
            required
            value={colors.surface}
            onChange={(v) => setColors({ ...colors, surface: v })}
            error={errors?.colors.surface}
          />
          <ColorField
            label="ראשי (main)"
            required
            value={colors.main}
            onChange={(v) => setColors({ ...colors, main: v })}
            error={errors?.colors.main}
          />
          <ColorField
            label="הדגשה 1 (accent1)"
            required
            value={colors.accent1}
            onChange={(v) => setColors({ ...colors, accent1: v })}
            error={errors?.colors.accent1}
          />
          <ColorField
            label="הדגשה 2 (accent2)"
            required
            value={colors.accent2}
            onChange={(v) => setColors({ ...colors, accent2: v })}
            error={errors?.colors.accent2}
          />
        </div>
      </SectionCard>

      <SectionCard title="סיפור המותג" description="התשובות ישמשו ליצירת טקסט 'אודות' וציטוט אישי מבעל העסק">
        <TextAreaField
          label="כמה שנים אתם בתחום?"
          required
          value={brandStory.yearsInBusiness}
          onChange={(v) => setBrandStory({ ...brandStory, yearsInBusiness: v })}
          error={errors?.brandStory.yearsInBusiness}
        />
        <TextAreaField
          label="מה מייחד אתכם?"
          required
          value={brandStory.whatMakesSpecial}
          onChange={(v) => setBrandStory({ ...brandStory, whatMakesSpecial: v })}
          error={errors?.brandStory.whatMakesSpecial}
        />
        <TextAreaField
          label="באילו אזורים אתם פועלים?"
          required
          value={brandStory.areas}
          onChange={(v) => setBrandStory({ ...brandStory, areas: v })}
          error={errors?.brandStory.areas}
        />
        <TextAreaField
          label="מהי הגישה והערכים שלכם?"
          required
          value={brandStory.approach}
          onChange={(v) => setBrandStory({ ...brandStory, approach: v })}
          error={errors?.brandStory.approach}
        />
        <button
          type="button"
          onClick={handleGenerateAbout}
          disabled={generating}
          className="rounded-full bg-[var(--color-main)] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {generating ? "מייצר..." : "צור טקסט אודות + ציטוט אישי"}
        </button>
        {generated.aboutText && (
          <div className="space-y-3 rounded-xl bg-[var(--color-background)] p-4 text-sm">
            <p>
              <strong>אודות:</strong> {generated.aboutText}
            </p>
            <p>
              <strong>ציטוט אישי:</strong> {generated.ownerQuote}
            </p>
          </div>
        )}
      </SectionCard>

      <SectionCard title="הסוכנים">
        {agents.map((agent, i) => (
          <div key={agent.id} className="space-y-4 rounded-xl border border-[var(--color-main)]/10 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="שם"
                required
                value={agent.name}
                onChange={(v) => setAgents(agents.map((a) => (a.id === agent.id ? { ...a, name: v } : a)))}
                error={errors?.agents[i]?.name}
              />
              <TextField
                label="תפקיד"
                required
                value={agent.role}
                onChange={(v) => setAgents(agents.map((a) => (a.id === agent.id ? { ...a, role: v } : a)))}
                error={errors?.agents[i]?.role}
              />
              <TextField
                label="טלפון"
                required
                value={agent.phone}
                onChange={(v) =>
                  setAgents(agents.map((a) => (a.id === agent.id ? { ...a, phone: v, whatsapp: a.whatsapp || v } : a)))
                }
                error={errors?.agents[i]?.phone}
              />
              <TextField
                label="אימייל"
                required
                value={agent.email}
                onChange={(v) => setAgents(agents.map((a) => (a.id === agent.id ? { ...a, email: v } : a)))}
                error={errors?.agents[i]?.email}
              />
            </div>
            <FileField
              label={`תמונת פרופיל${i === 0 ? " (הראשון ברשימה מוצג כבעל העסק בעמוד הבית)" : ""}`}
              required
              onChange={(file) =>
                setAgents(agents.map((a) => (a.id === agent.id ? { ...a, photoFilename: file?.name ?? "" } : a)))
              }
              error={errors?.agents[i]?.photoFilename}
            />
            {agents.length > 1 && (
              <button
                type="button"
                onClick={() => setAgents(agents.filter((a) => a.id !== agent.id))}
                className="text-sm font-medium text-red-600"
              >
                הסר סוכן
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setAgents([
              ...agents,
              { id: nextId("agent"), name: "", role: "", photoFilename: "", phone: "", whatsapp: "", email: "" },
            ])
          }
          className="rounded-full border-2 border-[var(--color-main)]/20 px-6 py-2.5 text-sm font-bold transition hover:bg-[var(--color-background)]"
        >
          + הוסף סוכן
        </button>
      </SectionCard>

      <SectionCard title="נכסים">
        {properties.map((property, i) => (
          <div key={property.id} className="space-y-4 rounded-xl border border-[var(--color-main)]/10 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="כותרת"
                required
                value={property.title}
                onChange={(v) => setProperties(properties.map((p) => (p.id === property.id ? { ...p, title: v } : p)))}
                error={errors?.properties[i]?.title}
              />
              <TextField
                label="מיקום"
                required
                value={property.location}
                onChange={(v) => setProperties(properties.map((p) => (p.id === property.id ? { ...p, location: v } : p)))}
                error={errors?.properties[i]?.location}
              />
              <TextField
                label="מחיר"
                type="number"
                required
                value={property.price}
                onChange={(v) => setProperties(properties.map((p) => (p.id === property.id ? { ...p, price: v } : p)))}
                error={errors?.properties[i]?.price}
              />
              <TextField
                label="חדרים"
                type="number"
                required
                value={property.rooms}
                onChange={(v) => setProperties(properties.map((p) => (p.id === property.id ? { ...p, rooms: v } : p)))}
                error={errors?.properties[i]?.rooms}
              />
              <TextField
                label="סוג נכס"
                required
                value={property.type}
                onChange={(v) => setProperties(properties.map((p) => (p.id === property.id ? { ...p, type: v } : p)))}
                error={errors?.properties[i]?.type}
              />
              <SelectField
                label="סטטוס"
                required
                value={property.status}
                onChange={(v) => setProperties(properties.map((p) => (p.id === property.id ? { ...p, status: v } : p)))}
                options={[
                  { value: "sale", label: "למכירה" },
                  { value: "rent", label: "להשכרה" },
                ]}
                error={errors?.properties[i]?.status}
              />
              <SelectField
                label="סוכן אחראי (אופציונלי)"
                value={property.assignedAgentId}
                onChange={(v) =>
                  setProperties(properties.map((p) => (p.id === property.id ? { ...p, assignedAgentId: v } : p)))
                }
                options={[{ value: "", label: "בחרו סוכן" }, ...agents.map((a) => ({ value: a.id, label: a.name || a.id }))]}
              />
            </div>
            <TextAreaField
              label="מאפייני הנכס (שורה לכל מאפיין, אופציונלי)"
              value={property.features.join("\n")}
              onChange={(v) =>
                setProperties(properties.map((p) => (p.id === property.id ? { ...p, features: v.split("\n") } : p)))
              }
            />
            <FileField
              label="תמונות הנכס"
              required
              multiple
              onChange={(files) =>
                setProperties(
                  properties.map((p) => (p.id === property.id ? { ...p, imageFilenames: files.map((f) => f.name) } : p))
                )
              }
              error={errors?.properties[i]?.imageFilenames}
            />
            {properties.length > 1 && (
              <button
                type="button"
                onClick={() => setProperties(properties.filter((p) => p.id !== property.id))}
                className="text-sm font-medium text-red-600"
              >
                הסר נכס
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setProperties([
              ...properties,
              {
                id: nextId("property"),
                title: "",
                location: "",
                price: "",
                rooms: "",
                type: "",
                status: "sale",
                features: [""],
                imageFilenames: [],
                assignedAgentId: "",
              },
            ])
          }
          className="rounded-full border-2 border-[var(--color-main)]/20 px-6 py-2.5 text-sm font-bold transition hover:bg-[var(--color-background)]"
        >
          + הוסף נכס
        </button>
      </SectionCard>

      <SectionCard title="לקוחות ממליצים" description="אופציונלי — עסק חדש בדרך כלל עדיין לא יהיו לו המלצות">
        {testimonials.map((t) => (
          <div key={t.id} className="space-y-4 rounded-xl border border-[var(--color-main)]/10 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="שם הלקוח"
                value={t.name}
                onChange={(v) => setTestimonials(testimonials.map((x) => (x.id === t.id ? { ...x, name: v } : x)))}
              />
              <TextField
                label="הקשר (לדוגמה: רכשו וילה ב...)"
                value={t.context}
                onChange={(v) => setTestimonials(testimonials.map((x) => (x.id === t.id ? { ...x, context: v } : x)))}
              />
            </div>
            <TextAreaField
              label="הציטוט"
              value={t.text}
              onChange={(v) => setTestimonials(testimonials.map((x) => (x.id === t.id ? { ...x, text: v } : x)))}
            />
            {testimonials.length > 1 && (
              <button
                type="button"
                onClick={() => setTestimonials(testimonials.filter((x) => x.id !== t.id))}
                className="text-sm font-medium text-red-600"
              >
                הסר המלצה
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setTestimonials([...testimonials, { id: nextId("t"), name: "", context: "", text: "" }])}
          className="rounded-full border-2 border-[var(--color-main)]/20 px-6 py-2.5 text-sm font-bold transition hover:bg-[var(--color-background)]"
        >
          + הוסף המלצה
        </button>
      </SectionCard>

      <SectionCard title="שאלות ותשובות" description="לפחות שאלה אחת נדרשת">
        {faq.map((item, i) => (
          <div key={i} className="space-y-4 rounded-xl border border-[var(--color-main)]/10 p-5">
            <TextField
              label="שאלה"
              required={i === 0}
              value={item.question}
              onChange={(v) => setFaq(faq.map((f, idx) => (idx === i ? { ...f, question: v } : f)))}
              error={errors?.faq[i]?.question}
            />
            <TextAreaField
              label="תשובה"
              required={i === 0}
              value={item.answer}
              onChange={(v) => setFaq(faq.map((f, idx) => (idx === i ? { ...f, answer: v } : f)))}
              error={errors?.faq[i]?.answer}
            />
            {faq.length > 1 && (
              <button
                type="button"
                onClick={() => setFaq(faq.filter((_, idx) => idx !== i))}
                className="text-sm font-medium text-red-600"
              >
                הסר שאלה
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setFaq([...faq, { question: "", answer: "" }])}
          className="rounded-full border-2 border-[var(--color-main)]/20 px-6 py-2.5 text-sm font-bold transition hover:bg-[var(--color-background)]"
        >
          + הוסף שאלה
        </button>
      </SectionCard>

      <SectionCard title="נתונים / סטטיסטיקות" description="אופציונלי — בחרו אייקון מוכן או הוסיפו משלכם">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {iconRegistry.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setStats([...stats, { iconId: id, value: "", label: "" }])}
              className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-main)]/10 p-4 transition hover:border-[var(--color-accent2)]"
            >
              <Icon className="h-6 w-6 text-[var(--color-accent2)]" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>

        {stats.map((stat, i) => {
          const { Icon } = iconRegistry.find((entry) => entry.id === stat.iconId) ?? {};
          return (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-[var(--color-main)]/10 p-4">
              {Icon && <Icon className="h-6 w-6 shrink-0 text-[var(--color-accent2)]" />}
              <input
                type="text"
                placeholder="ערך (לדוגמה: 450+)"
                value={stat.value}
                onChange={(v) => setStats(stats.map((s, idx) => (idx === i ? { ...s, value: v.target.value } : s)))}
                className="w-32 rounded-lg border border-[var(--color-main)]/15 px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="תווית (לדוגמה: נכסים שנמכרו)"
                value={stat.label}
                onChange={(v) => setStats(stats.map((s, idx) => (idx === i ? { ...s, label: v.target.value } : s)))}
                className="flex-1 rounded-lg border border-[var(--color-main)]/15 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setStats(stats.filter((_, idx) => idx !== i))}
                className="text-sm font-medium text-red-600"
              >
                הסר
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => setStats([...stats, { iconId: iconRegistry[0].id, value: "", label: "" }])}
          className="rounded-full border-2 border-[var(--color-main)]/20 px-6 py-2.5 text-sm font-bold transition hover:bg-[var(--color-background)]"
        >
          + הוסף אייקון מותאם אישית
        </button>
      </SectionCard>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleDeploy}
          disabled={deploying}
          className="rounded-full bg-[var(--color-accent2)] px-10 py-4 text-lg font-bold text-white shadow-[0_15px_40px_rgba(176,141,87,0.55)] transition hover:scale-105 disabled:opacity-60"
        >
          {deploying ? "מעלה את האתר לאוויר..." : "צור אתר חי"}
        </button>
        <button
          type="button"
          onClick={handleBuild}
          className="text-sm font-semibold text-[var(--color-main)]/60 underline"
        >
          או: הצג קבצי נתונים בלבד (ללא פרסום)
        </button>
      </div>

      {deployResult && (
        <div
          className={`rounded-2xl p-6 text-center ${
            deployResult.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          {deployResult.ok ? (
            <>
              <p className="text-lg font-bold">האתר עלה לאוויר בהצלחה! 🎉</p>
              <a
                href={deployResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block font-bold underline"
              >
                {deployResult.url}
              </a>
            </>
          ) : (
            <>
              <p className="font-bold">היצירה נכשלה ({deployResult.reason || deployResult.status})</p>
              <p className="mt-1 text-sm">אפשר לנסות שוב, או להשתמש ב&quot;הצג קבצי נתונים בלבד&quot; ולהעביר ידנית.</p>
            </>
          )}
        </div>
      )}

      {output && (
        <SectionCard
          title="קבצי הנתונים שנוצרו"
          description="העתיקו כל קובץ למקום המתאים תחת src/data/. את קבצי התמונות שהועלו יש להעתיק ידנית לתיקיית public/uploads/ בשם הזהה לשם הקובץ המקורי."
        >
          <CodeOutput filename="src/data/agency.js" content={output.agency} />
          <CodeOutput filename="src/data/agents.js" content={output.agents} />
          <CodeOutput filename="src/data/properties.js" content={output.properties} />
          <CodeOutput filename="src/data/testimonials.js" content={output.testimonials} />
          <CodeOutput filename="src/data/faq.js" content={output.faq} />
          <CodeOutput filename="src/components/Stats.jsx (עדכון רשימת הנתונים)" content={output.stats} />
        </SectionCard>
      )}
    </div>
  );
}
