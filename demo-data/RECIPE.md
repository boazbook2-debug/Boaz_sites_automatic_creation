# Demo-build recipe (internal reference — not shipped)

## Deploy payload (new site)
POST https://boaztemplatesite.vercel.app/api/deploy-site
Body: { agency, agents, properties, testimonials, faq, stats, showcase, whyUs, siteId, projectSlug }
- siteId: invent one, e.g. `site-<timestamp36>-<rand6>` (must be unique, used as Blob path prefix)
- projectSlug: english slug for the agency (e.g. "cohen-nadlan"), gets `.vercel.app` suffix
- No `projectName` field on create (only on updates)

## agency object required fields
name, logoFilename (or null), tagline, aboutText, aboutTextPlaceholder:false, ownerQuote (same as aboutText or a short real quote),
phone, whatsapp, email (can be empty string), address, facebookUrl, instagramUrl:"",
customSeoTerms: [2 short terms], colors: {"background":"#FFFFFF","surface":"#F4F4F5","main":"#141414","accent1":"#1B2A41","accent2":"#B08D57"},
heroImageFilenames: [2 of the property image filenames],
demoDisclaimer: "דמו עיצובי עצמאי – לא האתר הרשמי של המשרד",
demoAccessCode: "<random 6-digit string, unique>", noIndex: true

## agents[] required fields (one entry, the verified owner/lead agent)
id, name, role, photoFilename (verified real photo, uploaded), phone, whatsapp, email,
bio (from verified source only), bioPlaceholder:false, yearsOfExperience (or "")

## properties[] (1-2 verified properties)
id, title, address, location, price (Number), rooms (Number), type, status:"sale"|"rent",
features: [bullet list from verified source], imageFilenames: [3-10 uploaded filenames], assignedAgentId

## testimonials — ALWAYS these exact 5, verbatim, never invent new ones:
[
 {"id":"t1","name":"מיכל ורון שפירא","context":"רכשו וילה בסביון","text":"רועי ליווה אותנו לאורך כל התהליך בסבלנות ובמקצועיות יוצאת דופן. הוא הבין בדיוק מה חיפשנו והציג לנו רק נכסים רלוונטיים. תודה על השירות האישי! (דוגמא)","placeholder":true},
 {"id":"t2","name":"אלון גבאי","context":"השכיר דירה בפלורנטין","text":"תהליך מהיר, שקוף וללא הפתעות. איתמר היה זמין לכל שאלה וטיפל בכל הפרטים הקטנים כדי שההשכרה תעבור חלק. ממליץ בחום. (דוגמא)","placeholder":true},
 {"id":"t3","name":"דנה ועידו כרמי","context":"מכרו בית ברמת השרון","text":"מאיה הצליחה למכור את הבית שלנו במחיר מעולה תוך זמן קצר. הליווי היה מדויק, אדיב ומקצועי מהרגע הראשון ועד לחתימה. (דוגמא)","placeholder":true},
 {"id":"t4","name":"יעל אברמוב","context":"רכשה דירה ברוטשילד","text":"הרגשתי שהם באמת רוצים בטובתי ולא רק לסגור עסקה. קיבלתי המלצות כנות גם כשזה אומר לוותר על נכס שלא התאים לי. (דוגמא)","placeholder":true},
 {"id":"t5","name":"משפחת בן־דוד","context":"רכשו בית בהרצליה פיתוח","text":"צוות אלמור נכסים ליווה אותנו בתהליך רכישה מורכב עם המון סבלנות והתעקש על השקיפות המלאה. תוצאה מעולה ובית חלומות. (דוגמא)","placeholder":true}
]

## faq (6, verbatim reuse from any existing site), stats (6, verbatim):
stats: 450+ properties sold/rented, ₪280M+ deal value, 15+ years, 6 cities, 300+ happy clients, 24/7 availability
(iconId: house, trending-up, award, map-pin, star, phone — placeholder:true on all)

## showcase / whyUs: pass {} (empty) unless data available

## Image upload (BEFORE deploy, from project dir so @vercel/blob resolves)
1. Download source image (curl / WebFetch), compress: `sips -Z 1400 -s format jpeg -s formatOptions 65 <src> --out <dest>.jpg` (logo: -Z 800, keep PNG if transparent)
2. Node script (run from /Applications/Website/real-estate-template):
```js
import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
const bytes = await readFile("<local file>");
await put(`sites/<SITE_ID>/uploads/<filename>`, bytes, {
  access: "private", token: process.env.BLOB_READ_WRITE_TOKEN,
  contentType: "image/jpeg", addRandomSuffix: false, allowOverwrite: true,
});
```
Run with: `set -a && source .env.local && set +a && node <script>.mjs`
3. Delete temp script after.

## Verification (mandatory before marking ready)
curl -s -o /dev/null -w "%{http_code}" <url>            → must be 200
curl -s <url> | grep -c "<agency name>"                  → must be 0 (gate blocks pre-auth)
curl -s "<url>/?key=<code>" | grep -c "<agency name>"     → must be non-zero

## Non-negotiable
- Never invent agency/agent/property facts — skip prospect if data can't be verified from their own FB/Yad2/site.
- Never mix images/data between prospects — worst failure mode.
- Never use facial recognition / unlabeled photos for agent identity — source must explicitly name the person next to the image.
- Always the 5 tagged testimonials above, verbatim — never invent new ones.
- Skip and move on if agent photo or usable property (3+ real photos) can't be verified in a reasonable number of attempts.
