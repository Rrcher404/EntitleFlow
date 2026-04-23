# Claude Code Prompt — EntitleFlow Startup Week Simplification

Copy-paste the block below into a fresh Claude Code session opened in `/Users/jyecemaybury/PermitPilot`. It is self-contained and assumes no prior conversation context.

---

```
I'm Jene. This is the EntitleFlow Next.js 16 / React 19 / TypeScript / Tailwind 4 repo. Marketing site + authenticated app live in the same codebase. Full project context is in CLAUDE.md and .claude-reference/.

I need you to finish a simplification pass that was staged in a prior Cowork session. Everything below is grounded in two docs already in the repo:
- STARTUP_WEEK_PITCH.md — the pitch package I'm using at Greensboro Startup Week (starts Apr 27, 2026)
- SIMPLIFICATION_SPEC.md — the full kill list / keep list / handoff plan

Read both of those first. Everything I'm about to ask is already specified there in more detail.

=== CURRENT REPO STATE ===

- Branch `simplified-wedge` exists locally with commit 3ff4e02 ("feat: simplify marketing site to Parse+Track wedge for Startup Week"). That commit rewrites five data/ seed files: home.ts, product.ts, pricing.ts, compare.ts, site.ts. Verify with: `git log simplified-wedge --oneline -3`.
- Tag `v3-prestartup-archive-20260423` exists locally pointing to 0dc0f32 on main. Verify with: `git tag -l | grep prestartup`.
- Neither the branch nor the tag has been pushed to origin (prior session hit SSH auth blockers in the sandbox).
- My local working tree may currently be on main with the simplified data/ edits showing as uncommitted modifications. If so, just run: `git checkout simplified-wedge` (or `git checkout -- data/ && git checkout simplified-wedge` if it complains about local changes — the changes are already committed on simplified-wedge so it's safe to discard the working tree copy).

=== WHAT I NEED YOU TO DO ===

Work in this order. Stop and ask me if anything is ambiguous or if acceptance criteria fail.

**Step 1 · Verify + push what's staged**

1.1 Make sure you're on `simplified-wedge`. Confirm the commit is there and the data/ diffs match SIMPLIFICATION_SPEC.md's "kill list" and "keep list" sections.

1.2 Push the archive tag: `git push origin v3-prestartup-archive-20260423`

1.3 Push the branch: `git push -u origin simplified-wedge`

**Step 2 · Build the /try landing page**

This is the target of the QR code I'm handing out at Startup Week. It is the single most important net-new work.

Acceptance criteria:
- New route at `app/(marketing)/try/page.tsx`
- Uses the V3 design system tokens defined in CLAUDE.md (deep forest teal primary #0f3c35, warm cream background #f6f5f0, Manrope display font, Instrument Sans body). Light-mode only — no `dark:` variants.
- Hero: "Drop a reviewer redline PDF. Get a structured comment list in under 2 minutes."
- Upload widget: drag-drop OR click to select a PDF. 150 MB per-file limit (same as the existing /api/documents/upload limit).
- On upload: submit to `/api/documents/upload`, then kick the parsed output through `/api/ai/summarize` or `/api/ai/classify` (whichever is further along — check both, pick the one that returns structured comment records). Show a processing animation while it works.
- On success: render the structured comment list on the page (comment text, source page, suggested owner, suggested discipline). Cards styled per the V3 system.
- Email capture below the list: "Want to share this list with your team? Drop your email." Submit to `marketing_leads` via the existing `lib/leads/` adapter.
- Single secondary CTA at the bottom: "Book a 15-minute walkthrough" → `/walkthrough`.
- Route is publicly accessible. No auth required. Use `createServerSupabaseClient()` for the lead-capture write only.

If the existing AI endpoints are too incomplete to power the live demo end-to-end, flag it and propose one of: (a) finish minimal parsing just for this flow, (b) ship /try with a canned sample-PDF demo mode and defer live parsing, (c) point the CTA at `/demo` instead. I'll pick.

**Step 3 · Verify the marketing site picks up the new data**

Run `npm run dev` and walk every route under `app/(marketing)/` plus `/`. Confirm:
- Homepage hero says "Cut redline chaos. Ship the resubmittal clean."
- Two modules only (Redline parsing + Response tracking) — no jurisdiction intelligence pillar, no workflow visibility pillar
- Primary nav shows exactly: Home / How it works / Pricing (+ "Try it" as a button, not nav link)
- Pricing page shows only one tier: EntitleFlow · $299/mo per firm · first month free. No Starter/Growth/Custom/Readiness Sprint tiers. No license taxonomy section.
- Compare page shows 3 rows, not 5
- "NC-only" framing is gone from hero and audience copy; still present in footer nav and /nc-jurisdictions/ pages (that's intentional, those stay as SEO/content)
- `/walkthrough` and `/early-access` forms still work

Any component that hardcodes removed copy (rather than reading from data/) needs to be updated to read from data/. Don't reintroduce the deleted fields.

**Step 4 · Pre-merge checks**

```bash
npm run typecheck
npm run lint
npm run build
```

All three must pass. If anything fails, fix before proceeding.

**Step 5 · Portal sidebar trim (stretch — do only if steps 1-4 land cleanly and there's time)**

For trial users (not yet paying), the portal sidebar should show only: Dashboard, Permits, Documents. Hide Projects (including map view), Analytics, Admin (unless admin role), FlowE until upgraded. This is a stretch goal — not a blocker for Startup Week. Skip if tight on time.

**Step 6 · Archive cleanup**

- Move `permit-readiness-sprint-docs/` to an `archive/` subdirectory (don't delete — we may revive the sprint later). Update any references.
- Check whether the root-level `marketing/` folder and `components/marketing/` folder are both in use. If `marketing/` at root is stale, move it to archive too. If you can't tell, ask me.

**Step 7 · Merge + deploy**

7.1 Open a PR from `simplified-wedge` to `main`. PR description:
- Link to SIMPLIFICATION_SPEC.md
- Confirm the kill list + keep list are honored
- Note that archive tag v3-prestartup-archive-20260423 is the rollback point
- Confirm typecheck/lint/build all pass

7.2 Merge after I review. Don't squash — keep the commit history clean.

7.3 Vercel auto-deploys on merge to main. Confirm the production deploy succeeds and walk the live site one more time — especially /try.

=== CONSTRAINTS ===

- Light mode only. No `dark:` classes. No ThemeProvider.
- Don't switch the stack to Python. Next.js/TypeScript stays. If AI parsing needs a backend rewrite, that's a Q2 project.
- Don't touch portal features (app/app/*) beyond the optional sidebar trim. Portal is the product; marketing shell is the only thing being simplified right now.
- Every /api route that touches user data still needs `supabase.auth.getUser()` check + 401 on unauthenticated (except /try's lead-capture write which is intentionally public).
- `SUPABASE_SERVICE_ROLE_KEY` never appears in client code. Use `getSupabaseAdminClient()` only in server-side route handlers.

=== DEFINITIONS OF DONE ===

- [ ] Tag v3-prestartup-archive-20260423 pushed to origin
- [ ] Branch simplified-wedge pushed to origin
- [ ] /try route live and functional (either with live parse or canned demo + me signed off)
- [ ] Marketing site shows the simplified surface everywhere
- [ ] typecheck + lint + build all green
- [ ] PR opened, reviewed by me, merged
- [ ] Vercel production deploy confirmed
- [ ] /try loads cleanly on mobile (I'll be demoing from my phone)

If you hit a blocker, stop and flag it. Don't silently work around spec mismatches.
```

---

## Context for me (not for Claude Code)

- Paste the block above into Claude Code in this repo's root.
- The session will read SIMPLIFICATION_SPEC.md and STARTUP_WEEK_PITCH.md on its own — both docs are already committed on branch simplified-wedge.
- Expected total time: 2–4 hours for steps 1–4 if AI endpoints are in decent shape. Steps 5–7 add another 1–2 hours.
- Rollback path is the archive tag. If anything explodes post-deploy, `git checkout v3-prestartup-archive-20260423` and cherry-pick a deploy back to that state.
