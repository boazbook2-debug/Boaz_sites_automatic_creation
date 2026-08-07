import { unsplash } from "@/lib/images";

// Per-client "special showcase project" popup — appears 3s after the site
// loads (see src/components/ShowcasePopup.jsx). Optional: if `image` or
// `projectName` is empty, the popup renders nothing. This file's demo
// content is what the template preview itself shows; every real deployed
// site regenerates this file from its own intake form answers, starting
// blank until the admin fills the section in.
const showcase = {
  image: unsplash("1512917774080-9991f1c4c750"),
  projectName: "וילה מודרנית עם בריכה בסביון",
  description: "בית יוקרה פרטי בלב סביון — פרטיות מלאה, בריכה משלכם ונוף פסטורלי.",
  agentName: "בועז",
  agentPhone: "054-6848641",
  agentImage: "/uploads/agency-owner.png",
  linkedPropertyId: "villa-savyon",
  bullets: [
    "בריכה פרטית מחוממת",
    "ממ״ד",
    "חדר הורים אקסקלוסיבי עם חדר ארונות",
    "מטבח שף מאובזר ואי מרכזי",
    "חניה מקורה ל-3 רכבים",
  ],
};

export default showcase;
