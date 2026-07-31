import { unsplash } from "@/lib/images";

// Per-client team roster. Add or remove agents freely — every component that
// renders agents (agent cards, property detail contact card, the /agents page)
// maps over this array and needs no code changes when it grows or shrinks.
const agents = [
  {
    id: "agent-1",
    name: "בועז",
    role: "מייסד ומנכ״ל",
    photo: "/uploads/agency-owner.png",
    phone: "054-6848641",
    whatsapp: "972546848641",
    email: "boazbook2@gmail.com",
    bio: "אני בתחום הנדל״ן כבר למעלה מ-15 שנה, ובמהלך הדרך ליוויתי מאות משפחות ברכישה ובמכירה של הבית שלהן. התמחיתי בנכסי יוקרה ובעסקאות מורכבות, ותמיד שם דגש על שקיפות מלאה וליווי אישי מהפגישה הראשונה ועד למסירת המפתח.",
  },
  {
    id: "agent-2",
    name: "בועז",
    role: "סוכנת נדל״ן בכירה",
    photo: unsplash("1573497019940-1c28c88b4f3e", 800),
    phone: "054-6848641",
    whatsapp: "972546848641",
    email: "boazbook2@gmail.com",
    bio: "אני עובדת בתחום התיווך כבר 8 שנים, עם התמחות מיוחדת בבתים פרטיים ובווילות באזור השרון. אני מאמינה שכל עסקה מתחילה בהקשבה אמיתית לצרכים של הלקוח, ולכן אני משקיעה זמן בהבנת מה שחשוב לכם לפני שאני ממליצה על נכס.",
  },
  {
    id: "agent-3",
    name: "בועז",
    role: "סוכן נדל״ן",
    photo: unsplash("1560250097-0b93528c311a", 800),
    phone: "054-6848641",
    whatsapp: "972546848641",
    email: "boazbook2@gmail.com",
    bio: "הצטרפתי לתחום הנדל״ן לפני 5 שנים אחרי קריירה בייעוץ עסקי, וזה שילוב שעוזר לי לנתח כל עסקה גם מהצד הפיננסי וגם מהצד האנושי. מתמחה בדירות להשקעה ובליווי רוכשי דירה ראשונה.",
  },
];

export default agents;
