"use client";

import { useState, useEffect } from "react";
import { TextField, TextAreaField, SelectField, ColorField, FileField, SectionCard } from "./FormField";
import ImageTile from "./ImageTile";
import iconRegistry, { matchIconIdFromText } from "@/lib/iconRegistry";
import { buildDefaultSeoTerms } from "@/lib/seo";
import defaultTestimonials from "@/data/testimonials";
import defaultFaq from "@/data/faq";
import defaultAgencyData from "@/data/agency";
import defaultAgentsData from "@/data/agents";
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

export default function IntakeForm({ onBack, siteId }) {
  const [loadingExisting, setLoadingExisting] = useState(Boolean(siteId));
  const [loadError, setLoadError] = useState(false);
  const [existingProjectName, setExistingProjectName] = useState(null);
  const [existingCreatedAt, setExistingCreatedAt] = useState(null);
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
    customSeoTerms: [],
  });
  const [seoTermInput, setSeoTermInput] = useState("");
  const [showDefaultSeoTerms, setShowDefaultSeoTerms] = useState(false);
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
    personalQuote: "",
  });
  const [generated, setGenerated] = useState({ aboutText: "", ownerQuote: "" });
  const [generating, setGenerating] = useState(false);

  const [agents, setAgents] = useState([
    { id: nextId("agent"), name: "", role: "", photoFilename: "", phone: "", whatsapp: "", email: "", bio: "", yearsOfExperience: "" },
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
      images: [],
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

  useEffect(() => {
    if (!siteId) return;
    fetch(`/api/sites/${siteId}`)
      .then((res) => {
        if (!res.ok) throw new Error("not-found");
        return res.json();
      })
      .then((site) => {
        setAgency({ ...site.agency, customSeoTerms: site.agency.customSeoTerms || [] });
        setColors(site.agency.colors);
        setGenerated({ aboutText: site.agency.aboutText || "", ownerQuote: site.agency.ownerQuote || "" });
        setAgents(site.agents?.length ? site.agents : agents);
        setProperties(
          (site.properties?.length ? site.properties : properties).map((p) => ({
            ...p,
            images: (p.imageFilenames || []).map((filename) => ({
              id: nextId("img"),
              previewUrl: `/uploads/${filename}`,
              existing: true,
              removed: false,
            })),
          }))
        );
        setTestimonials(site.testimonials?.length ? site.testimonials : testimonials);
        setFaq(site.faq?.length ? site.faq : faq);
        setStats(site.stats || []);
        setExistingProjectName(site.projectName);
        setExistingCreatedAt(site.createdAt);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoadingExisting(false));
    // Only ever runs once per mount (siteId is fixed for the lifetime of this form instance).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId]);

  const defaultSeoTerms = buildDefaultSeoTerms(properties, agency.name || "שם העסק");

  const addSeoTerm = () => {
    const term = seoTermInput.trim();
    if (!term || agency.customSeoTerms.includes(term)) {
      setSeoTermInput("");
      return;
    }
    setAgency((a) => ({ ...a, customSeoTerms: [...a.customSeoTerms, term] }));
    setSeoTermInput("");
  };

  const removeSeoTerm = (index) => {
    setAgency((a) => ({ ...a, customSeoTerms: a.customSeoTerms.filter((_, i) => i !== index) }));
  };

  // New uploads carry a File (name is the eventual /uploads/<name> filename);
  // existing images loaded from a saved site only have a previewUrl already
  // pointing at /uploads/<name> — strip that prefix back to the bare filename
  // so it round-trips through generatePropertiesFile unchanged either way.
  const syncImageFilenames = (images) =>
    images
      .filter((img) => !img.removed)
      .map((img) => (img.file ? img.file.name : img.previewUrl.replace(/^\/uploads\//, "")));

  const addPropertyImages = (propertyId, fileList) => {
    const added = Array.from(fileList).map((file) => ({
      id: nextId("img"),
      file,
      previewUrl: URL.createObjectURL(file),
      removed: false,
    }));
    setProperties(
      properties.map((p) => {
        if (p.id !== propertyId) return p;
        const images = [...added, ...p.images];
        return { ...p, images, imageFilenames: syncImageFilenames(images) };
      })
    );
  };

  const togglePropertyImage = (propertyId, imageId) => {
    setProperties(
      properties.map((p) => {
        if (p.id !== propertyId) return p;
        const images = p.images.map((img) => (img.id === imageId ? { ...img, removed: !img.removed } : img));
        return { ...p, images, imageFilenames: syncImageFilenames(images) };
      })
    );
  };

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
      // Brand story fields only feed the AI "about text" generator — when
      // editing an existing site, aboutText/ownerQuote are already set, so
      // there's nothing forcing the owner to re-fill these intermediate fields.
      // Typing "x" in any one of the 4 about-page fields also skips requiring
      // the other 3, since the whole paragraph gets swapped for the template
      // default in that case.
      brandStory: siteId || isAboutTextPlaceholderTriggered() ? {} : validateBrandStory(brandStory),
      agents: agents.map(validateAgent),
      properties: properties.map(validateProperty),
      faq: faq.length === 1 && isPlaceholderEntry(faq[0]) ? [{}] : faq.map(validateFaqItem),
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

  const buildStatsPayload = () =>
    stats.map((s) => {
      const iconId = s.iconId || matchIconIdFromText(`${s.label} ${s.value}`);
      return { ...s, iconId, iconImport: iconImportNames[iconId] };
    });

  // If the agency owner types just "x" into any field of the single blank
  // entry instead of filling it in for real, swap in the template's own
  // default content for the whole section (flagged so the live site shows
  // it in red) — a quick way to spin up a free demo without filling everything.
  const isXTrigger = (value) => typeof value === "string" && value.trim().toLowerCase() === "x";
  const isPlaceholderEntry = (entry) =>
    Object.entries(entry).some(([key, value]) => key !== "id" && isXTrigger(value));

  // Same idea for the 4 fields that build the "אודות" page paragraph —
  // typing "x" in any one of them swaps in the template's own about text.
  const isAboutTextPlaceholderTriggered = () =>
    [brandStory.yearsInBusiness, brandStory.whatMakesSpecial, brandStory.areas, brandStory.approach].some(isXTrigger);

  const buildAgencyPayload = () => {
    const base = { ...agency, ...generated, colors };
    if (isAboutTextPlaceholderTriggered()) {
      return { ...base, aboutText: defaultAgencyData.aboutText, aboutTextPlaceholder: true };
    }
    return { ...base, aboutTextPlaceholder: Boolean(agency.aboutTextPlaceholder) };
  };

  // Strip the local-only `images` preview objects (File instances aren't
  // JSON-serializable) — only `imageFilenames` is sent/generated from.
  const buildPropertiesPayload = () => properties.map(({ images, ...rest }) => rest);

  // Same "x" shortcut per agent bio — swaps that one agent's bio for a
  // template agent's bio (cycling through the demo roster by position).
  const buildAgentsPayload = () =>
    agents.map((a, i) => {
      if (isXTrigger(a.bio)) {
        const demoBio = defaultAgentsData[i % defaultAgentsData.length].bio;
        return { ...a, bio: demoBio, bioPlaceholder: true };
      }
      return { ...a, bioPlaceholder: Boolean(a.bioPlaceholder) };
    });

  const buildTestimonialsPayload = () => {
    if (testimonials.length === 1 && isPlaceholderEntry(testimonials[0])) {
      return defaultTestimonials.map((t) => ({ ...t, placeholder: true }));
    }
    return testimonials;
  };

  const buildFaqPayload = () => {
    if (faq.length === 1 && isPlaceholderEntry(faq[0])) {
      return defaultFaq.map((f) => ({ ...f, placeholder: true }));
    }
    return faq;
  };

  const handleBuild = () => {
    const valid = runValidation();
    if (!valid) {
      setOutput(null);
      return;
    }
    setOutput({
      agency: generateAgencyFile(buildAgencyPayload()),
      agents: generateAgentsFile(buildAgentsPayload()),
      properties: generatePropertiesFile(buildPropertiesPayload()),
      testimonials: generateTestimonialsFile(buildTestimonialsPayload()),
      faq: generateFaqFile(buildFaqPayload()),
      stats: generateStatsFile(buildStatsPayload()),
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
          agency: buildAgencyPayload(),
          agents: buildAgentsPayload(),
          properties: buildPropertiesPayload(),
          testimonials: buildTestimonialsPayload(),
          faq: buildFaqPayload(),
          stats: buildStatsPayload(),
          siteId: siteId || undefined,
          projectName: existingProjectName || undefined,
          createdAt: existingCreatedAt || undefined,
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

  if (loadingExisting) {
    return <p className="px-6 py-20 text-center text-lg text-[var(--color-main)]/60">טוען את פרטי האתר...</p>;
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-6 py-20 text-center">
        <p className="text-lg font-bold text-red-600">לא ניתן היה לטעון את פרטי האתר.</p>
        {onBack && (
          <button type="button" onClick={onBack} className="text-sm font-semibold text-[var(--color-main)]/60">
            ← חזרה
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-14 lg:px-10">
      <div>
        {onBack && (
          <button type="button" onClick={onBack} className="mb-4 text-sm font-semibold text-[var(--color-main)]/60">
            ← חזרה
          </button>
        )}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {siteId ? "עריכת אתר קיים" : "שאלון הקמת אתר ללקוח חדש"}
        </h1>
        <p className="mt-2 text-lg text-[var(--color-main)]/60">
          {siteId
            ? "ערכו את הפרטים ולחצו על עדכן שינויים כדי לפרסם אותם לאתר החי."
            : "מלאו את הפרטים הבאים כדי לייצר את קובצי הנתונים המוכנים להטמעה באתר. שדות עם * הם שדות חובה."}
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

      <SectionCard
        title="מילות חיפוש נוספות ל-SEO"
        description="האתר שלכם כבר כולל אופטימיזציית SEO מובנית באופן אוטומטי — שם העסק, האזורים בהם אתם פעילים וסוגי הנכסים שלכם. כאן ניתן להוסיף מילות חיפוש ספציפיות נוספות שחשוב לכם שהאתר יופיע בעבורן בגוגל (אופציונלי)."
      >
        <button
          type="button"
          onClick={() => setShowDefaultSeoTerms((v) => !v)}
          className="text-sm font-bold text-[var(--color-accent2)] underline"
        >
          {showDefaultSeoTerms ? "הסתר" : "ראה הכל"} את מילות ה-SEO המובנות כבר באתר
        </button>

        {showDefaultSeoTerms && (
          <div className="flex flex-wrap gap-2 rounded-xl bg-[var(--color-background)] p-4">
            {defaultSeoTerms.map((term) => (
              <span
                key={term}
                className="rounded-full bg-[var(--color-main)]/10 px-4 py-1.5 text-sm font-medium text-[var(--color-main)]/70"
              >
                {term}
              </span>
            ))}
          </div>
        )}

        {agency.customSeoTerms.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {agency.customSeoTerms.map((term, i) => (
              <span
                key={`${term}-${i}`}
                className="flex items-center gap-2 rounded-full bg-[var(--color-accent2)]/15 px-4 py-1.5 text-sm font-bold text-[var(--color-main)]"
              >
                {term}
                <button
                  type="button"
                  onClick={() => removeSeoTerm(i)}
                  aria-label={`הסר ${term}`}
                  className="text-[var(--color-main)]/50 transition hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={seoTermInput}
            onChange={(e) => setSeoTermInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSeoTerm();
              }
            }}
            placeholder="לדוגמה: דירת גן ברמת גן"
            className="w-full rounded-full border border-[var(--color-main)]/15 bg-[var(--color-background)] px-6 py-3 text-base font-medium outline-none transition focus:border-[var(--color-accent2)]"
          />
          <button
            type="button"
            onClick={addSeoTerm}
            className="shrink-0 rounded-full border-2 border-[var(--color-main)]/20 px-6 py-3 text-sm font-bold transition hover:bg-[var(--color-background)]"
          >
            + הוסף מונח נוסף
          </button>
        </div>
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

      <SectionCard
        title="סיפור המותג — בונה את עמוד 'אודותינו'"
        description="ארבעת השדות הבאים בונים יחד את פסקת ה'אודות' שמופיעה בעמוד /about באתר (עמוד אודותינו הנפרד, לא עמוד הבית). ה-AI ישלב אותם לפסקה אחת רהוטה ומקצועית. אפשר גם לערוך את התוצאה ישירות. אם תכתבו x בלבד באחד מהשדות האלה, תישלח בפסקת האודות ברירת המחדל של התבנית, ותוצג באתר החי בצבע אדום כדי שיהיה ברור שצריך להחליף אותה."
      >
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
        <TextAreaField
          label="אודותינו למסך ראשי (לא עמוד של אודותינו) — כתבו במילים שלכם, ה-AI ישפר וירחיב מעט"
          placeholder="לדוגמה: אני מאמין שכל לקוח מגיע עם חלום, והתפקיד שלי הוא להפוך אותו למציאות."
          required
          value={brandStory.personalQuote}
          onChange={(v) => setBrandStory({ ...brandStory, personalQuote: v })}
          error={errors?.brandStory.personalQuote}
        />
        <p className="text-xs text-[var(--color-main)]/50">
          השדה הזה שונה מהשדות שמעליו: הוא מיועד לעמוד הבית בלבד (לא לעמוד האודותינו), ומוצג שם מתחת לתמונה ולשם של
          בעל העסק, בסעיף &quot;אודותינו&quot; שבעמוד הבית.
        </p>
        <button
          type="button"
          onClick={handleGenerateAbout}
          disabled={generating}
          className="rounded-full bg-[var(--color-main)] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {generating ? "מייצר..." : "צור טקסט אודות + ציטוט אישי"}
        </button>
        {generated.aboutText && (
          <>
            <TextAreaField
              label="אודות — לעמוד האודותינו (ניתן לערוך ישירות; מה שכתוב כאן בזמן השליחה הוא מה שיפורסם)"
              rows={5}
              value={generated.aboutText}
              onChange={(v) => setGenerated({ ...generated, aboutText: v })}
            />
            <TextAreaField
              label="אודותינו למסך ראשי (ניתן לערוך ישירות; מה שכתוב כאן בזמן השליחה הוא מה שיפורסם)"
              rows={3}
              value={generated.ownerQuote}
              onChange={(v) => setGenerated({ ...generated, ownerQuote: v })}
            />
          </>
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
            <TextAreaField
              label="קצת על הסוכן/ת (מוצג כציטוט בעמוד הפרופיל האישי של הסוכן/ת הזה בלבד — שדה נפרד לגמרי מהאודות ומהציטוט למסך הראשי, גם עבור בעל העסק)"
              placeholder="לדוגמה: כמה שנות ניסיון בתחום, רקע מקצועי, התמחויות והישגים בולטים... (או x בלבד כדי להשתמש בטקסט לדוגמה, שיוצג באדום)"
              required
              rows={3}
              value={agent.bio}
              onChange={(v) => setAgents(agents.map((a) => (a.id === agent.id ? { ...a, bio: v } : a)))}
              error={errors?.agents[i]?.bio}
            />
            <TextField
              label="שנות ניסיון"
              type="number"
              value={agent.yearsOfExperience}
              onChange={(v) =>
                setAgents(agents.map((a) => (a.id === agent.id ? { ...a, yearsOfExperience: v.replace(/\D/g, "") } : a)))
              }
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
              { id: nextId("agent"), name: "", role: "", photoFilename: "", phone: "", whatsapp: "", email: "", bio: "", yearsOfExperience: "" },
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
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-[var(--color-main)]/80">
                תמונות הנכס <span className="text-red-500">*</span>
              </span>

              {property.images.length > 0 && (
                <div className="mb-4 grid grid-cols-3 gap-3">
                  {property.images.map((img) => (
                    <ImageTile
                      key={img.id}
                      src={img.previewUrl}
                      removed={img.removed}
                      onToggleRemove={() => togglePropertyImage(property.id, img.id)}
                    />
                  ))}
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  addPropertyImages(property.id, e.target.files);
                  e.target.value = "";
                }}
                className="w-full rounded-xl border border-dashed border-[var(--color-main)]/25 bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none file:ml-3 file:rounded-full file:border-0 file:bg-[var(--color-accent2)] file:px-4 file:py-1.5 file:text-xs file:font-bold file:text-white"
              />
              {errors?.properties[i]?.imageFilenames && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.properties[i].imageFilenames}</p>
              )}
            </div>
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
                images: [],
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
          const Icon = iconRegistry.find((entry) => entry.id === stat.iconId)?.Icon;
          return (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-[var(--color-main)]/10 p-4">
              {Icon ? (
                <Icon className="h-6 w-6 shrink-0 text-[var(--color-accent2)]" />
              ) : (
                <div
                  className="h-6 w-6 shrink-0 rounded border-2 border-dashed border-[var(--color-main)]/25"
                  title="האייקון ייבחר אוטומטית לפי הטקסט"
                />
              )}
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
          onClick={() => setStats([...stats, { iconId: null, value: "", label: "" }])}
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
          {deploying ? (siteId ? "מעדכן את האתר..." : "מעלה את האתר לאוויר...") : siteId ? "עדכן שינויים" : "צור אתר חי"}
        </button>
        {hasErrors && (
          <p className="text-sm font-bold text-red-600">
            חסרים שדות חובה (מסומנים ב-*) — גללו למעלה כדי לראות אילו.
          </p>
        )}
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
              <p className="text-lg font-bold">{siteId ? "השינויים פורסמו בהצלחה! 🎉" : "האתר עלה לאוויר בהצלחה! 🎉"}</p>
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
              <p className="font-bold">
                {siteId ? "העדכון נכשל" : "היצירה נכשלה"} ({deployResult.reason || deployResult.status})
              </p>
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
