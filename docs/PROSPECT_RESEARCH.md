# Prospect Research

How candidates get discovered and qualified for the demo-site campaign, before any demo asset work starts. See [`DEMO_GENERATION.md`](./DEMO_GENERATION.md) for what happens after a prospect is qualified.

## Ideal Candidate Profile (ICP)

- Small, independent real-estate agent or boutique agency in Israel.
- Facebook-only public presence — no personal/agency website.
- Active within the last ~6 months (check the top post's date, not just follower count or page creation date).
- A real public phone number.
- At least one real, verifiable property listing (Yad2, Facebook, or another legitimate public source).
- Owner/decision-maker identifiable by name (needed later for outreach personalization and agent-photo verification).

## Anti-ICP (skip immediately)

- Already has a real, live, functioning personal or agency website (this disqualifies regardless of how good the rest of the profile looks).
- **Has a verified Madlan agent/agency profile page** (`madlan.co.il/agent/...` or `madlan.co.il/agentsOffice/...` representing that specific person/business) — hard disqualifier, same tier as having a website (added 2026-08-10). A property merely *appearing* on Madlan doesn't count; it must be an actual profile page for that agent/agency. Check this **before** spending time on identity/property research — it's a cheap gate, same stage as the website check. Two demos (BarHome, Shai Nechasim) were built before this rule existed and had to be retroactively disqualified after already being deployed — see `prospects/campaign-chart.csv`.
- Franchise-affiliated (RE/MAX, אנגלו סכסון, Keller Williams, etc.) — check the page name/bio for the brand.
- Stale — most recent post older than 6 months.
- Facebook explicitly labels a post "AI content" — can't verify photos/listing are genuine.
- Post attributed to a different person/brand than the page name (likely a repost) — don't treat as the page owner's own listing.
- Name-collision risk with another agency already in the campaign.

## Qualification scoring

Each qualified prospect gets a 0–100 score and a bucket:
- `HIGH PRIORITY` 🔥
- `NO WEBSITE — HIGH CONFIDENCE`
- `NO WEBSITE — MEDIUM CONFIDENCE`
- `POOR WEBSITE` (has a website, but broken/dead domain — still usable if the qualified list explicitly permits poor-site prospects for that batch)

Score inputs: follower count, deal-flow evidence (active listings, years active), photo/marketing quality, and how clean the "no website" signal is. See `prospects/qualified-100.md` / `.csv` / `.json` for the current scored list — that list is the source of truth, not this document.

**100 qualified means 100 PASSED, not 100 attempted.** Candidates that fail verification are recorded in `prospects/rejected-candidates.csv` with a reason, never silently dropped.

## Sourcing method that works

Plain `WebSearch` is low-yield — it surfaces branded agencies with real websites, exactly what disqualifies a candidate. Restrict with `allowed_domains: ["facebook.com"]` and query phrases like `"יועץ נדל\"ן עצמאי <area>"` or `"מתווכת עצמאית <area>"`. Expect a high rejection rate (~80%): most hits have a real personal website (check the page's "Links" tab under About), are franchise-affiliated, or are stale.

## Public-information-only, source traceability

Only use information the prospect made public themselves (their own Facebook page, their own Yad2 listings). Never bypass a login/CAPTCHA to look at something private. Every qualifying fact needs a source URL recorded — see [`DATA_SOURCING.md`](./DATA_SOURCING.md) and [`VALIDATION.md`](./VALIDATION.md) for exactly what gets stored where.

## Token-efficient research funnel

1. **Fast screen** — can we quickly tell: real owner name, plausible agent photo, one usable property? If no, skip immediately, don't dig further.
2. **Targeted collection** — pull only the fields the qualification table needs.
3. Record result (qualified with score, or rejected with reason) and move to the next candidate.

Do not write long research narratives per candidate — one row in the qualified/rejected table is enough. Deep, source-verified work happens later, per-prospect, only for candidates that make it into an actual demo build (see [`DEMO_GENERATION.md`](./DEMO_GENERATION.md)).
