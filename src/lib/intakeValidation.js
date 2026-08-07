// Validation for the intake forms. Only fields that a real business can
// always realistically supply are required — logo, social links, and
// testimonials stay optional since a brand-new client won't have them yet.

export function validateAgency(agency) {
  const errors = {};
  if (!agency.name.trim()) errors.name = "שדה חובה";
  if (!agency.tagline.trim()) errors.tagline = "שדה חובה";
  if (!agency.phone.trim()) errors.phone = "שדה חובה";
  if (!agency.whatsapp.trim()) errors.whatsapp = "שדה חובה";
  if (!agency.email.trim()) errors.email = "שדה חובה";
  if (!agency.address.trim()) errors.address = "שדה חובה";
  if (agency.heroImageFilenames.length === 0) errors.heroImageFilenames = "יש להעלות לפחות תמונה אחת";
  return errors;
}

export function validateColors(colors) {
  const errors = {};
  const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  for (const key of ["background", "surface", "main", "accent1", "accent2"]) {
    if (!hexPattern.test(colors[key])) errors[key] = "קוד צבע לא תקין (לדוגמה: #B08D57)";
  }
  return errors;
}

// Optional — left blank, the AI-generated about paragraph falls back to the
// template's own default copy instead of blocking submission (see
// isAboutTextPlaceholderTriggered in IntakeForm.jsx).
export function validateBrandStory() {
  return {};
}

// Optional — any blank field falls back to sensible defaults (agency phone/
// email for contact, a demo bio/photo) instead of blocking submission (see
// buildAgentsPayload in IntakeForm.jsx).
export function validateAgent() {
  return {};
}

export function validateProperty(property) {
  const errors = {};
  if (!property.title.trim()) errors.title = "שדה חובה";
  if (!property.address.trim()) errors.address = "שדה חובה";
  if (!property.city.trim()) errors.city = "יש לבחור עיר מהרשימה";
  if (!property.neighborhood.trim()) errors.neighborhood = "יש לבחור שכונה מהרשימה";
  if (!property.price || Number(property.price) <= 0) errors.price = "יש להזין מחיר תקין";
  if (!property.rooms || Number(property.rooms) <= 0) errors.rooms = "יש להזין מספר חדרים תקין";
  if (!property.type.trim()) errors.type = "שדה חובה";
  if (!property.status) errors.status = "שדה חובה";
  if (property.imageFilenames.length === 0) errors.imageFilenames = "יש להעלות לפחות תמונה אחת";
  return errors;
}

// Optional — left blank, the default FAQ list ships instead (see
// buildFaqPayload in IntakeForm.jsx).
export function validateFaqItem() {
  return {};
}

// Whole section is optional (a site with no showcase project just renders
// nothing) — the only field ever checked is the phone format, and only once
// the admin has actually typed one in.
const phonePattern = /^0\d{1,2}-?\d{6,8}$/;

export function validateShowcase(showcase) {
  const errors = {};
  if (showcase.agentPhone.trim() && !phonePattern.test(showcase.agentPhone.trim().replace(/\s+/g, ""))) {
    errors.agentPhone = "מספר טלפון לא תקין (לדוגמה: 054-6848641)";
  }
  return errors;
}

// Optional — anything less than a complete heading + 6 filled cards falls
// back to the template's default "why work with us" content instead of
// blocking submission (see generateWhyUsFile in generateDataFiles.js).
export function validateWhyUs() {
  return {};
}

export function validateWhyUsCard() {
  return {};
}

export function isEmpty(errors) {
  return Object.keys(errors).length === 0;
}
