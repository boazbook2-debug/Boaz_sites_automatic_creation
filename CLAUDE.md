@AGENTS.md

# Project context

Multi-tenant real-estate website generator (Next.js). Template repo + admin
intake form (`/intake`, admin password `5659`) → generates per-client data
files → deploys each as its own Vercel project via `/api/deploy-site` on the
generator itself, which is deployed as **boaztemplatesite**
(`https://boaztemplatesite.vercel.app`).

Standing rule: deploy changes to `boaztemplatesite` and to all live client
sites without asking first — redeploy every active site (`GET
https://boaztemplatesite.vercel.app/api/sites` lists them) after any template
change so they all stay in sync. Always lint + `npm run build` before
deploying.

## Real paying client sites (do not touch without reason)
- NadlanCom — https://nadlan-com-txsmr.vercel.app
- דירות בירושלים — https://agency-site-lo74w.vercel.app

## Sales-pitch demo sites
Cold-outreach demos built from small independent agents' public info
(Facebook/Yad2), sent privately to each agent after they agreed to have a
demo built. Every demo site sets three `agency` fields that activate a
server-side password gate (`src/middleware.js` + `/demo-login` +
`/api/demo-login`):
- `agency.demoAccessCode` — unique 6-digit code per agency
- `agency.noIndex` — `true`
- `agency.demoDisclaimer` — exactly `"דמו עיצובי עצמאי – לא האתר הרשמי של המשרד"`

Visiting `https://<slug>.vercel.app/?key=<code>` auto-unlocks in one click
(no password screen) and sets a cookie; the bare URL without `?key=` stays
gated to anyone else. Testimonials on these demo sites always use the 5
default template testimonials with `"(דוגמא)"` appended to each review's
text (marks them as illustrative example content, not real reviews) —
never leave testimonials empty on these, and never invent new ones.

Live so far (see `GET /api/sites` for the current authoritative list —
this snapshot will go stale):
- דניאלה וגלית נדל"ן — https://direction-nadlan.vercel.app (key: 589877)
- עדי שכטר מתווכת עצמאית — https://adi-shechter-nadlan.vercel.app
- שיר קלבלט נדל"ן — https://shir-klee-nadlan.vercel.app
- שלי בצר - נדל"ן כפר סבא — https://sheli-betser-nadlan.vercel.app
- טל דירות כפר סבא - יעקב טל — https://yaakov-tal-dirot.vercel.app
- תיווך יעל - נדל"ן בבקעת אונו — https://tivuch-yael-nadlan.vercel.app
- ד"ש נדל"ן — https://dash-nadlan-yehud.vercel.app

(Access codes for the last 6 weren't recorded in this file — look up each
site's record via `curl -s https://boaztemplatesite.vercel.app/api/sites/<id>`
if a code is needed and not already known.)

Goal: 20 total demo sites from a candidate list of small independent
agencies (Facebook-only presence, no personal website, active within
~6 months, real phone + real property listing). Skipped candidates (already
have a real site, can't verify data, etc.) get backfilled with replacements
to keep the completed count at 20 — never pad with invented data to hit the
number.

## Non-negotiable rules for demo sites
- Never invent agency/agent/property data — omit or skip the candidate if a
  fact can't be verified from their own public page or Yad2.
- Never bypass logins/CAPTCHAs/access controls when researching.
- Never identify a person's identity from a photo alone — only use a name
  explicitly stated as text on the page.
- Never mix data between agencies (wrong phone/photo attributed to the
  wrong agency is the worst failure mode) — double check uploaded image
  filenames are scoped to the correct site's own Blob folder
  (`sites/<siteId>/uploads/...`).
- Always set the three gate fields above and use the tagged default
  testimonials — these were arrived at after real back-and-forth about
  consent/safety and should not be silently dropped.

## Known gotchas
- `middleware.js` must live at `src/middleware.js`, not project root — Next
  silently ignores it at the root when a `src/` dir exists (cost real
  debugging time once already).
- `collectTemplateFiles.js` / `next.config.mjs`'s `outputFileTracingIncludes`
  must both list any new root-level config file or it gets silently dropped
  from every deploy.
- Compress images before uploading to Blob (`sips -Z 1400 -s format jpeg -s
  formatOptions 65`) — uncompressed screenshots blow Vercel's 10MB deploy
  body limit.
