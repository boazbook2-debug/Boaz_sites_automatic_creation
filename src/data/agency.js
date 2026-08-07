import { unsplash } from "@/lib/images";

// Per-client brand & contact configuration.
// Rebranding for a new agency means editing ONLY this file (plus agents.js, properties.js)
// and swapping the logo asset — no component should ever hardcode agency-specific text.
const agency = {
  name: "בועז נדל״ן",
  logo: null, // set to an image path (e.g. "/logo.png") to replace the text wordmark in the header/footer
  tagline: "נדל״ן יוקרתי בגישה אישית, ליווי מקצועי ואמון שנבנה עסקה אחר עסקה",
  aboutText:
    "בועז נדל״ן הוא משרד תיווך בוטיק הפועל בלב גוש דן ובערי השרון מזה למעלה מחמש עשרה שנה. אנחנו מאמינים שרכישת בית או השכרתו היא אחת ההחלטות המשמעותיות בחיים, ולכן אנו מלווים כל לקוח באופן אישי, לאורך כל התהליך – מהאיתור הראשוני ועד למסירת המפתח. הצוות שלנו משלב היכרות מעמיקה עם השוק המקומי, רשת קשרים ענפה ורגישות אמיתית לצרכים של כל משפחה ומשפחה. אנו פועלים בשקיפות מלאה, במקצועיות ובדיסקרטיות, ורואים בכל עסקה הזדמנות לבנות מערכת יחסים ארוכת טווח מבוססת אמון.",
  aboutTextPlaceholder: false,
  ownerQuote:
    "התחלתי את הדרך שלי בתחום מתוך אהבה אמיתית לבתים ולסיפורים שמאחוריהם. כל משפחה שאני פוגש מלמדת אותי משהו חדש, ואני מתייחס לכל עסקה כאילו הייתי הלקוח שלי. המטרה שלי היא פשוטה: שתרגישו בטוחים, מלווים ובראש שקט מהרגע הראשון ועד למסירת המפתח.",
  phone: "054-6848641",
  whatsapp: "972546848641",
  email: "boazbook2@gmail.com",
  address: "רחוב ארבי נחל 9, מודיעין מכבים רעות",
  facebookUrl: "https://facebook.com/almornechasim",
  instagramUrl: "https://instagram.com/almornechasim",
  customSeoTerms: [],
  colors: {
    background: "#FBF9F6",
    surface: "#F5F0E8",
    main: "#1C1A16",
    accent1: "#1B2A41",
    accent2: "#B08D57",
  },
  heroImages: [
    unsplash("1600596542815-ffad4c1539a9", 2000),
    unsplash("1580587771525-78b9dba3b914", 2000),
    unsplash("1600047509807-ba8f99d2cdde", 2000),
    unsplash("1583608205776-bfd35f0d9f83", 2000),
  ],
};

export default agency;
