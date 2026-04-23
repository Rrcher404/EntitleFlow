# EntitleFlow — Simplification Spec (Amputation Plan)

**Prepared:** 2026-04-23
**Branch:** `simplified-wedge`
**Target:** Simplified marketing site + portal ready for Greensboro Startup Week
**Intended executor:** Claude Code (for component/route changes), Jene (for review + merge)
**Status:** Content layer (data/ files) updated in this branch. Component/route layer pending.

---

## Context

Mentor feedback received 2026-04-22: "Great product, but simplify. Focus on one or two main tasks. Get it in front of clients."

Validated through research (Reddit/forums, X/LinkedIn pulse, competitive teardown) and a 7-persona committee brainstorm. Committee and research agreed: the product has too much surface area, too many modules, too many pricing tiers, and too many nav items for a solo founder to deliver or sell.

Decision: amputate to a single wedge — **"Parse PDF → Track Response"** — demonstrated via a single live tool, priced at a single flagship rate, promoted on a simplified marketing site with one primary CTA.

**Territorial scope change:** Previously positioned as "North Carolina-first." Opening up to national ICP. NC stays as the founder's beachhead customer pool and for in-person meetings, but the product positioning no longer constrains geography.

---

## The wedge

### What the product now does (keep)
1. **Redline parsing** — Upload a reviewer redline PDF. Get a structured, assignable comment list in under 2 minutes.
2. **Response tracking** — Assign owners, track status, prep the resubmittal package.

### What the product previously promised (hide or defer)
- ❌ NC Jurisdiction Intelligence (move to content/blog)
- ❌ Approval Workflow Visibility as a top-level pillar (rolls into Response Tracking)
- ❌ Four pricing tiers (Starter / Growth / Custom / Readiness Sprint) → collapse to one flagship price
- ❌ Four license types (Admin / PM / Contributor / Guest Viewer) → hide until we have 10+ paying customers
- ❌ FlowE AI Agents as a separate $30/mo add-on → bundle into the flagship price
- ❌ Permit Readiness Sprint consulting offer → kill or unlist (consulting trap for a solo founder)
- ❌ Greensboro + Raleigh jurisdiction guide pages as primary content (keep live as blog/SEO, demote from nav)

---

## Kill list (surgical)

### Marketing site (`app/(marketing)/`)

| Route | Action | Notes |
|---|---|---|
| `/` (home) | Rewrite | Use new `data/home.ts`. Single hero, single CTA ("Try it with your PDF"), 2 modules, 1 price below the fold. |
| `/pricing` | Rewrite | Collapse to one flagship tier. Kill the Readiness Sprint. Kill the license taxonomy section. |
| `/product` | Demote | Remove from primary nav. Keep page live but strip to 2 modules. Consider merging into `/` long-term. |
| `/compare` | Rewrite | New `data/compare.ts` — 3 rows max. Consider demoting from primary nav. |
| `/how-it-works` | Rewrite | 4 stages → keep, but rewrite copy to match new 2-module product. |
| `/resources` | Keep, demote | Remove from primary nav, keep in footer. |
| `/nc-jurisdictions/[slug]` | Keep, demote | Move entirely to footer + sitemap. SEO value only. |
| `/walkthrough` | Keep | Primary lead form still lives here. CTA copy updated. |
| `/early-access` | Keep | Secondary lead form. |

### Primary nav (`data/site.ts`)

Before: `Home | Pricing | Compare | How it works | Resources | Product` (6 items)
After: `Home | How it works | Pricing | Try it` (4 items — "Try it" is the primary CTA button, not a nav link)

### New route to add

| Route | Purpose |
|---|---|
| `/try` | Landing page behind the Startup Week QR code. Upload widget → parse → structured list → email capture. Connects to existing `/demo` flow or `/api/documents/upload` + parse pipeline. |

### Portal (`app/app/*`)

**Do not touch portal features.** All portal routes stay live — they are the product being sold. The portal simplification can happen post-Startup Week.

However, for the portal sidebar visible to new trial users, consider a "minimum viable portal" view that shows only:
- Dashboard
- Permits (the redline comment tracker)
- Documents

Hide until user upgrades:
- Projects (map view)
- Analytics
- Admin (unless admin role)
- FlowE AI agents (until upgraded)

This is a stretch goal for Startup Week, not a blocker.

---

## Keep list (what ships for Startup Week)

### Marketing homepage (`/`)
- Hero: new headline + subhead + single CTA
- 2-module section (Parse + Track)
- One "Why now" section (3 items)
- One price card
- One testimonial/quote placeholder (blank if no quote yet — hide section, don't fake it)
- One "Try it" CTA row
- Footer

### Product proof (`/how-it-works`)
- 4 stages rewritten to match new wedge
- Real screenshots of the parse + track UI

### Price card (`/pricing`)
- **EntitleFlow** — $299/mo per firm. Unlimited projects, unlimited seats. First month onboarding free.
- One CTA: "Book a walkthrough"
- Below: 3 short FAQs only

### Try-it landing (`/try` — new)
- Upload widget
- Progress animation
- Parsed list display
- Email capture
- "Book a walkthrough" CTA

---

## Branch + archive strategy

### What I did in this session (on branch `simplified-wedge`)
1. Created branch `simplified-wedge` from `main`
2. Rewrote `data/home.ts` for new wedge copy
3. Rewrote `data/product.ts` — collapsed 4 modules to 2
4. Rewrote `data/pricing.ts` — one flagship tier
5. Rewrote `data/compare.ts` — simplified rows
6. Rewrote `data/site.ts` — new nav, new footer
7. Created this `SIMPLIFICATION_SPEC.md`
8. Created `STARTUP_WEEK_PITCH.md`

### What needs to happen next (Claude Code territory)
1. **Archive the current state.** Tag main as `v3-prestartup-archive-20260423` and push the tag.
   ```bash
   git checkout main
   git tag v3-prestartup-archive-20260423
   git push origin v3-prestartup-archive-20260423
   ```

2. **Wire the new data copy to pages.** Most pages should pick up the new data automatically since they import from `data/`. Verify by running `npm run dev` and checking each marketing route.

3. **Build `/try` route.** New page under `app/(marketing)/try/page.tsx`. Reuse existing upload flow from `/api/documents/upload` and the parse logic from `/api/ai/classify` or `/api/ai/summarize`. Stream results to the UI in real time.

4. **Remove/demote routes from primary nav.** Already reflected in `data/site.ts` — confirm the `components/site/nav.tsx` reads from `data/site.ts` and renders correctly.

5. **Archive the `permit-readiness-sprint-docs/` folder** — move it to an `archive/` subdirectory or delete. No longer a product offering.

6. **Clean up the `marketing/` root-level folder** if it's stale (there's also `components/marketing/` which is active — confirm which is in use).

7. **Run typecheck + lint + build before merging.**
   ```bash
   npm run typecheck && npm run lint && npm run build
   ```

8. **Open PR** from `simplified-wedge` → `main`. Review. Merge when clean.

9. **Deploy to Vercel** (auto-deploys on merge to main).

### Timeline to Startup Week

- **Tonight / Apr 23:** Review this spec + pitch doc. Sign off on wedge.
- **Apr 24 (Fri):** Claude Code session — execute component/route changes on branch. Build `/try` landing.
- **Apr 25 (Sat):** QA pass — walk every marketing route, test upload flow end-to-end, fix any breakage.
- **Apr 26 (Sun):** Merge + deploy. Print business cards with QR code pointing to `/try`.
- **Apr 27 (Mon):** Startup Week begins. Pitch on stage if scheduled. Work the floor.

---

## Risk notes

### Risks of amputation
- **SEO regression** — hiding `/nc-jurisdictions/*` and `/resources/*` from primary nav may reduce organic traffic short term. Mitigate: keep them indexed, link from footer.
- **Existing leads confusion** — anyone who previously saw the 4-tier pricing may not recognize the site. Mitigate: keep walkthrough form live, founder-led reach-out for existing leads.
- **Portal users confusion** — existing authenticated users still see the full portal. They're not affected. Only the marketing shell changes.
- **Loss of premium positioning** — $3,500 sprint and $3,500/mo Growth tier disappear. That's intentional. Can reintroduce tiered pricing after 10+ paying customers.

### Risks of not amputating
- Mentor feedback validated across research + committee — the current site is trying to sell more than a solo founder can deliver.
- Greensboro Startup Week is a time-boxed forcing function. Shipping the simplified version by Apr 27 beats shipping a polished-but-scattered version in May.

### Rollback plan
- Branch `simplified-wedge` keeps the old main clean.
- Archive tag `v3-prestartup-archive-20260423` lets us restore the old site in minutes if needed.
- Vercel always has prior deployments — one-click rollback available.

---

## Success metrics (30 days post-Startup Week)

- **Leading indicators:** pilots booked, emails captured, walkthroughs completed, `/try` uploads completed.
- **Lagging indicators:** first paid customer, MRR, referral signups.
- **Kill criteria:** if we have <1 pilot firm committed by May 15, go back to the drawing board on the wedge. Not the simplification — that stands regardless. But the specific wedge (parse + track) gets re-evaluated.

---

## Open questions for Jene

1. **Price point** — $299/mo is my recommendation. Change to $199, $249, or $499 if you have strong preference. Higher prices signal enterprise, lower prices signal prosumer. $299 splits the difference.
2. **Brand voice for hero** — I drafted "Cut redline chaos. Ship the resubmittal clean." Alternatives: "Stop retyping PDFs. Start shipping resubmittals." / "From reviewer redlines to resubmittal — in minutes, not days."
3. **Timing of archive branch** — do the archive tag + branch push now on `main` before the PR merge, or after?
4. **Committee priority for pilots** — NC-first (lower friction) or open from day one (wider net)?

---

## Committee reference (for the record)

The 7-persona committee that stress-tested this plan:

1. **Marcus, 47, solo NC architect** — validated both wedges as must-haves together.
2. **Priya, 29, junior structural engineer** — loved the parse, warned about selling to principals not users.
3. **Ray, 58, developer** — wanted timeline risk dashboard (deferred, not killed).
4. **Jordan, 34, ex-YC founder** — pushed for demo-only-A party trick on stage. Adopted.
5. **Deb, 62, retired Greensboro planner** — suggested response letter quality as alt wedge (deferred to Q2).
6. **Tomas, 41, GC ops lead** — noted buyer is PM/ops, not architect (factored into pricing + pitch).
7. **Aisha, 31, AEC product designer** — "three taps to magic" UX bar. Adopted for `/try` page spec.
