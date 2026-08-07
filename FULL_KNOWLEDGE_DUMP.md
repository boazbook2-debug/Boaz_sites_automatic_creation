# Full Knowledge Dump — Everything Known About This Project

Written for a fresh Claude Code session with zero prior memory. This is the
exhaustive version — read `SESSION_HANDOFF.md` first for the condensed
narrative if you want it, but this file is the authoritative, complete
reference. Where the two disagree, trust this file (it was written later,
with data re-verified live against the actual deployed sites).

---

## PART 1 — The template/generator project itself

### 1.1 Stack and location
- Repo: `/Applications/Website/real-estate-template`
- Next.js 16.2.12, App Router, Turbopack, React 19, Tailwind CSS v4
  (`@import "tailwindcss"`, `@theme inline` syntax).
- RTL Hebrew site (`<html dir="rtl">`), fonts: Heebo (sans, body) + Frank
  Ruhl Libre (serif, headings only) via `next/font/google`.
- Deployed to Vercel as project **boaztemplatesite**:
  `https://boaztemplatesite.vercel.app`. This is both (a) the live default/
  demo template site itself, and (b) the generator/admin backend that
  creates every client's site.
- Vercel Blob is used for two things: (1) storing each site's full JSON
  record (`sitesStore.js`, prefix `sites/<id>.json`), (2) storing every
  uploaded image (`siteImages.js`, `sites/<id>/uploads/<filename>`).
- `.env.local` holds `VERCEL_DEPLOY_TOKEN`, `BLOB_READ_WRITE_TOKEN`,
  `ANTHROPIC_API_KEY` (present but user said "I don't have a Claude API" —
  meaning they don't want to *use* AI-powered features that burn it, not
  that the key is literally absent — double check before assuming it's
  usable for anything), `RESEND_API_KEY` (unused, lead forms go to
  WhatsApp not email).

### 1.2 How the multi-tenant generator works end to end
1. Admin opens `/intake` on the boaztemplatesite deployment (or on any
   deployed client site — the intake route ships with every site).
   Landing page has 3 paths: "אדמין בלבד" (password `5659`, full
   create/edit any site), "הוספת נכס"/"עדכון נכס קיים" (client self-serve
   property add/edit, different login flow via `ClientLogin.jsx`).
2. Admin path → `AdminDashboard` (`IntakeFlow.jsx`) lists all sites via
   `GET /api/sites`, each tile shows agency name + liveUrl, has a delete
   (🗑️) button that navigates to a password-gated `DeleteConfirm` screen
   before calling `DELETE /api/sites/<id>`.
3. Selecting "create new" or an existing site loads `IntakeForm.jsx` (huge
   file, ~1700+ lines) — a giant controlled form covering:
   - **Agency**: name, tagline, phone, whatsapp, email, address, facebook/
     instagram URLs, logo upload, hero image carousel uploads (reorderable
     via `SortableImageGrid`), brand colors (5 hex fields), custom SEO
     terms. Also (new) an English `projectSlug` field (new sites only) so
     the Vercel project name is human-chosen instead of auto-slugified.
   - **Brand story** (4 fields: years in business, what makes you special,
     areas, approach, + a "personal quote" field) — feeds an AI-generation
     button (`/api/generate-about`, uses `ANTHROPIC_API_KEY` if present,
     else a template-string fallback) that produces `aboutText` (for
     `/about` page) and `ownerQuote` (homepage). All now optional — typing
     "x" or leaving blank swaps in the template's own default about text
     (flagged `aboutTextPlaceholder: true`, though the red-text visual
     distinction for this was removed earlier per user request — it now
     renders as normal-colored text).
   - **Agents**: repeatable list, each with name/role/phone/whatsapp/
     email/bio/years-experience/photo upload. First agent in the list is
     treated as "the owner" and shown in the homepage About section.
     All fields optional now — blanks fall back to the agency's own phone/
     email for contact fields, a generic role/bio from the template's own
     default agent roster (cycled by position) for role/bio, and a stock
     headshot (never agent-1's real photo, which is this template's own
     real owner) for a blank photo.
   - **Properties**: repeatable, title/address/city/neighborhood (city/
     neighborhood pickers from `data/israelLocations.js`)/price/rooms/
     type/status(sale|rent)/features list/image gallery. Still required —
     no fallback, a client must supply at least the core property fields.
   - **Testimonials**: repeatable name/context/text. Optional — the "x"-
     trigger-on-single-blank-entry convention swaps in the template's own
     5 default testimonials (flagged `placeholder: true`).
   - **FAQ**: repeatable question/answer. Optional, same x-trigger swap
     pattern, defaults to template's 6 default FAQ items.
   - **Stats**: homepage stat tiles (icon/value/label), auto-matches an
     icon from `iconRegistry.js` based on label/value text if not manually
     picked. Optional, defaults to template's 6 stats.
   - **Showcase**: an optional "featured project" popup
     (`ShowcasePopup.jsx`) shown once per visitor session — project name/
     description/image/linked-agent/linked-property/bullets.
   - **Why Us**: heading + exactly 6 title/description cards, shown
     between "Areas We Cover" and FAQ on the homepage. Optional — any
     incomplete submission (blank heading, or not exactly 6 fully-filled
     cards) falls back to `DEFAULT_WHY_US` (hardcoded in
     `generateDataFiles.js`), so the section always renders something.
4. Submitting (button: "צור אתר חי" for new, "עדכן שינויים" for existing)
   calls `handleDeploy()`:
   - `uploadNewImages()` — compresses (canvas resize, JPEG re-encode
     except PNG logos which need transparency) and uploads every new File
     object directly to Blob client-side (bypasses the 4.5MB deploy-route
     body limit that real photos would otherwise blow past).
   - `POST /api/deploy-site` with the full JSON payload: `agency, agents,
     properties, testimonials, faq, stats, showcase, whyUs, siteId,
     projectName (if editing existing), projectSlug (if new + provided),
     createdAt (if editing)`.
5. `/api/deploy-site/route.js` server-side:
   - `collectTemplateFiles(process.cwd())` — walks `src/` and `public/`
     (excluding `node_modules, .next, .git, .vercel, uploads`) reading
     every file off the *currently running* boaztemplatesite deployment's
     own disk, base64-encoding binaries. This means: **whatever code is
     currently live on boaztemplatesite is exactly what gets bundled into
     every new client deploy** — there is no separate "template source of
     truth" repo checked out per deploy; the generator IS the template.
   - Regenerates `src/data/{agency,agents,properties,testimonials,faq,
     stats,showcase,whyUs,siteConfig}.js` from the submitted form via
     `generateDataFiles.js`'s `generate*File()` functions (these files are
     excluded from the `collectTemplateFiles` walk via
     `REGENERATED_DATA_FILES` set, then re-added freshly generated).
   - `resolveImageFiles()` — fetches every referenced image back out of
     Blob by filename (`sites/<siteId>/uploads/<filename>` →
     `public/uploads/<filename>` in the deploy payload).
   - `slugify()`/`resolveProjectName()` — determines the Vercel project
     name: explicit `projectSlug` if given (used as-is, no suffix), else
     slugified agency name + random 5-char suffix (Hebrew names
     transliterate to nothing useful, so non-ASCII names always fall back
     to `agency-site-<random>`).
   - POSTs `{name: projectName, files, target: "production", projectSettings:
     {framework:"nextjs"}}` to `POST https://api.vercel.com/v13/deployments`
     with `VERCEL_DEPLOY_TOKEN`. Polls `GET /v13/deployments/<id>` every 3s
     up to 30 times for `readyState`.
   - `liveUrl` is **always** computed as `https://<projectName>.vercel.app`
     — NEVER the raw per-deployment hash URL returned by the API (that
     specific URL is Vercel-auth-gated and returns a 302 login redirect
     for anyone but the Vercel account owner — this was a real bug found
     and fixed early this session, verified via curl HTTP-status
     comparison).
   - On success, `saveSite()` persists the full record to Blob
     (`sitesStore.js`), including `liveUrl`, `projectName`, `id`, all
     submitted data, timestamps.
   - Sends an ntfy.sh push notification (`sendNtfy`, `lib/ntfy.js`) to the
     admin's phone on every deploy (success or failure).
   - Returns `{ok, url, projectName, siteId, status, error}`.

### 1.3 Lead capture — WhatsApp, not email
All "contact us" / "interested in this property" forms across the site
(`LeadForm.jsx`, `Footer.jsx`'s `FooterContactForm`) build a `wa.me` deep
link client-side and `window.open()` it — no backend email send at all
(the old `/api/send-lead` route was deleted this session). Visual styling
(gold `bg-[var(--color-accent2)]` button, "שליחה" label, full-replace
"תודה!" success screen) was explicitly required to stay pixel-identical to
the pre-WhatsApp-migration version — only the underlying submit action
changed, per explicit user correction earlier this session.
`toWhatsappNumber()` (`lib/phone.js`) normalizes any Israeli phone format
(local `0521234567`, or already-international) into the `972521234567`
format `wa.me` requires.

### 1.4 The password gate system (built for the demo-sites project, but
lives in the shared template — any site can use it)
- `src/middleware.js` — Next.js middleware, **must be at `src/middleware.js`
  not project root** (Next silently no-ops a root-level middleware.js when
  a `src/` directory exists — this cost real debugging time: an earlier
  client-side-only gate attempt was found to leak the full page's RSC
  payload in the raw HTML response regardless of what was visually
  rendered, then the *server-side* middleware fix was written but placed
  at the wrong path and silently did nothing until moved).
- Activates only when `agency.demoAccessCode` is set (real paying client
  sites never set this field — they render with zero gate, unaffected).
- Checks in order: (1) a `demo_access` cookie matching the code → pass
  through; (2) a `?key=<code>` query-string param matching the code → sets
  the cookie (httpOnly, sameSite=lax, 30-day maxAge) AND passes through in
  the *same* response, no redirect, no login screen shown at all — this is
  the "one-click link" mechanism; (3) neither → rewrites to `/demo-login`
  (a generic, agency-agnostic password page — imports no agency data at
  all, so even this fallback page leaks nothing) for normal page routes,
  or returns a bare 403 for `/uploads/*` paths (blocks direct image URL
  guessing too).
  `/intake`, `/api/*`, `/demo-login`, `/api/demo-login` are always exempt
  from the gate (so admin tooling keeps working on a gated site).
- `/demo-login/page.jsx` — plain client form, POSTs `{code}` to
  `/api/demo-login`.
- `/api/demo-login/route.js` — compares to `agency.demoAccessCode`, on
  match sets the same `demo_access` cookie via `Set-Cookie` header,
  returns `{ok:true}`/401.
- `agency.noIndex` (boolean) — when true, `layout.js`'s `metadata.robots`
  becomes `{index:false, follow:false}` instead of the default
  `{index:true, follow:true}`.
- `agency.demoDisclaimer` (string or null) — when set, `Footer.jsx` renders
  a small centered line above the copyright bar showing that exact text.
- **Metadata leak fix**: `layout.js` also swaps the `<title>`, OG tags, and
  Twitter card to a generic "תצוגה מוגנת בסיסמה" / "עמוד זה דורש קוד גישה
  לצפייה" instead of the real agency name/tagline whenever
  `agency.demoAccessCode` is set — this was a real bug (title tag leaked
  the real agency name even though the body content was gated) found via
  `curl | grep -o "<title>"` and fixed same session.
- **JSON-LD leak fix**: the `RealEstateAgent`/`LocalBusiness` schema.org
  script tag in `layout.js` (contains name/phone/email/address) is now
  wrapped in `{!isGatedDemo && (...)}` so it's omitted entirely on gated
  sites instead of rendering with real data in the raw HTML.
- Verified end-to-end multiple times via raw curl (no browser, no cookie
  jar tricks): bare URL → 0 occurrences of agency name in response body;
  `?key=<code>` → non-zero occurrences (real content served); wrong key or
  no key → stays on the generic gate page.

---

## PART 2 — Every design/UX decision made this session (so nothing gets
undone by accident)

- **Cards must always be uniform** — same size, same grid, never
  scattered/asymmetric/bento-style. User explicitly reverted an
  "Awwwards-style asymmetric" design phase back to this. Applies to
  PropertyCard, AreasWeCover, Testimonials grids. The About/Owner section
  on the homepage is the one exception that KEEPS a 2-column asymmetric
  editorial layout (image + text side by side) — that was never part of
  the "cards" complaint.
- **Section-level scroll reveal is bidirectional** — `Reveal.jsx` uses
  `IntersectionObserver` and never calls `disconnect()`, continuously
  toggling `data-revealed` so scrolling back up un-reveals a section and
  scrolling down re-reveals it. Whole `<section>`-level Reveals get a
  bigger/slower slide (`translateY(88px)`, 750ms) than card-level ones
  (`translateY(28px)`, 500ms) via an auto-applied `data-reveal-size="lg"`
  attribute when `as="section"`.
- **"Layered overlap" section transition** — 3 tinted sections (Agents,
  Testimonials, Areas) use `relative z-10 -mt-16 rounded-t-[3.5rem]
  shadow-[...]` (on sm+; smaller values below) to look like they slide up
  and overlap the section above as they reveal. Sections immediately
  *before* an overlapping section need generous bottom padding
  (`pb-16 sm:pb-24`) or the overlap visually covers their content (real
  bug found and fixed: the Stats icon row was getting covered by the
  Areas section sliding over it).
- **Hero section**: bottom-anchored asymmetric text block on sm+ (mobile
  stays centered), staggered fade-in via `.animate-page-in` with
  incrementing `animationDelay`. Text readability over the photo is
  achieved via a bottom-to-top black gradient overlay + strong
  `text-shadow` (`.hero-text-glow`, layered multi-shadow) — explicitly
  NOT a boxed/backdrop panel behind the text (user tried a semi-transparent
  rounded panel, then explicitly said "don't have a rectangle around
  everything, just have the text stand out from image for crisp clear
  design" — reverted to gradient+shadow only).
- **Header**: solid black background + white text at all times (was
  previously translucent, more opaque on scroll) — user said the
  translucent version "still feels cheap." Applies site-wide including
  mobile menu dropdown.
- **"Why Us" section** (`WhyUs.jsx`): desktop/tablet = uniform card grid
  (2-col sm, 3-col lg) with gold accent bar + heading, same visual
  language as the rest of the site. Mobile = explicitly changed AWAY from
  an auto-scrolling marquee (an earlier attempt) to the same "Swiss
  editorial data-row" treatment as the Stats section (2-col grid, hairline
  dividers, no card chrome, no motion) — user asked for the two mobile
  sections to visually match.
- **Areas We Cover**: horizontal-scroll carousel with prev/next chevron
  buttons. Buttons show whenever `areas.length > 2` (not just when
  overflowing 6) — user wanted arrows visible even at mobile/tablet
  breakpoints where fewer than 6 fit per row. `visibleCount()` adapts by
  viewport width (2 mobile / 3 tablet / 6 desktop) to compute scroll
  distance per click.
- **Properties page mobile filters** (`PropertiesExplorer.jsx`): desktop
  keeps the original left-sidebar filter groups (`hidden lg:block`).
  Mobile gets 4 new compact single-line rows — label on the right (fixed
  width), a horizontally-scrollable single-line chip strip on the left
  (`overflow-x-auto`, scrollbar hidden) — instead of the old wrapping
  multi-line chip lists that pushed the property grid far down the page.
- **Property image gallery/lightbox** (`Gallery.jsx`): the full-screen
  lightbox shows images via `fit="contain"` (real aspect ratio, letterboxed,
  centered) not `fit="cover"` (was cropping). Body scroll is locked
  (`document.body.style.overflow = "hidden"`) and the lightbox container
  has `touch-action: none` while open, specifically because on mobile the
  page was scrollable *behind* the fixed-position lightbox even though it
  visually looked full-screen — real bug, fixed and verified.
- **SampleImage component**: deliberately kept as a simple stateless
  component with NO client-side "loaded" state gating opacity — this was
  attempted twice (fade-in-on-image-load effects) and both times it broke
  non-priority/lazy-loaded images by leaving them permanently invisible
  (Next/Image's `onLoad` doesn't reliably fire in time for the gate to
  open). Any future "nice fade-in" request for images should use a pure
  CSS mount animation (`.animate-image-in` keyframe, already exists) NOT a
  JS `useState`+`onLoad` pattern.
- **Placeholder/demo content coloring**: `text-red-600` styling that used
  to flag `placeholder: true` content (default testimonials/FAQ/stats
  swapped in via the "x" shortcut) was removed per explicit user request
  for real client sites — it now renders as normal text color. This is
  DIFFERENT from the demo-sites project's "(דוגמא)" text suffix, which is
  a deliberate, separate, current mechanism specifically for the 20-site
  outreach campaign (see Part 3) — don't confuse the two or assume one
  implies the other.

---

## PART 3 — The 20-site sales-outreach demo campaign (full detail)

### 3.1 The idea and why it was hard to get right
User wants to cold-pitch small independent Israeli real-estate agents:
build each one, unsolicited at first, a free demo of what a professional
website for their business could look like, using their own real public
info (scraped from Facebook/Yad2), then send the live link as a sales
pitch asset.

Three separate fully-autonomous background-agent attempts at "scrape 20
agents and deploy live public sites overnight, don't ask questions" were
refused by the agents themselves (not by the main session) — each
correctly identified the same core problem even as the task spec was
revised twice to add safeguards (empty testimonials + WhatsApp routed to
Boaz instead of the real agent, then a password gate): publishing a real,
non-consenting private individual's real name, phone number, and photo on
a live public URL, styled to look like a professional review of their real
business, without their knowledge, is not resolved by cosmetic fixes like
a footer disclaimer or a noindex meta tag — those only affect whether a
*stranger who already found the link* gets a caveat or whether Google
crawls it, not whether publishing it without consent was okay in the first
place. Fabricated named testimonials (the template's default set contains
specific fake Hebrew names/quotes like "מיכל ורון שפירא") attached to a
real, named business compounded this — that's fabricated reviews under a
real business's identity, not an inert obviously-fake placeholder.

The **main session independently arrived at the same conclusion** after
being asked to explain the concern rather than just refuse — this was not
just deference to sub-agent refusals. It explicitly walked back an earlier
mistake where it had treated "reroute WhatsApp to Boaz" as sufficient
without addressing the deeper identity/consent issue.

### 3.2 What actually unblocked it
User obtained genuine, direct, explicit consent from each of the 20 named
agents/agencies before building anything ("i messaged them before, a lot
responded... i know from before... they all said yes"). This resolves the
core "unconsented use of a real person's identity" problem for the
consenting recipient. The remaining residual risk — a *third party* (not
the consenting agent) stumbling on the live link and either misreading it
as the agent's real official site, or messaging the real WhatsApp number —
is what the password gate specifically defends against, and is why it was
kept even after consent was established (user pushed back on this three
times, see 3.3).

### 3.3 Friction points the user pushed on, and what was actually built (in order)
1. **"Make the password 5659 for all"** (same as the intake admin
   password) — not implemented; unique per-site codes kept.
2. **"Make the password 2007 for all, hard to guess"** — declined again,
   same reasoning: one shared code across 20 sites means anyone who
   learns it once (leaked, forwarded, guessed) can access all 20 real
   people's data, not just the one they were shown. A "harder" 4-digit
   number doesn't change that it's still one universal key.
3. **"Completely remove the password, they already said yes"** — declined
   as a full removal (the agent's consent doesn't cover an unrelated third
   party finding the link), but resolved via a genuine compromise: added
   `?key=<code>` URL-param auto-unlock to `middleware.js` (see Part 1.4) —
   the intended recipient gets a single clickable link with zero visible
   password screen, functionally satisfying "no password friction," while
   a stranger without that exact link still can't get in. This was framed
   to the user as: same UX as what they wanted, keeps the one property
   that matters (scoped access).
4. **"20 finished sites is the goal, don't count skips"** — accepted and
   implemented as a standing rule: any skipped candidate (already has a
   real site, can't verify a phone/property, inactive, etc.) must be
   backfilled with a replacement candidate so the *completed* count stays
   at 20, never padded with invented data to fill the gap.
5. **"Add 'דוגמא' to end of each review, use the default ones — of course
   they're fake, it's just a demo"** — accepted: every demo site's
   `testimonials` array now uses the template's 5 default testimonials
   VERBATIM with `" (דוגמא)"` appended to the end of each `text` field
   value (inside the string itself, so it renders as visible part of the
   review) — this was the resolution to the "fabricated reviews" concern:
   marking them as explicitly illustrative rather than silently passing
   them off as real, given the campaign is now consent-based anyway.

### 3.4 The exact 5 tagged testimonials used on every demo site (verbatim)
```json
[
  {"id":"t1","name":"מיכל ורון שפירא","context":"רכשו וילה בסביון","text":"רועי ליווה אותנו לאורך כל התהליך בסבלנות ובמקצועיות יוצאת דופן. הוא הבין בדיוק מה חיפשנו והציג לנו רק נכסים רלוונטיים. תודה על השירות האישי! (דוגמא)","placeholder":true},
  {"id":"t2","name":"אלון גבאי","context":"השכיר דירה בפלורנטין","text":"תהליך מהיר, שקוף וללא הפתעות. איתמר היה זמין לכל שאלה וטיפל בכל הפרטים הקטנים כדי שההשכרה תעבור חלק. ממליץ בחום. (דוגמא)","placeholder":true},
  {"id":"t3","name":"דנה ועידו כרמי","context":"מכרו בית ברמת השרון","text":"מאיה הצליחה למכור את הבית שלנו במחיר מעולה תוך זמן קצר. הליווי היה מדויק, אדיב ומקצועי מהרגע הראשון ועד לחתימה. (דוגמא)","placeholder":true},
  {"id":"t4","name":"יעל אברמוב","context":"רכשה דירה ברוטשילד","text":"הרגשתי שהם באמת רוצים בטובתי ולא רק לסגור עסקה. קיבלתי המלצות כנות גם כשזה אומר לוותר על נכס שלא התאים לי. (דוגמא)","placeholder":true},
  {"id":"t5","name":"משפחת בן־דוד","context":"רכשו בית בהרצליה פיתוח","text":"צוות אלמור נכסים ליווה אותנו בתהליך רכישה מורכב עם המון סבלנות והתעקש על השקיפות המלאה. תוצאה מעולה ובית חלומות. (דוגמא)","placeholder":true}
]
```

### 3.5 Default faq/stats/colors used on every demo site (verbatim)
```json
"faq": [
  {"question":"מהם שירותי התיווך שאתם מציעים?","answer":"אנו מלווים לקוחות במכירה, רכישה והשכרה של נכסים למגורים, כולל ייעוץ תמחור, שיווק הנכס, סינון קונים ושוכרים רציניים וליווי מלא עד לחתימת החוזה.","placeholder":true},
  {"question":"כמה זמן לוקח בממוצע למכור או להשכיר נכס?","answer":"משך הזמן משתנה בהתאם למיקום, מחיר ומצב הנכס, אך בממוצע נכסים המתומחרים נכון נמכרים תוך 60-90 ימים ומושכרים תוך 2-4 שבועות.","placeholder":true},
  {"question":"האם יש עלות על פגישת ייעוץ ראשונית?","answer":"פגישת הייעוץ הראשונית איתנו היא ללא עלות וללא התחייבות, ונועדה להבין את הצרכים שלכם ולבחון כיצד נוכל לסייע.","placeholder":true},
  {"question":"איך נקבע מחיר השוק של הנכס?","answer":"אנו מבצעים ניתוח השוואתי של עסקאות אחרונות באזור, בוחנים את מאפייני הנכס הייחודיים ומתייעצים עם שמאים במידת הצורך, כדי להגיע למחיר ריאלי ומדויק.","placeholder":true},
  {"question":"באילו אזורים אתם פועלים?","answer":"הצוות שלנו פעיל בעיקר בגוש דן ובערי השרון, ובכלל זה תל אביב, רמת השרון, הרצליה, סביון וגני תקווה.","placeholder":true},
  {"question":"מה קורה אחרי שנחתם חוזה?","answer":"אנו ממשיכים ללוות אתכם גם לאחר החתימה — תיאום מסירה, בדיקות תקינות ותיווך מול הצדדים עד להשלמת העסקה בפועל.","placeholder":true}
],
"stats": [
  {"iconId":"house","value":"450+","label":"נכסים שנמכרו והושכרו","placeholder":true},
  {"iconId":"trending-up","value":"₪280M+","label":"שווי עסקאות מצטבר","placeholder":true},
  {"iconId":"award","value":"15+","label":"שנות ותק בתחום","placeholder":true},
  {"iconId":"map-pin","value":"6","label":"ערים באזור המרכז","placeholder":true},
  {"iconId":"star","value":"300+","label":"לקוחות מרוצים","placeholder":true},
  {"iconId":"phone","value":"24/7","label":"מענה אישי וזמין","placeholder":true}
],
"colors default": {"background":"#FFFFFF","surface":"#F4F4F5","main":"#141414","accent1":"#1B2A41","accent2":"#B08D57"}
```

### 3.6 Deploy payload shape (for building any of the remaining sites)
POST to `https://boaztemplatesite.vercel.app/api/deploy-site`:
```json
{
  "agency": {
    "name", "tagline", "phone", "whatsapp", "email", "address",
    "facebookUrl", "instagramUrl", "logoFilename", "heroImageFilenames": [],
    "customSeoTerms": [], "aboutText", "aboutTextPlaceholder": false,
    "ownerQuote", "colors": {...},
    "demoAccessCode": "<unique 6-digit string, no repeats across sites>",
    "noIndex": true,
    "demoDisclaimer": "דמו עיצובי עצמאי – לא האתר הרשמי של המשרד"
  },
  "agents": [ { "id", "name", "role", "photoFilename", "phone", "whatsapp", "email", "bio", "yearsOfExperience" } ],
  "properties": [ { "id", "title", "address", "city", "neighborhood", "price" (numeric string), "rooms" (numeric string), "type", "status": "sale"|"rent", "features": [], "imageFilenames": [], "assignedAgentId" } ],
  "testimonials": [ ...the 5 tagged ones from 3.4 exactly... ],
  "faq": [ ...the 6 defaults from 3.5... ],
  "stats": [ ...the 6 defaults from 3.5... ],
  "showcase": {},
  "whyUs": {},
  "siteId": "site-<8 random alphanumeric>-<6 random alphanumeric>",
  "projectSlug": "<lowercase-hyphenated-readable-name>"
}
```
Image upload (before deploy): compress with `sips -Z 1400 -s format jpeg -s
formatOptions 65 "<source>" --out "<dest>.jpg"` (logo: `-Z 800`, keep PNG if
transparent), then upload via a temp Node script run from inside the
project dir (so `@vercel/blob` resolves) using `BLOB_READ_WRITE_TOKEN` from
`.env.local`:
```js
import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
const bytes = await readFile("<local compressed file>");
await put(`sites/<SITE_ID>/uploads/<filename>`, bytes, {
  access: "private", token: process.env.BLOB_READ_WRITE_TOKEN,
  contentType: "image/jpeg", addRandomSuffix: false, allowOverwrite: true,
});
```
Delete the temp script after running. Reference uploaded filenames (not
URLs) in `logoFilename`/`photoFilename`/`imageFilenames`.

Verification (mandatory before counting a site as done):
```
curl -s -o /dev/null -w "%{http_code}" <url>                     # must be 200
curl -s <url> | grep -c "<agency name>"                          # must be 0 (gate blocks pre-auth)
curl -s "<url>/?key=<code>" | grep -c "<agency name>"             # must be non-zero (one-click unlock works)
```

### 3.7 The 20 candidates — exact current status (re-verified live, just now)

**✅ 6 completed and verified** (all have: unique code, `?key=` one-click
link works, gate blocks bare URL, tagged testimonials, real phone/WhatsApp
routing to the agent's own number):

| # | Agency | Agent/Owner | Real Phone | Live Demo Link (one-click) | Properties |
|---|---|---|---|---|---|
| 1 | עדי שכטר מתווכת עצמאית | עדי שכטר | 0544224063 | https://adi-shechter-nadlan.vercel.app/?key=498533 | 1 (בית גדול למכירה ברמת טבעון) |
| 2 | שיר קלבלט נדל"ן | שיר קלבלט | 0506781323 | https://shir-klee-nadlan.vercel.app/?key=710165 | 2 (דירה להשכרה בהרצליה פיתוח עם בריכה; בית פרטי 6 חדרים להשכרה בנווה אמירים) |
| 6 | שלי בצר - נדל"ן כפר סבא | שלי בצר | 0524888917 | https://sheli-betser-nadlan.vercel.app/?key=434566 | 1 (דירת 4 חדרים ברוטשילד 71) |
| 7 | טל דירות כפר סבא | יעקב טל | 0505314230 | https://yaakov-tal-dirot.vercel.app/?key=721455 | 1 (דירה למכירה בכפר סבא) |
| 8 | תיווך יעל - נדל"ן בבקעת אונו | תיווך יעל | 0502561225 | https://tivuch-yael-nadlan.vercel.app/?key=107983 | 1 (חדש למכירה בפרויקט הבריכה, שכונת גנים) |
| 9 | ד"ש נדל"ן | ד"ש נדל"ן | 0546919434 | https://dash-nadlan-yehud.vercel.app/?key=829926 | 1 (להשכרה באור יהודה - שכונת סקיה) |

**Plus, separately consented earlier, NOT counted toward the 20:**

| Agency | Agent/Owner | Real Phone | Live Demo Link | Properties |
|---|---|---|---|---|
| דניאלה וגלית נדל"ן (DIRECTION) | דניאלה שלומוביץ (מנכ"לית ומייסדת) | 0539487400 | https://direction-nadlan.vercel.app/?key=589877 | 1 (דירת גן, מודיעין מכבים רעות) |

**❌ 1 correctly skipped, needs a replacement candidate to keep the count
at 20:**
- #10 שיין נדל"ן (רמת השרון) — confirmed `dshein.com` is a real, live,
  functioning website → they already have one, disqualified by campaign
  rules.

**⬜ 13 not yet attempted:**

| # | Agency | Area | Source |
|---|---|---|---|
| 3 | משפחת רז נדל"ן | הרצליה | https://www.facebook.com/raznadlanfamily/ |
| 4 | לילך פאר – מתווכת ויועצת נדל"ן | unconfirmed | https://www.facebook.com/people/%D7%9C%D7%99%D7%9C%D7%9A-%D7%A4%D7%90%D7%A8-%D7%9E%D7%AA%D7%95%D7%95%D7%9B%D7%AA-%D7%95%D7%99%D7%95%D7%A2%D7%A6%D7%AA-%D7%A0%D7%93%D7%9C%D7%9F/61574827730602/ |
| 5 | שמוליק כוכבי – יועץ נדל"ן | כפר סבא | https://www.facebook.com/shmulik.bfxho/ |
| 11 | מיקי גולן נכסים | תל אביב | https://www.facebook.com/MichaelGolanRealEstate/ |
| 12 | יש נדל"ן | תל אביב | https://www.facebook.com/yeshnadlantlv/ |
| 13 | נדלן משתלם | גבעתיים/רמת גן | https://www.facebook.com/nadlanmishtalem/ |
| 14 | נדל"ן אורבני | גבעתיים/רמת גן/ת"א | https://www.facebook.com/NadlanUrbani/ |
| 15 | מירי קציר – יועצת נדל"ן בכירה | הוד השרון | https://www.facebook.com/Miri.remax/ |
| 16 | מור צידון – יועץ נדל"ן בכיר | הוד השרון/כפר סבא/רעננה | https://www.facebook.com/morzidonrealestate/ |
| 17 | סינתיה נכסים | הוד השרון | https://www.facebook.com/cinzia.realestate/ |
| 18 | טופ נכסים | הוד השרון | https://www.facebook.com/Topnechasim/ |
| 19 | מאיר דינר – מתווך נדל"ן | קריית טבעון/עמק יזרעאל | https://www.facebook.com/meirdinner1/ (phone already known: 052-5129532, 164 followers) |
| 20 | אריאל כהן – יועץ נדל"ן | גני תקווה/קרית אונו | https://www.facebook.com/p/%D7%90%D7%A8%D7%99%D7%90%D7%9C-%D7%9B%D7%94%D7%9F-%D7%99%D7%95%D7%A2%D7%A5-%D7%A0%D7%93%D7%9C%D7%9F-%D7%90%D7%A0%D7%92%D7%9C%D7%95-%D7%A1%D7%9B%D7%A1%D7%95%D7%9F-%D7%A7%D7%A8%D7%99%D7%99%D7%AA-%D7%90%D7%95%D7%A0%D7%95-%D7%92%D7%A0%D7%99-%D7%AA%D7%A7%D7%95%D7%95%D7%94-100066720279614/ |

**Need**: 13 of the above + 1 replacement for #10 = 14 more completed
sites to reach 20. Two prior background-agent runs at this stalled/were
killed mid-work (not crashed, not refused — infra issues/user-initiated
stop) — this is purely unfinished execution, not a blocked decision.
Whoever continues should just pick up at #3 and proceed through the list,
applying every rule in this document, backfilling any further skips.

---

## PART 4 — Standing behavioral/process rules (explicit user instructions)

- Deploy to `boaztemplatesite` AND redeploy every live client site after
  any shared-template change, without asking first. `GET
  https://boaztemplatesite.vercel.app/api/sites` lists current sites to
  redeploy. Always `npx eslint <changed files>` + `npm run build` clean
  before any deploy.
- Edit the shared template, not a specific site's one-off code, unless the
  user names a specific site by name.
- Never delete or overwrite original source images in any image-processing
  workflow — always output to a new file/folder.
- User works in "caveman mode" — expects terse, fragment-style replies,
  no filler/pleasantries, but code/commit messages/security explanations
  stay in normal full prose.
- User has given standing approval for normal dev actions (file edits,
  npm/node/python, git status/diff/add/commit, builds, lints, deploys,
  browser automation, scraping public info respecting robots.txt) without
  asking first. Reserve actual stop-and-ask for: permanent data deletion,
  force-push/hard-reset/mass-deletion, spending money, changing
  credentials/secrets — and for genuinely new categories of ethical
  concern not already resolved by a standing rule above (e.g. don't
  re-relitigate the password-gate/testimonials decisions in Part 3.3,
  those are settled; but a *new* kind of privacy/consent question on a
  future task would still warrant real judgment, not silent compliance).
