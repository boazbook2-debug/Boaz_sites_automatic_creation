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
  },
  {
    id: "agent-2",
    name: "בועז",
    role: "סוכנת נדל״ן בכירה",
    photo: unsplash("1573497019940-1c28c88b4f3e", 800),
    phone: "054-6848641",
    whatsapp: "972546848641",
    email: "boazbook2@gmail.com",
  },
  {
    id: "agent-3",
    name: "בועז",
    role: "סוכן נדל״ן",
    photo: unsplash("1560250097-0b93528c311a", 800),
    phone: "054-6848641",
    whatsapp: "972546848641",
    email: "boazbook2@gmail.com",
  },
];

export default agents;
