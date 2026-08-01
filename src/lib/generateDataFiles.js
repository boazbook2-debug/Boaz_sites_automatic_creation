// Turns the intake form's state into ready-to-paste source for the six
// src/data/*.js files, matching their real schemas exactly. Image fields
// hold the /uploads/<filename> path the agency owner is told to copy the
// actual file to — this template has no backend/storage, so the generated
// code and the asset placement are handed back to a person to finish.

function jsString(value) {
  return JSON.stringify(value ?? "");
}

function jsArray(values) {
  return `[${values.map((v) => jsString(v)).join(", ")}]`;
}

export function generateAgencyFile(form) {
  return `import { unsplash } from "@/lib/images";

const agency = {
  name: ${jsString(form.name)},
  logo: ${form.logoFilename ? jsString(`/uploads/${form.logoFilename}`) : "null"},
  tagline: ${jsString(form.tagline)},
  aboutText: ${jsString(form.aboutText)},
  ownerQuote: ${jsString(form.ownerQuote)},
  phone: ${jsString(form.phone)},
  whatsapp: ${jsString(form.whatsapp)},
  email: ${jsString(form.email)},
  address: ${jsString(form.address)},
  facebookUrl: ${jsString(form.facebookUrl)},
  instagramUrl: ${jsString(form.instagramUrl)},
  customSeoTerms: ${jsArray(form.customSeoTerms ?? [])},
  colors: {
    background: ${jsString(form.colors.background)},
    surface: ${jsString(form.colors.surface)},
    main: ${jsString(form.colors.main)},
    accent1: ${jsString(form.colors.accent1)},
    accent2: ${jsString(form.colors.accent2)},
  },
  heroImages: [
${form.heroImageFilenames.map((f) => `    ${jsString(`/uploads/${f}`)},`).join("\n")}
  ],
};

export default agency;
`;
}

export function generateAgentsFile(agents) {
  return `const agents = [
${agents
  .map(
    (a) => `  {
    id: ${jsString(a.id)},
    name: ${jsString(a.name)},
    role: ${jsString(a.role)},
    photo: ${jsString(`/uploads/${a.photoFilename}`)},
    phone: ${jsString(a.phone)},
    whatsapp: ${jsString(a.whatsapp)},
    email: ${jsString(a.email)},
    bio: ${jsString(a.bio)},
    yearsOfExperience: ${jsString(a.yearsOfExperience)},
  },`
  )
  .join("\n")}
];

export default agents;
`;
}

export function generatePropertiesFile(properties) {
  return `const properties = [
${properties
  .map(
    (p) => `  {
    id: ${jsString(p.id)},
    title: ${jsString(p.title)},
    location: ${jsString(p.location)},
    price: ${Number(p.price) || 0},
    rooms: ${Number(p.rooms) || 0},
    type: ${jsString(p.type)},
    status: ${jsString(p.status)},
    features: ${jsArray(p.features)},
    images: ${jsArray(p.imageFilenames.map((f) => `/uploads/${f}`))},
    assignedAgentId: ${jsString(p.assignedAgentId)},
  },`
  )
  .join("\n")}
];

export default properties;
`;
}

export function generateTestimonialsFile(testimonials) {
  return `const testimonials = [
${testimonials
  .map(
    (t) => `  {
    id: ${jsString(t.id)},
    name: ${jsString(t.name)},
    context: ${jsString(t.context)},
    text: ${jsString(t.text)},
    placeholder: ${t.placeholder ? "true" : "false"},
  },`
  )
  .join("\n")}
];

export default testimonials;
`;
}

export function generateFaqFile(faq) {
  return `const faq = [
${faq
  .map(
    (f) => `  {
    question: ${jsString(f.question)},
    answer: ${jsString(f.answer)},
    placeholder: ${f.placeholder ? "true" : "false"},
  },`
  )
  .join("\n")}
];

export default faq;
`;
}

export function generateStatsFile(stats) {
  return `import { ${[...new Set(stats.map((s) => s.iconImport))].join(", ")} } from "@/components/Icons";

const stats = [
${stats.map((s) => `  { icon: ${s.iconImport}, value: ${jsString(s.value)}, label: ${jsString(s.label)} },`).join("\n")}
];

export default stats;
`;
}
