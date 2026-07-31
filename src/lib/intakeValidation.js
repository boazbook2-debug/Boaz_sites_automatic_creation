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

export function validateBrandStory(brandStory) {
  const errors = {};
  if (!brandStory.yearsInBusiness.trim()) errors.yearsInBusiness = "שדה חובה";
  if (!brandStory.whatMakesSpecial.trim()) errors.whatMakesSpecial = "שדה חובה";
  if (!brandStory.areas.trim()) errors.areas = "שדה חובה";
  if (!brandStory.approach.trim()) errors.approach = "שדה חובה";
  return errors;
}

export function validateAgent(agent) {
  const errors = {};
  if (!agent.name.trim()) errors.name = "שדה חובה";
  if (!agent.role.trim()) errors.role = "שדה חובה";
  if (!agent.phone.trim()) errors.phone = "שדה חובה";
  if (!agent.email.trim()) errors.email = "שדה חובה";
  if (!agent.photoFilename) errors.photoFilename = "יש להעלות תמונה";
  return errors;
}

export function validateProperty(property) {
  const errors = {};
  if (!property.title.trim()) errors.title = "שדה חובה";
  if (!property.location.trim()) errors.location = "שדה חובה";
  if (!property.price || Number(property.price) <= 0) errors.price = "יש להזין מחיר תקין";
  if (!property.rooms || Number(property.rooms) <= 0) errors.rooms = "יש להזין מספר חדרים תקין";
  if (!property.type.trim()) errors.type = "שדה חובה";
  if (!property.status) errors.status = "שדה חובה";
  if (property.imageFilenames.length === 0) errors.imageFilenames = "יש להעלות לפחות תמונה אחת";
  return errors;
}

export function validateFaqItem(item) {
  const errors = {};
  if (!item.question.trim()) errors.question = "שדה חובה";
  if (!item.answer.trim()) errors.answer = "שדה חובה";
  return errors;
}

export function isEmpty(errors) {
  return Object.keys(errors).length === 0;
}
