"use client";

import { useState, useEffect } from "react";
import { upload } from "@vercel/blob/client";
import { TextField, TextAreaField, SelectField, ColorField, SectionCard, ComboboxField } from "./FormField";
import ImageTile from "./ImageTile";
import SortableImageGrid from "./SortableImageGrid";
import iconRegistry, { matchIconIdFromText } from "@/lib/iconRegistry";
import { buildDefaultSeoTerms } from "@/lib/seo";
import {
  addImages,
  toggleImageRemoved,
  reorderImages,
  syncImageFilenames,
  storageFilename,
  filenameForUpload,
} from "@/lib/imageOrdering";
import { israelCities, getNeighborhoodsForCity } from "@/data/israelLocations";
import defaultTestimonials from "@/data/testimonials";
import defaultFaq from "@/data/faq";
import defaultAgencyData from "@/data/agency";
import defaultAgentsData from "@/data/agents";
import defaultStats from "@/data/stats";
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
import {
  validateAgency,
  validateColors,
  validateBrandStory,
  validateAgent,
  validateProperty,
  validateFaqItem,
  validateShowcase,
  validateWhyUs,
  validateWhyUsCard,
  isEmpty,
} from "@/lib/intakeValidation";

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
  // Images upload directly to Blob as soon as they're picked (see
  // uploadNewImages below), which needs a stable site id up front — for a
  // brand-new site there's no real one yet, so mint a draft id immediately
  // and use it consistently for every upload path this form session.
  const [draftSiteId] = useState(
    () => siteId || `site-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  );
  const effectiveSiteId = siteId || draftSiteId;
  const [projectSlug, setProjectSlug] = useState("");
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
  // { id, file?, previewUrl, existing?, removed } | null — kept separate from
  // `agency` so it can reuse the same preview/remove UI as the image grids.
  const [logoImage, setLogoImage] = useState(null);
  const [heroImages, setHeroImages] = useState([]);
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
    {
      id: nextId("agent"),
      name: "",
      role: "",
      photoFilename: "",
      photoFile: null,
      photoPreviewUrl: "",
      phone: "",
      whatsapp: "",
      email: "",
      bio: "",
      yearsOfExperience: "",
    },
  ]);
  const [properties, setProperties] = useState([
    {
      id: nextId("property"),
      title: "",
      address: "",
      city: "",
      neighborhood: "",
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
  const [showcase, setShowcase] = useState({
    projectName: "",
    description: "",
    agentName: "",
    agentPhone: "",
    linkedPropertyId: "",
    bullets: [],
  });
  const [showcaseImage, setShowcaseImageState] = useState(null);
  const [showcaseAgentImage, setShowcaseAgentImageState] = useState(null);
  const [whyUs, setWhyUs] = useState({
    heading: "",
    cards: Array.from({ length: 6 }, () => ({ title: "", description: "" })),
  });

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
        setAgency({
          ...site.agency,
          customSeoTerms: site.agency.customSeoTerms || [],
        });
        setColors(site.agency.colors);
        setGenerated({ aboutText: site.agency.aboutText || "", ownerQuote: site.agency.ownerQuote || "" });
        setLogoImage(
          site.agency.logoFilename
            ? { id: nextId("img"), previewUrl: `/uploads/${site.agency.logoFilename}`, existing: true, removed: false }
            : null
        );
        setHeroImages(
          (site.agency.heroImageFilenames || []).map((filename) => ({
            id: nextId("img"),
            previewUrl: `/uploads/${filename}`,
            existing: true,
            removed: false,
          }))
        );
        setAgents(
          (site.agents?.length ? site.agents : agents).map((a) => ({
            ...a,
            photoFile: null,
            photoPreviewUrl: a.photoFilename ? `/uploads/${a.photoFilename}` : "",
          }))
        );
        setProperties(
          (site.properties?.length ? site.properties : properties).map((p) => ({
            ...p,
            address: p.address || "",
            city: p.city || "",
            neighborhood: p.neighborhood || "",
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
        setShowcase({
          projectName: site.showcase?.projectName || "",
          description: site.showcase?.description || "",
          agentName: site.showcase?.agentName || "",
          agentPhone: site.showcase?.agentPhone || "",
          linkedPropertyId: site.showcase?.linkedPropertyId || "",
          bullets: site.showcase?.bullets || [],
        });
        setShowcaseImageState(
          site.showcase?.imageFilename
            ? { id: nextId("img"), previewUrl: `/uploads/${site.showcase.imageFilename}`, existing: true, removed: false }
            : null
        );
        setShowcaseAgentImageState(
          site.showcase?.agentImageFilename
            ? {
                id: nextId("img"),
                previewUrl: `/uploads/${site.showcase.agentImageFilename}`,
                existing: true,
                removed: false,
              }
            : null
        );
        setWhyUs({
          heading: site.whyUs?.heading || "",
          cards:
            site.whyUs?.cards?.length === 6
              ? site.whyUs.cards
              : Array.from({ length: 6 }, () => ({ title: "", description: "" })),
        });
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

  const setLogoFile = (file) => {
    if (!file) return;
    setLogoImage({ id: nextId("img"), file, previewUrl: URL.createObjectURL(file), removed: false });
  };

  const toggleLogoRemoved = () => setLogoImage((img) => (img ? { ...img, removed: !img.removed } : img));

  const addHeroImages = (fileList) => {
    const added = Array.from(fileList).map((file) => ({
      id: nextId("img"),
      file,
      previewUrl: URL.createObjectURL(file),
      removed: false,
    }));
    setHeroImages((prev) => addImages(prev, added));
  };

  const toggleHeroImage = (imgId) => setHeroImages((prev) => toggleImageRemoved(prev, imgId));

  const reorderHeroImages = (draggedId, targetId) =>
    setHeroImages((prev) => reorderImages(prev, draggedId, targetId));

  const setShowcaseImageFile = (file) => {
    if (!file) return;
    setShowcaseImageState({ id: nextId("img"), file, previewUrl: URL.createObjectURL(file), removed: false });
  };
  const toggleShowcaseImageRemoved = () =>
    setShowcaseImageState((img) => (img ? { ...img, removed: !img.removed } : img));

  const setShowcaseAgentImageFile = (file) => {
    if (!file) return;
    setShowcaseAgentImageState({ id: nextId("img"), file, previewUrl: URL.createObjectURL(file), removed: false });
  };
  const toggleShowcaseAgentImageRemoved = () =>
    setShowcaseAgentImageState((img) => (img ? { ...img, removed: !img.removed } : img));

  // Capped at 6 — the popup lays these out as a single row (≤5) or a clean
  // 3x2 grid (exactly 6); more than that has no good layout in the fixed-height bar.
  const addShowcaseBullet = () =>
    setShowcase((s) => (s.bullets.length >= 6 ? s : { ...s, bullets: [...s.bullets, ""] }));
  const updateShowcaseBullet = (i, value) =>
    setShowcase((s) => ({ ...s, bullets: s.bullets.map((b, idx) => (idx === i ? value : b)) }));
  const removeShowcaseBullet = (i) =>
    setShowcase((s) => ({ ...s, bullets: s.bullets.filter((_, idx) => idx !== i) }));

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
        const images = addImages(p.images, added);
        return { ...p, images, imageFilenames: syncImageFilenames(images) };
      })
    );
  };

  const togglePropertyImage = (propertyId, imageId) => {
    setProperties(
      properties.map((p) => {
        if (p.id !== propertyId) return p;
        const images = toggleImageRemoved(p.images, imageId);
        return { ...p, images, imageFilenames: syncImageFilenames(images) };
      })
    );
  };

  const reorderPropertyImages = (propertyId, draggedId, targetId) => {
    setProperties(
      properties.map((p) => {
        if (p.id !== propertyId) return p;
        const images = reorderImages(p.images, draggedId, targetId);
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
      agency: validateAgency({ ...agency, heroImageFilenames: syncImageFilenames(heroImages) }),
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
      showcase: validateShowcase(showcase),
      whyUs: validateWhyUs(whyUs),
      whyUsCards: whyUs.cards.map(validateWhyUsCard),
    };
    setErrors(nextErrors);

    return (
      isEmpty(nextErrors.agency) &&
      isEmpty(nextErrors.colors) &&
      isEmpty(nextErrors.brandStory) &&
      nextErrors.agents.every(isEmpty) &&
      nextErrors.properties.every(isEmpty) &&
      nextErrors.faq.every(isEmpty) &&
      isEmpty(nextErrors.showcase) &&
      isEmpty(nextErrors.whyUs) &&
      nextErrors.whyUsCards.every(isEmpty)
    );
  };

  // The stats section is optional — if the agency owner never touches it (no
  // icons picked, nothing typed), ship the template's own 6 default stats
  // with their template icons, flagged so the live site shows them in red.
  const buildStatsPayload = () => {
    if (stats.length === 0) {
      return defaultStats.map((s) => ({ ...s, placeholder: true }));
    }
    return stats.map((s) => {
      const iconId = s.iconId || matchIconIdFromText(`${s.label} ${s.value}`);
      return { ...s, iconId, placeholder: false };
    });
  };

  // If the agency owner leaves a field blank (or types just "x" into it) in
  // the single blank entry instead of filling it in for real, swap in the
  // template's own default content for the whole section instead of
  // blocking submission — every optional section should always ship with
  // something rather than force the admin to fill it all out.
  const isXTrigger = (value) => typeof value === "string" && ["", "x"].includes(value.trim().toLowerCase());
  const isPlaceholderEntry = (entry) =>
    Object.entries(entry).some(([key, value]) => key !== "id" && isXTrigger(value));

  // Same idea for the 4 fields that build the "אודות" page paragraph —
  // typing "x" in any one of them swaps in the template's own about text.
  const isAboutTextPlaceholderTriggered = () =>
    [brandStory.yearsInBusiness, brandStory.whatMakesSpecial, brandStory.areas, brandStory.approach].some(isXTrigger);

  const buildAgencyPayload = () => {
    const logoFilename = logoImage && !logoImage.removed ? syncImageFilenames([logoImage])[0] || "" : "";
    const base = {
      ...agency,
      ...generated,
      colors,
      logoFilename,
      heroImageFilenames: syncImageFilenames(heroImages),
    };
    if (isAboutTextPlaceholderTriggered()) {
      return { ...base, aboutText: defaultAgencyData.aboutText, aboutTextPlaceholder: true };
    }
    return { ...base, aboutTextPlaceholder: Boolean(agency.aboutTextPlaceholder) };
  };

  // Strip the local-only `images` preview objects (File instances aren't
  // JSON-serializable) — only `imageFilenames` is sent/generated from.
  // The site's property cards/filters read a single `location` string —
  // compose it from the structured city/neighborhood pickers so every other
  // component (PropertyCard, filters, AreasWeCover, SEO) needs no changes.
  const buildPropertiesPayload = () =>
    properties.map(({ images, ...rest }) => {
      const location =
        rest.neighborhood && rest.neighborhood !== rest.city ? `${rest.neighborhood}, ${rest.city}` : rest.city;
      const features = rest.features.map((f) => f.trim()).filter(Boolean);
      return { ...rest, location, features };
    });

  // Generic stock headshots for a blank photo — never agent-1's real photo
  // (that's this template's own owner, not a fill-in for someone else's site).
  const AGENT_PHOTO_FALLBACKS = defaultAgentsData.slice(1).map((a) => a.photo);

  // Every agent field is optional: leave any of them blank (or type "x") and
  // it falls back to something reasonable — contact info falls back to the
  // agency's own phone/whatsapp/email so real inquiries still reach someone,
  // role/bio/photo fall back to generic demo content, never to another
  // agent's real name or personal photo.
  const buildAgentsPayload = () =>
    agents.map(({ photoFile, photoPreviewUrl, ...a }, i) => {
      const demo = defaultAgentsData[i % defaultAgentsData.length];
      const bioPlaceholder = isXTrigger(a.bio);
      return {
        ...a,
        name: isXTrigger(a.name) ? "נציג/ת מכירות" : a.name,
        role: isXTrigger(a.role) ? demo.role : a.role,
        phone: isXTrigger(a.phone) ? agency.phone : a.phone,
        whatsapp: isXTrigger(a.whatsapp) ? agency.whatsapp || agency.phone : a.whatsapp,
        email: isXTrigger(a.email) ? agency.email : a.email,
        photo: a.photoFilename ? undefined : AGENT_PHOTO_FALLBACKS[i % AGENT_PHOTO_FALLBACKS.length],
        bio: bioPlaceholder ? demo.bio : a.bio,
        bioPlaceholder: bioPlaceholder || Boolean(a.bioPlaceholder),
      };
    });

  const buildTestimonialsPayload = () => {
    if (testimonials.length === 1 && isPlaceholderEntry(testimonials[0])) {
      return defaultTestimonials.map((t) => ({ ...t, placeholder: true }));
    }
    // Drop any extra rows left completely blank rather than shipping empty
    // testimonial cards to the live site.
    return testimonials.filter((t) => t.name.trim() || t.context.trim() || t.text.trim());
  };

  const buildFaqPayload = () => {
    if (faq.length === 1 && isPlaceholderEntry(faq[0])) {
      return defaultFaq.map((f) => ({ ...f, placeholder: true }));
    }
    // Drop any extra rows left completely blank rather than shipping empty
    // FAQ entries — but never ship a totally empty list (the page always
    // renders a FAQ block), so fall back to the defaults if nothing's left.
    const filled = faq.filter((f) => f.question.trim() || f.answer.trim());
    return filled.length ? filled : defaultFaq.map((f) => ({ ...f, placeholder: true }));
  };

  const buildShowcasePayload = () => ({
    imageFilename: showcaseImage && !showcaseImage.removed ? syncImageFilenames([showcaseImage])[0] || "" : "",
    projectName: showcase.projectName,
    description: showcase.description,
    agentName: showcase.agentName,
    agentPhone: showcase.agentPhone,
    agentImageFilename:
      showcaseAgentImage && !showcaseAgentImage.removed ? syncImageFilenames([showcaseAgentImage])[0] || "" : "",
    linkedPropertyId: showcase.linkedPropertyId,
    bullets: showcase.bullets.map((b) => b.trim()).filter(Boolean),
  });

  const buildWhyUsPayload = () => whyUs;

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
      showcase: generateShowcaseFile(buildShowcasePayload()),
      whyUs: generateWhyUsFile(buildWhyUsPayload()),
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

  // Real phone photos — and, it turns out, Mac screenshots the admin drops
  // in for property photos — routinely run several MB each. A listing with
  // a dozen of them would blow past the deploy request's size limit (Vercel
  // returns a 413) once base64-inlined. Downscale to a sane web display size
  // before upload; skip anything already small, and fall back to the
  // original file if the browser can't decode it rather than fail.
  //
  // PNG is re-encoded as JPEG by default: canvas.toBlob ignores the quality
  // setting for PNG (lossless), so a busy screenshot stays multi-MB no
  // matter the resize — only the logo needs `keepPng` to preserve transparency.
  const compressImageFile = async (file, { maxDimension = 1920, quality = 0.82, keepPng = false } = {}) => {
    if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
    if (file.size < 300_000) return file;
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
      const width = Math.round(bitmap.width * scale);
      const height = Math.round(bitmap.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
      const mimeType = keepPng && file.type === "image/png" ? "image/png" : "image/jpeg";
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
      return blob || file;
    } catch {
      return file;
    }
  };

  // Every freshly-picked File across the whole form (logo, hero slideshow,
  // agent photos, property photos) — uploaded straight to Blob under this
  // site's uploads folder, bypassing the deploy request's body entirely (real
  // photos would otherwise blow well past Vercel's ~4.5MB body limit). The
  // deploy route fetches them back out of Blob by the same filename/site id.
  const uploadNewImages = async () => {
    const entries = [];
    if (logoImage?.file && !logoImage.removed) entries.push(logoImage);
    entries.push(...heroImages.filter((img) => img.file && !img.removed));
    if (showcaseImage?.file && !showcaseImage.removed) entries.push(showcaseImage);
    if (showcaseAgentImage?.file && !showcaseAgentImage.removed) entries.push(showcaseAgentImage);
    for (const a of agents) {
      if (a.photoFile) entries.push({ id: a.id, file: a.photoFile });
    }
    for (const p of properties) {
      entries.push(...p.images.filter((img) => img.file && !img.removed));
    }
    await Promise.all(
      entries.map(async (img) => {
        const compressed = await compressImageFile(img.file, { keepPng: img === logoImage });
        await upload(`sites/${effectiveSiteId}/uploads/${storageFilename(img)}`, compressed, {
          access: "private",
          handleUploadUrl: "/api/upload-image",
          contentType: compressed.type || img.file.type,
        });
      })
    );
  };

  const handleDeploy = async () => {
    const valid = runValidation();
    if (!valid) return;

    setDeploying(true);
    setDeployResult(null);
    try {
      await uploadNewImages();
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
          showcase: buildShowcasePayload(),
          whyUs: buildWhyUsPayload(),
          siteId: effectiveSiteId,
          projectName: existingProjectName || undefined,
          projectSlug: existingProjectName ? undefined : projectSlug,
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
      !errors.faq.every(isEmpty) ||
      !isEmpty(errors.showcase) ||
      !isEmpty(errors.whyUs) ||
      !errors.whyUsCards.every(isEmpty));

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
        <div className="rounded-2xl border-2 border-[var(--color-accent2)] bg-[var(--color-background)] p-5">
          <p className="text-sm text-[var(--color-main)]/70">
            כל הפניות מהאתר (הטופס הכללי שבתחתית האתר, וטפסי &quot;מעוניינים בנכס&quot; שבעמודי הנכסים והסוכנים)
            נפתחות כהודעת וואטסאפ מוכנה מהמבקר עצמו — לסוכן הרלוונטי אם יש, ואם לא, למספר הוואטסאפ הכללי
            שמוזן למטה. אין צורך בכתובת אימייל לקבלת פניות.
          </p>
        </div>
        {!siteId && (
          <TextField
            label="כתובת האתר (באנגלית, לניהול מסודר ב-Vercel)"
            placeholder="לדוגמה: nadlan-com — האתר יעלה לכתובת nadlan-com.vercel.app"
            value={projectSlug}
            onChange={setProjectSlug}
          />
        )}
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
            label="וואטסאפ (מספר ישראלי רגיל, לדוגמה 0501234567 — אין צורך בקידומת מדינה)"
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
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-[var(--color-main)]/80">לוגו (אופציונלי)</span>
          {logoImage && (
            <div className="mb-3 w-24">
              <ImageTile
                src={logoImage.previewUrl}
                removed={logoImage.removed}
                onToggleRemove={toggleLogoRemoved}
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setLogoFile(e.target.files?.[0]);
              e.target.value = "";
            }}
            className="w-full rounded-xl border border-dashed border-[var(--color-main)]/25 bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none file:ml-3 file:rounded-full file:border-0 file:bg-[var(--color-accent2)] file:px-4 file:py-1.5 file:text-xs file:font-bold file:text-white"
          />
        </div>
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-[var(--color-main)]/80">
            תמונות לסליידשואו בעמוד הבית (ניתן לבחור כמה) <span className="text-red-500">*</span>
          </span>
          {heroImages.length > 0 && (
            <div className="mb-4">
              <SortableImageGrid
                images={heroImages}
                onToggleRemove={toggleHeroImage}
                onReorder={reorderHeroImages}
                columns="grid-cols-4"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              addHeroImages(e.target.files);
              e.target.value = "";
            }}
            className="w-full rounded-xl border border-dashed border-[var(--color-main)]/25 bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none file:ml-3 file:rounded-full file:border-0 file:bg-[var(--color-accent2)] file:px-4 file:py-1.5 file:text-xs file:font-bold file:text-white"
          />
          {errors?.agency.heroImageFilenames && (
            <p className="mt-1 text-xs font-medium text-red-500">{errors.agency.heroImageFilenames}</p>
          )}
        </div>
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
          value={brandStory.yearsInBusiness}
          onChange={(v) => setBrandStory({ ...brandStory, yearsInBusiness: v })}
          error={errors?.brandStory.yearsInBusiness}
        />
        <TextAreaField
          label="מה מייחד אתכם?"
          value={brandStory.whatMakesSpecial}
          onChange={(v) => setBrandStory({ ...brandStory, whatMakesSpecial: v })}
          error={errors?.brandStory.whatMakesSpecial}
        />
        <TextAreaField
          label="באילו אזורים אתם פועלים?"
          value={brandStory.areas}
          onChange={(v) => setBrandStory({ ...brandStory, areas: v })}
          error={errors?.brandStory.areas}
        />
        <TextAreaField
          label="מהי הגישה והערכים שלכם?"
          value={brandStory.approach}
          onChange={(v) => setBrandStory({ ...brandStory, approach: v })}
          error={errors?.brandStory.approach}
        />
        <TextAreaField
          label="אודותינו למסך ראשי (לא עמוד של אודותינו) — כתבו במילים שלכם, ה-AI ישפר וירחיב מעט"
          placeholder="לדוגמה: אני מאמין שכל לקוח מגיע עם חלום, והתפקיד שלי הוא להפוך אותו למציאות."
          value={brandStory.personalQuote}
          onChange={(v) => setBrandStory({ ...brandStory, personalQuote: v })}
          error={errors?.brandStory.personalQuote}
        />
        <p className="text-xs text-[var(--color-main)]/50">
          השדה הזה שונה מהשדות שמעליו: הוא מיועד לעמוד הבית בלבד (לא לעמוד האודותינו), ומוצג שם מתחת לתמונה, לשם
          ולתפקיד של בעל העסק, בסעיף &quot;אודותינו&quot; שבעמוד הבית. שנות הניסיון שיוזנו עבור בעל העסק (הסוכן הראשון
          ברשימת הסוכנים למטה) יופיעו שם אוטומטית — אין צורך להזין אותן שוב.
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
                value={agent.name}
                onChange={(v) => setAgents(agents.map((a) => (a.id === agent.id ? { ...a, name: v } : a)))}
                error={errors?.agents[i]?.name}
              />
              <TextField
                label="תפקיד"
                value={agent.role}
                onChange={(v) => setAgents(agents.map((a) => (a.id === agent.id ? { ...a, role: v } : a)))}
                error={errors?.agents[i]?.role}
              />
              <TextField
                label="טלפון"
                value={agent.phone}
                onChange={(v) =>
                  setAgents(agents.map((a) => (a.id === agent.id ? { ...a, phone: v, whatsapp: a.whatsapp || v } : a)))
                }
                error={errors?.agents[i]?.phone}
              />
              <TextField
                label="אימייל"
                value={agent.email}
                onChange={(v) => setAgents(agents.map((a) => (a.id === agent.id ? { ...a, email: v } : a)))}
                error={errors?.agents[i]?.email}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-[var(--color-main)]/80">
                {`תמונת פרופיל${i === 0 ? " (הראשון ברשימה מוצג כבעל העסק בעמוד הבית)" : ""}`}
              </span>
              {agent.photoPreviewUrl && (
                <div className="mb-3 w-24">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={agent.photoPreviewUrl}
                    alt=""
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  setAgents(
                    agents.map((a) =>
                      a.id === agent.id
                        ? {
                            ...a,
                            photoFile: file,
                            photoPreviewUrl: URL.createObjectURL(file),
                            photoFilename: filenameForUpload(a.id, file),
                          }
                        : a
                    )
                  );
                }}
                className="w-full rounded-xl border border-dashed border-[var(--color-main)]/25 bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none file:ml-3 file:rounded-full file:border-0 file:bg-[var(--color-accent2)] file:px-4 file:py-1.5 file:text-xs file:font-bold file:text-white"
              />
              {errors?.agents[i]?.photoFilename && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.agents[i].photoFilename}</p>
              )}
            </div>
            <TextAreaField
              label="קצת על הסוכן/ת (מוצג כציטוט בעמוד הפרופיל האישי של הסוכן/ת הזה בלבד — שדה נפרד לגמרי מהאודות ומהציטוט למסך הראשי, גם עבור בעל העסק)"
              placeholder="לדוגמה: כמה שנות ניסיון בתחום, רקע מקצועי, התמחויות והישגים בולטים... (השאירו ריק כדי להשתמש בטקסט לדוגמה)"
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
              {
      id: nextId("agent"),
      name: "",
      role: "",
      photoFilename: "",
      photoFile: null,
      photoPreviewUrl: "",
      phone: "",
      whatsapp: "",
      email: "",
      bio: "",
      yearsOfExperience: "",
    },
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
                label="כתובת"
                required
                placeholder="לדוגמה: רוטשילד 15"
                value={property.address}
                onChange={(v) => setProperties(properties.map((p) => (p.id === property.id ? { ...p, address: v } : p)))}
                error={errors?.properties[i]?.address}
              />
              <ComboboxField
                label="עיר"
                required
                placeholder="הקלידו לחיפוש עיר..."
                value={property.city}
                options={israelCities}
                onChange={(v) =>
                  setProperties(
                    properties.map((p) => (p.id === property.id ? { ...p, city: v, neighborhood: "" } : p))
                  )
                }
                error={errors?.properties[i]?.city}
              />
              <ComboboxField
                label="שכונה"
                required
                disabled={!property.city}
                placeholder={property.city ? "הקלידו לחיפוש שכונה..." : "יש לבחור עיר קודם"}
                value={property.neighborhood}
                options={getNeighborhoodsForCity(property.city)}
                onChange={(v) =>
                  setProperties(properties.map((p) => (p.id === property.id ? { ...p, neighborhood: v } : p)))
                }
                error={errors?.properties[i]?.neighborhood}
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
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-[var(--color-main)]/80">
                מאפייני הנכס (אופציונלי) — כל מאפיין יוצג כנקודה נפרדת ברשימה באתר
              </span>
              <div className="space-y-2">
                {property.features.map((feature, fi) => (
                  <div key={fi} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feature}
                      placeholder="לדוגמה: מרפסת שמש"
                      onChange={(e) =>
                        setProperties(
                          properties.map((p) =>
                            p.id === property.id
                              ? { ...p, features: p.features.map((f, idx) => (idx === fi ? e.target.value : f)) }
                              : p
                          )
                        )
                      }
                      className="flex-1 rounded-xl border border-[var(--color-main)]/15 bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent2)]"
                    />
                    {property.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setProperties(
                            properties.map((p) =>
                              p.id === property.id
                                ? { ...p, features: p.features.filter((_, idx) => idx !== fi) }
                                : p
                            )
                          )
                        }
                        className="text-sm font-medium text-red-600"
                      >
                        הסר
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setProperties(
                    properties.map((p) => (p.id === property.id ? { ...p, features: [...p.features, ""] } : p))
                  )
                }
                className="mt-3 rounded-full border-2 border-[var(--color-main)]/20 px-6 py-2.5 text-sm font-bold transition hover:bg-[var(--color-background)]"
              >
                + הוסף מאפיין
              </button>
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-[var(--color-main)]/80">
                תמונות הנכס <span className="text-red-500">*</span>
              </span>

              {property.images.length > 0 && (
                <div className="mb-4">
                  <SortableImageGrid
                    images={property.images}
                    onToggleRemove={(imgId) => togglePropertyImage(property.id, imgId)}
                    onReorder={(draggedId, targetId) => reorderPropertyImages(property.id, draggedId, targetId)}
                  />
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
                address: "",
                city: "",
                neighborhood: "",
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

      <SectionCard title="למה עובדים איתנו" description="אופציונלי — כותרת + בדיוק 6 כרטיסים (כותרת ותיאור לכל אחד). מוצג בעמוד הבית בין 'השכונות המבוקשות שלנו' לבין 'שאלות ותשובות'. השאירו ריק כדי להשתמש בתוכן ברירת המחדל של התבנית.">
        <TextField
          label="כותרת הסקשן"
          placeholder="לדוגמה: למה בעלי דירות עובדים איתנו"
          value={whyUs.heading}
          onChange={(v) => setWhyUs({ ...whyUs, heading: v })}
          error={errors?.whyUs.heading}
        />
        {whyUs.cards.map((card, i) => (
          <div key={i} className="grid gap-4 rounded-xl border border-[var(--color-main)]/10 p-5 sm:grid-cols-2">
            <TextField
              label={`כרטיס ${i + 1} — כותרת`}
              value={card.title}
              onChange={(v) =>
                setWhyUs({
                  ...whyUs,
                  cards: whyUs.cards.map((c, idx) => (idx === i ? { ...c, title: v } : c)),
                })
              }
              error={errors?.whyUsCards[i]?.title}
            />
            <TextField
              label={`כרטיס ${i + 1} — תיאור`}
              value={card.description}
              onChange={(v) =>
                setWhyUs({
                  ...whyUs,
                  cards: whyUs.cards.map((c, idx) => (idx === i ? { ...c, description: v } : c)),
                })
              }
              error={errors?.whyUsCards[i]?.description}
            />
          </div>
        ))}
      </SectionCard>

      <SectionCard title="שאלות ותשובות" description="אופציונלי — השאירו ריק כדי להשתמש בשאלות ברירת המחדל של התבנית">
        {faq.map((item, i) => (
          <div key={i} className="space-y-4 rounded-xl border border-[var(--color-main)]/10 p-5">
            <TextField
              label="שאלה"
              value={item.question}
              onChange={(v) => setFaq(faq.map((f, idx) => (idx === i ? { ...f, question: v } : f)))}
              error={errors?.faq[i]?.question}
            />
            <TextAreaField
              label="תשובה"
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

      <SectionCard
        title="נתונים / סטטיסטיקות"
        description="אופציונלי — בחרו אייקון מוכן או הוסיפו משלכם. אם תשאירו את הסעיף הזה ריק לגמרי, יוצגו באתר 6 הנתונים לדוגמה של התבנית (עם אייקוני התבנית), בצבע אדום."
      >
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

      <SectionCard
        title="פרויקט מיוחד להצגה"
        description="אופציונלי — חלון קופץ שמופיע 3 שניות אחרי כניסה לאתר, עם תמונת פרויקט גדולה, שם ותיאור, פרטי הסוכן, ורשימת מאפיינים בפס לבן בתחתית. אם תשאירו את הסעיף הזה ריק (בלי תמונה ובלי שם פרויקט), החלון פשוט לא יופיע באתר."
      >
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-[var(--color-main)]/80">תמונת הפרויקט</span>
          {showcaseImage && (
            <div className="mb-3 w-32">
              <ImageTile
                src={showcaseImage.previewUrl}
                removed={showcaseImage.removed}
                onToggleRemove={toggleShowcaseImageRemoved}
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setShowcaseImageFile(e.target.files?.[0]);
              e.target.value = "";
            }}
            className="w-full rounded-xl border border-dashed border-[var(--color-main)]/25 bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none file:ml-3 file:rounded-full file:border-0 file:bg-[var(--color-accent2)] file:px-4 file:py-1.5 file:text-xs file:font-bold file:text-white"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="שם הפרויקט"
            value={showcase.projectName}
            onChange={(v) => setShowcase({ ...showcase, projectName: v })}
          />
          <TextField
            label="שם הסוכן/ת"
            value={showcase.agentName}
            onChange={(v) => setShowcase({ ...showcase, agentName: v })}
          />
        </div>
        <TextAreaField
          label="תיאור הפרויקט"
          rows={2}
          value={showcase.description}
          onChange={(v) => setShowcase({ ...showcase, description: v })}
        />
        <TextField
          label="טלפון הסוכן/ת"
          placeholder="לדוגמה: 054-6848641"
          value={showcase.agentPhone}
          onChange={(v) => setShowcase({ ...showcase, agentPhone: v })}
          error={errors?.showcase.agentPhone}
        />
        <SelectField
          label="קישור לנכס (אופציונלי) — מציג בחלון כפתור 'מידע נוסף' שמוביל לעמוד הנכס שנבחר"
          value={showcase.linkedPropertyId}
          onChange={(v) => setShowcase({ ...showcase, linkedPropertyId: v })}
          options={[
            { value: "", label: "ללא קישור" },
            ...properties.filter((p) => p.title.trim()).map((p) => ({ value: p.id, label: p.title })),
          ]}
        />

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-[var(--color-main)]/80">תמונת הסוכן/ת</span>
          {showcaseAgentImage?.previewUrl && (
            <div className="mb-3 w-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={showcaseAgentImage.previewUrl}
                alt=""
                className={`aspect-square w-full rounded-full object-cover ${
                  showcaseAgentImage.removed ? "grayscale opacity-40" : ""
                }`}
              />
              <button
                type="button"
                onClick={toggleShowcaseAgentImageRemoved}
                className="mt-1 text-xs font-medium text-red-600"
              >
                {showcaseAgentImage.removed ? "שחזר" : "הסר תמונה"}
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setShowcaseAgentImageFile(e.target.files?.[0]);
              e.target.value = "";
            }}
            className="w-full rounded-xl border border-dashed border-[var(--color-main)]/25 bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none file:ml-3 file:rounded-full file:border-0 file:bg-[var(--color-accent2)] file:px-4 file:py-1.5 file:text-xs file:font-bold file:text-white"
          />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-[var(--color-main)]/80">
            מאפייני הפרויקט (בולטים בפס הלבן בתחתית החלון) — מקסימום 6
          </span>
          <div className="space-y-2">
            {showcase.bullets.map((bullet, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={bullet}
                  placeholder="לדוגמה: בריכה פרטית מחוממת"
                  onChange={(e) => updateShowcaseBullet(i, e.target.value)}
                  className="flex-1 rounded-xl border border-[var(--color-main)]/15 bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent2)]"
                />
                <button
                  type="button"
                  onClick={() => removeShowcaseBullet(i)}
                  className="text-sm font-medium text-red-600"
                >
                  הסר
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addShowcaseBullet}
            disabled={showcase.bullets.length >= 6}
            className="mt-3 rounded-full border-2 border-[var(--color-main)]/20 px-6 py-2.5 text-sm font-bold transition hover:bg-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {showcase.bullets.length >= 6 ? "הגעתם למקסימום (6)" : "+ הוסף מאפיין"}
          </button>
        </div>
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
          <CodeOutput filename="src/data/showcase.js" content={output.showcase} />
          <CodeOutput filename="src/data/whyUs.js" content={output.whyUs} />
        </SectionCard>
      )}
    </div>
  );
}
