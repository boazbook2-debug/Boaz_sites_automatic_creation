# Session Handoff — Full Context

Read this fully before doing anything. Written for a fresh Claude Code
session with no memory of the prior conversation.

## 1. What this project is

Multi-tenant real-estate website generator, Next.js 16 (App Router,
Turbopack), Tailwind v4, RTL Hebrew. Repo:
`/Applications/Website/real-estate-template`. Deployed to Vercel as project
**boaztemplatesite** (`https://boaztemplatesite.vercel.app`).

**How template ↔ questionnaire link together:**
- `/intake` (password `5659`) is the admin form (`IntakeForm.jsx`,
  `IntakeFlow.jsx`) — fills out agency/agents/properties/testimonials/faq/
  stats/showcase/whyUs.
- Submitting calls `POST /api/deploy-site` (`src/app/api/deploy-site/route.js`):
  reads the whole template's source files off disk
  (`collectTemplateFiles.js`), replaces `src/data/*.js` with freshly
  generated content from the form (`generateDataFiles.js`), resolves
  uploaded images from Vercel Blob (`siteImages.js`), and POSTs everything
  to the Vercel Deployments API to create/update a brand-new Vercel project
  per client (`projectName` = slugified agency name, or an explicit
  `projectSlug` field if provided).
- Site records (full JSON of what was submitted) persist in Vercel Blob via
  `sitesStore.js` (`sites/<id>.json`) so the admin dashboard can list/reload/
  edit any site later. `GET /api/sites` lists all; `GET/DELETE
  /api/sites/<id>` reads/deletes one.
- Images uploaded directly to Blob client-side during intake (bypasses the
  4.5MB request body limit); deploy route fetches them back by filename.
- `liveUrl` is always `https://<projectName>.vercel.app` — never the raw
  per-deployment hash URL (that one is Vercel-auth-gated).

**Real paying client sites (do not touch without reason):**
- NadlanCom — https://nadlan-com-txsmr.vercel.app
- דירות בירושלים — https://agency-site-lo74w.vercel.app
- (A third site, agency-site-uwzmc, went offline/was deleted at some point
  mid-session — unresolved whether intentional.)

## 2. Design/feature work completed this session (chronological, condensed)

- Fixed WhatsApp links (local→international format via `src/lib/phone.js`).
- Fixed deploy route returning gated raw URLs → now uses clean `.vercel.app` alias.
- Converted lead-capture forms from email backend to WhatsApp-redirect
  (kept original visual styling exactly, per explicit correction — only
  the submit action changed, not colors/layout/button copy).
- Large multi-phase premium design overhaul: typography, motion system
  (`Reveal.jsx` bidirectional scroll-reveal, `ScrollProgressBar`,
  `MouseGradient`, `MagneticButton`, `PageTransition`), Hero redesign
  (asymmetric bottom-anchored composition, then simplified per correction
  to no boxed panel — just gradient + text-shadow for crisp readable text).
- User explicitly reverted an "asymmetric/bento card" design direction
  back to uniform simple grids (PropertyCard, AreasWeCover, Testimonials)
  — keep cards uniform, no scattered/varied sizes, always.
- Added new **"Why Us" section** (`WhyUs.jsx` + `data/whyUs.js` +
  `generateWhyUsFile`): heading + exactly 6 title/description cards,
  positioned between Areas-We-Cover and FAQ on homepage. Has a
  `DEFAULT_WHY_US` fallback in `generateDataFiles.js` used whenever a
  client leaves it incomplete (heading blank or not exactly 6 filled
  cards) — always ships something, never an empty section.
- On mobile, Why-Us cards use the same "Swiss editorial data-row" grid
  treatment as the Stats section (2-col, hairline dividers, no card
  chrome) instead of full-size cards — user explicitly asked to match
  Stats' mobile layout.
- Areas-We-Cover: 6-per-row carousel with prev/next arrows when more than
  a page's worth of areas exist; arrows now show whenever count > 2 (not
  just > 6) so mobile (2-visible) and tablet (3-visible) breakpoints also
  get navigation.
- Properties page mobile filters: rebuilt as 4 compact single-line rows
  (label right, horizontal-scroll chip strip left) instead of tall
  wrapping chip lists, so the property grid is visible near the top on
  mobile (`PropertiesExplorer.jsx`).
- Header: changed to permanent solid black background + white text
  everywhere (was translucent/scroll-reactive) — user felt the site "felt
  cheap" otherwise.
- Gallery lightbox (property detail page images): fixed to show images at
  their real aspect ratio, centered, letterboxed (`fit="contain"`) instead
  of force-cropping; fixed mobile scroll-behind-lightbox bug via
  `document.body.style.overflow = "hidden"` + `touch-action: none` while
  open.
- Relaxed intake validation: FAQ, testimonials, "why us", agent bio/photo/
  role/phone/email, and the 4 "brand story" about-page fields are all now
  optional — any left blank falls back to sensible defaults (template
  default FAQ/testimonials, agency's own phone/email for a blank agent
  contact field, generic demo bio/stock photo for a blank agent bio/photo)
  instead of blocking submission. Only agency core contact info, brand
  colors, and property listings remain required.
- Added a **delete-site** feature: trash icon on each site tile in the
  admin dashboard → password-gated (`5659`) confirm screen → `DELETE
  /api/sites/<id>` removes both the Blob record and the actual Vercel
  project via the Vercel API.
- Added a **projectSlug** field to intake (new sites only): lets the admin
  type an explicit English slug so the Vercel project reads as e.g.
  `nadlan-com` instead of a random suffix; falls back to the old
  slugify-agency-name+random-suffix behavior if left blank.
- Added TypeScript + shadcn/ui + framer-motion to the project (user
  requested a specific shadcn component integration) — lives isolated at
  `/ui-demo` route, does not touch the real homepage/site.
- **Reverted** an AI-powered "build site from screenshots" feature inside
  the intake form (`/api/build-from-screenshots` using Claude vision) —
  user doesn't have an Anthropic API key and clarified they'd rather just
  paste screenshots directly into a Claude Code chat and have Claude build
  the site data manually. Route and UI fully removed.

**Known gotchas (cost real debugging time, don't repeat):**
- `middleware.js` must live at `src/middleware.js`, NOT project root —
  Next.js silently ignores a root-level middleware file when a `src/`
  directory exists.
- Any new root-level config file (e.g. `middleware.js`, `tsconfig.json`)
  needs to be added to BOTH `collectTemplateFiles.js`'s root-file list AND
  `next.config.mjs`'s `outputFileTracingIncludes` array, or it's silently
  dropped from every deploy.
- Compress images before uploading to Blob
  (`sips -Z 1400 -s format jpeg -s formatOptions 65`) — uncompressed
  screenshots/photos blow past Vercel's 10MB deployment body limit.
- A stale/crashed Turbopack dev server can make pages render blank with no
  error — `rm -rf .next` + clean restart fixes it; always verify a fix
  visually after a weird "nothing changed" result before concluding code
  is wrong.
- Client-side-only access gating is NOT real security — Next.js ships the
  full RSC payload in the initial HTML regardless of what a client
  component chooses to render. Real gating requires server-side middleware.

## 3. The "20 sales-pitch demo sites" project — full history

**Origin**: user wanted to cold-pitch small independent Israeli real-estate
agents by building each a free unsolicited demo site from their public
info (Facebook/Yad2), to send as a sales pitch.

**Refusal history (important — don't relitigate, but understand why the
current design exists):** Three separate autonomous background-agent runs
of "scrape 20 agents and deploy live public sites" were refused by the
agents themselves, each for the same core reason even as the spec was
revised: publishing a real, non-consenting private person's real name,
phone number, and photo on a live public URL — built to look like a
review of their real business — without their knowledge, is not resolved
by a footer disclaimer, noindex tag, or rerouting the WhatsApp CTA to
Boaz's own number. Fabricated named testimonials attached to a real named
business compounded the concern. Main Claude session independently agreed
with this reasoning after reflection (not just deferring to the
sub-agents) and additionally flagged the WhatsApp-to-Boaz change wasn't
a real fix — it changes who receives inquiries but not the core
identity/consent problem.

**Resolution that unblocked it**: user obtained real, explicit consent
directly from each of the 20 named agents/agencies before any building
started ("i messaged them before... they all said yes"). Given genuine
per-agency consent, the design settled on:

- **Server-side password gate** (`src/middleware.js` +
  `/demo-login` (page) + `/api/demo-login` (route)) — real protection
  against a *third party* (not the consenting recipient) stumbling on the
  link, which is the residual risk consent from the recipient doesn't
  cover. This was verified end-to-end (curl before/after auth, checked raw
  HTML contains zero agency data pre-auth) after an initial client-side-only
  version was found to leak full data in raw HTML despite "working"
  visually.
- **Unique 6-digit `agency.demoAccessCode` per site** — user twice asked
  for a single shared code across all sites ("2007", then "0000") and was
  talked out of both: a shared code means anyone who learns it once can
  open all 20 real people's private data, not just the one they were
  shown. Held this line each time; final agreed design keeps per-site
  unique codes.
- **One-click `?key=<code>` URL param** — added as a compromise when user
  asked to "completely remove the password": visiting
  `https://<slug>.vercel.app/?key=<code>` auto-unlocks silently (sets
  cookie, no login screen shown at all) so the intended recipient just
  clicks one link with zero friction, while the bare URL without the
  correct key still shows the gate to anyone else. This is now the
  standard way to hand a demo to its agent — give them the full
  `?key=` link, not a separate password.
- **`agency.noIndex = true`** and **`agency.demoDisclaimer` = exactly**
  `"דמו עיצובי עצמאי – לא האתר הרשמי של המשרד"` — both wired in (layout.js
  robots meta + JSON-LD suppression when gated; Footer.jsx renders the
  disclaimer line when set).
- **Testimonials**: NOT left empty (final decision) — always use the 5
  default template testimonials verbatim, each with `"(דוגמא)"` appended
  to the end of the review text, marking them visibly as illustrative
  example content rather than real unlabeled reviews. (Note: the
  black/red "placeholder" text-color distinction that used to visually
  flag demo/default content was removed earlier this session per user
  request for *real client* sites — the "(דוגמא)" text suffix is the
  current substitute specifically for these pitch demos.)
- **WhatsApp**: routes to the *agent's own real number* (not Boaz's) —
  acceptable specifically because per-site unique codes + real consent
  scope who can ever reach that button to people the agent themselves
  chose to show it to.

**Target**: 20 completed, deployed, verified demo sites. Explicit rule:
if a candidate is skipped (already has a real website, can't verify a
phone/property, etc.) it must be backfilled with a replacement candidate
— the goal is 20 *completed* sites, not 20 attempted.

**Candidate list (20, from user-approved research)** — status as of last
check via `curl -s https://boaztemplatesite.vercel.app/api/sites`:

| # | Name/Agency | Area | Status |
|---|---|---|---|
| 1 | עדי שכטר – מתווכת עצמאית | Kiryat Tivon/Carmel | ✅ DONE — https://adi-shechter-nadlan.vercel.app |
| 2 | שיר קלבלט – יועצת נדל"ן בכירה | הרצליה | ✅ DONE — https://shir-klee-nadlan.vercel.app |
| 3 | משפחת רז נדל"ן | הרצליה | not started |
| 4 | לילך פאר – מתווכת ויועצת נדל"ן | unconfirmed | not started |
| 5 | שמוליק כוכבי – יועץ נדל"ן | כפר סבא | not started |
| 6 | שלי בצר – נדל"ן | כפר סבא | ✅ DONE — https://sheli-betser-nadlan.vercel.app |
| 7 | יעקב טל – טל דירות | כפר סבא | ✅ DONE — https://yaakov-tal-dirot.vercel.app |
| 8 | תיווך יעל | גני תקווה/בקעת אונו | ✅ DONE — https://tivuch-yael-nadlan.vercel.app |
| 9 | ד"ש נדל"ן | יהוד/גני תקווה | ✅ DONE — https://dash-nadlan-yehud.vercel.app |
| 10 | שיין נדל"ן | רמת השרון | ❌ SKIPPED — dshein.com is a real live site, needs replacement |
| 11 | מיקי גולן נכסים | תל אביב | not started |
| 12 | יש נדל"ן | תל אביב | not started |
| 13 | נדלן משתלם | גבעתיים/רמת גן | not started |
| 14 | נדל"ן אורבני | גבעתיים/רמת גן/ת"א | not started |
| 15 | מירי קציר – יועצת נדל"ן בכירה | הוד השרון | not started |
| 16 | מור צידון – יועץ נדל"ן בכיר | הוד השרון/כפר סבא/רעננה | not started |
| 17 | סינתיה נכסים | הוד השרון | not started |
| 18 | טופ נכסים | הוד השרון | not started |
| 19 | מאיר דינר – מתווך נדל"ן | קריית טבעון/עמק יזרעאל | not started (phone known: 052-5129532) |
| 20 | אריאל כהן – יועץ נדל"ן | גני תקווה/קרית אונו | not started |

Plus one extra site built under separate, earlier-obtained explicit
permission (not counted in the 20): **דניאלה וגלית נדל"ן (DIRECTION)** —
https://direction-nadlan.vercel.app/?key=589877

**Currently: 6 of 20 completed, 1 skipped (needs replacement), 13
untouched.** A background agent doing #11 onward was killed by the user
mid-run (not crashed) — status frozen at the table above. Whoever
continues this should resume from candidate #3, #4, #5, then #11–20, plus
find one replacement for #10, applying every rule in section 3 above
(unique code, `?key=` link, tagged testimonials, real-WhatsApp routing,
verify gate blocks pre-auth and unlocks post-auth via curl before counting
a site as done).

## 4. Payload/pipeline reference for building a demo site

Exact JSON shape and defaults (colors, faq, stats, testimonials-with-
"(דוגמא)") plus the image-compress-and-upload-to-Blob script pattern are
all in the git history of agent prompts this session — reconstruct as:
top-level payload keys `agency, agents, properties, testimonials, faq,
stats, showcase, whyUs, siteId, projectSlug`; POST to
`https://boaztemplatesite.vercel.app/api/deploy-site`. See
`src/lib/generateDataFiles.js` and `src/app/api/deploy-site/route.js` for
the authoritative current schema — read those files directly rather than
trusting a stale copy of the payload shape from memory.

## 5. Standing behavioral rules for this project (from explicit user instruction)

- Deploy to `boaztemplatesite` and redeploy all live client sites after
  any template change, without asking first. Always lint + `npm run
  build` clean before deploying.
- Edit the shared template, not a specific site, unless the user names a
  specific site.
- Never delete/overwrite original source images — only ever add new
  converted/watermarked copies.
- User runs this session in caveman-mode (terse replies) — keep responses
  short, fragment-style, no fluff, but code/commits/security explanations
  stay in normal prose.
