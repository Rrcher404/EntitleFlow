# Release Checklist — EntitleFlow NC

Use this checklist before each production deploy.

## Pre-push validation

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] No `.env.local` or secret files staged (`git status`)
- [ ] No hardcoded API keys, tokens, or passwords in source

## Environment variables

- [ ] `NEXT_PUBLIC_SITE_URL` set to production domain in Vercel
- [ ] `NEXT_PUBLIC_CALENDLY_URL` set to real Calendly link in Vercel
- [ ] `SUPABASE_URL` set in Vercel (server-only, no NEXT_PUBLIC_ prefix)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Vercel (server-only, no NEXT_PUBLIC_ prefix)

## Supabase

- [ ] `marketing_leads` migration pushed (`npx supabase db push`)
- [ ] Table exists in Supabase dashboard with correct columns and indexes
- [ ] RLS is configured (migration creates table without RLS — service role key bypasses it, but review if anon key is ever used)

## Pages smoke test

- [ ] `/` loads with correct hero, nav, footer
- [ ] `/pricing` renders pricing cards
- [ ] `/walkthrough` form submits successfully, Calendly handoff works
- [ ] `/early-access` form submits successfully, success state renders
- [ ] `/compare` comparison table renders
- [ ] `/resources` guide cards render
- [ ] `/product` feature modules render
- [ ] `/how-it-works` workflow stages render
- [ ] `/nc-jurisdictions/greensboro` jurisdiction page loads
- [ ] `/nc-jurisdictions/raleigh` jurisdiction page loads
- [ ] `/privacy` privacy policy page loads
- [ ] `/sitemap.xml` returns valid XML with all routes
- [ ] `/robots.txt` allows crawling

## Lead flow end-to-end

- [ ] Submit walkthrough form → row appears in `marketing_leads` with intent = `walkthrough`
- [ ] Submit early-access form → row appears in `marketing_leads` with intent = `early-access`
- [ ] Calendly link after walkthrough submit opens correct booking page

## SEO and metadata

- [ ] OG tags render correctly (check with https://www.opengraph.xyz/)
- [ ] Page titles include `| EntitleFlow NC`
- [ ] Canonical URLs use production domain
- [ ] Favicon renders in browser tab

## Trust and credibility

- [ ] Footer contact email is real and monitored
- [ ] Privacy policy page is linked in footer
- [ ] Disclaimer text is present in footer
- [ ] No placeholder text visible on any page (e.g., "your-handle", "lorem ipsum")

## Post-deploy

- [ ] Vercel Analytics receiving events
- [ ] Custom domain configured (if applicable)
- [ ] DNS propagated
- [ ] HTTPS working
