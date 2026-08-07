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

// Falls back to this generic copy whenever an agency skips the "why work
// with us" section in the questionnaire — every site should show something
// there rather than silently omitting the whole section.
const DEFAULT_WHY_US = {
  heading: "למה לקוחות בוחרים לעבוד איתנו",
  cards: [
    {
      title: "ליווי אישי מקצה לקצה",
      description: "אתם עובדים מול אדם אחד שמכיר את התיק שלכם לעומק — מהפגישה הראשונה ועד למסירת המפתח.",
    },
    {
      title: "היכרות עמוקה עם השוק המקומי",
      description: "שנים של ניסיון באזור מאפשרות לנו לתמחר נכון ולזהות הזדמנויות שרוב הסוכנים מפספסים.",
    },
    {
      title: "שקיפות מלאה לאורך התהליך",
      description: "אתם יודעים בכל שלב מה קורה, מה המצב מול קונים או שוכרים, ואילו צעדים הבאים בתור.",
    },
    {
      title: "רשת קשרים איכותית",
      description: "גישה לרשת רחבה של קונים, שוכרים ואנשי מקצוע מהתחום, שמזרזת את התהליך ומשפרת את התוצאה.",
    },
    {
      title: "משא ומתן שמייצג אתכם",
      description: "אנחנו נלחמים על התנאים הטובים ביותר עבורכם, לא מתפשרים על הראשון שמגיע.",
    },
    {
      title: "זמינות אמיתית",
      description: "מענה מהיר לשאלות ולעדכונים — גם בערב, גם בסוף שבוע — כי החלטות בנדל״ן לא מחכות.",
    },
  ],
};

export function generateAgencyFile(form) {
  return `import { unsplash } from "@/lib/images";

const agency = {
  name: ${jsString(form.name)},
  logo: ${form.logoFilename ? jsString(`/uploads/${form.logoFilename}`) : "null"},
  tagline: ${jsString(form.tagline)},
  aboutText: ${jsString(form.aboutText)},
  aboutTextPlaceholder: ${form.aboutTextPlaceholder ? "true" : "false"},
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
  demoDisclaimer: ${form.demoDisclaimer ? jsString(form.demoDisclaimer) : "null"},
  demoAccessCode: ${form.demoAccessCode ? jsString(form.demoAccessCode) : "null"},
  noIndex: ${form.noIndex ? "true" : "false"},
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
    photo: ${jsString(a.photoFilename ? `/uploads/${a.photoFilename}` : a.photo || "")},
    phone: ${jsString(a.phone)},
    whatsapp: ${jsString(a.whatsapp)},
    email: ${jsString(a.email)},
    bio: ${jsString(a.bio)},
    bioPlaceholder: ${a.bioPlaceholder ? "true" : "false"},
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
    address: ${jsString(p.address)},
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

export function generateWhyUsFile(form) {
  const hasContent = form?.heading?.trim() && form.cards?.length === 6 && form.cards.every((c) => c.title?.trim() && c.description?.trim());
  const data = hasContent ? form : DEFAULT_WHY_US;
  return `const whyUs = {
  heading: ${jsString(data.heading)},
  cards: [
${data.cards
    .map(
      (c) => `    {
      title: ${jsString(c.title)},
      description: ${jsString(c.description)},
    },`
    )
    .join("\n")}
  ],
};

export default whyUs;
`;
}

export function generateShowcaseFile(form) {
  return `const showcase = {
  image: ${form.imageFilename ? jsString(`/uploads/${form.imageFilename}`) : "null"},
  projectName: ${jsString(form.projectName)},
  description: ${jsString(form.description)},
  agentName: ${jsString(form.agentName)},
  agentPhone: ${jsString(form.agentPhone)},
  agentImage: ${form.agentImageFilename ? jsString(`/uploads/${form.agentImageFilename}`) : "null"},
  linkedPropertyId: ${jsString(form.linkedPropertyId)},
  bullets: ${jsArray(form.bullets ?? [])},
};

export default showcase;
`;
}

export function generateStatsFile(stats) {
  return `const stats = [
${stats
    .map(
      (s) => `  {
    iconId: ${jsString(s.iconId)},
    value: ${jsString(s.value)},
    label: ${jsString(s.label)},
    placeholder: ${s.placeholder ? "true" : "false"},
  },`
    )
    .join("\n")}
];

export default stats;
`;
}
