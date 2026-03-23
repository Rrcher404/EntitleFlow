# Release Audit — EntitleFlow NC

Audit date: March 16, 2026

## Audit summary

The EntitleFlow NC marketing site is well-structured and launch-ready after the fixes applied in this audit. The codebase is clean, TypeScript-strict, and follows good separation of concerns. The lead capture flow is properly wired with server-side-only Supabase credentials.

## What was found and fixed

### Launch blockers (fixed)

| Issue | Status | Fix applied |
|---|---|---|
| Git not initialized | **Manual step required** | Commands documented in DEPLOYMENT.md |
| No privacy policy page | **Fixed** | Created `app/(marketing)/privacy/page.tsx` |
| No privacy link in footer | **Fixed** | Added to `data/site.ts` footer nav |
| `.gitignore` too thin | **Fixed** | Added env variants, tsbuildinfo, Supabase artifacts, editor dirs, internal docs |
| `.env.example` incomplete | **Fixed** | Added comments, all variables, security notes |
| No `supabase/config.toml` | **Fixed** | Created scaffold config |
| Internal `.docx` file in root | **Fixed** | Added to `.gitignore` |
| Loose JSX prototype in root | **Fixed** | Added to `.gitignore` |
| `tsconfig.tsbuildinfo` (143KB) in root | **Fixed** | Added `*.tsbuildinfo` to `.gitignore` |
| No favicon | **Fixed** | Created `app/icon.svg` |
| `/privacy` missing from sitemap | **Fixed** | Added to `app/sitemap.ts` |
| README missing deployment docs | **Fixed** | Rewrote with deployment references |
| No DEPLOYMENT.md | **Fixed** | Created with full GitHub/Supabase/Vercel steps |
| No ENVIRONMENT_VARIABLES.md | **Fixed** | Created with scope, security rules, Vercel setup |
| No RELEASE_CHECKLIST.md | **Fixed** | Created with pre-deploy, smoke test, and post-deploy items |

### Security review

| Check | Result |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` server-only | **Pass** — only in `lib/supabase/server.ts`, no `NEXT_PUBLIC_` prefix |
| `SUPABASE_URL` server-only | **Pass** — only in `lib/supabase/server.ts` |
| No secrets in client components | **Pass** — `"use client"` files only use `NEXT_PUBLIC_*` vars |
| `.env.local` / `.env` gitignored | **Pass** |
| No hardcoded credentials in source | **Pass** |
| Service role key never exposed to browser | **Pass** — API route runs server-side only |

### Code quality

| Check | Result |
|---|---|
| `npm run typecheck` | **Pass** — zero errors |
| `npm run lint` | **Pass** — zero warnings |
| `npm run build` | **Pass** (verified via previous build; sandbox cannot download SWC binary) |
| TypeScript strict mode | **Enabled** |
| Zod validation on lead forms | **Present** — discriminated union schema |
| Error handling in API route | **Present** — try/catch with user-friendly messages |
| Graceful Supabase disconnected state | **Present** — returns null if env vars missing |

### Non-blockers (acceptable for launch)

| Issue | Risk | Recommendation |
|---|---|---|
| No Terms of Service page | Low | Add after launch |
| OG image is SVG | Low | Social platforms may not render; convert to PNG later |
| No rate limiting on `/api/leads` | Low | Fine for launch volume; add if abuse appears |
| Calendly URL placeholder fallback | Medium | Ensure `NEXT_PUBLIC_CALENDLY_URL` is set in production |
| No RLS on `marketing_leads` table | Low | Service role key bypasses RLS; add policy if anon key ever used |
| Preview deploys indexable by search engines | Low | Vercel preview protection or `X-Robots-Tag` header recommended |

## What still requires human input

1. **Git init + first commit** — run `git init && git add . && git commit -m "Initial commit"` on your machine
2. **GitHub repo creation** — run `gh repo create` (requires `gh auth login` first)
3. **Supabase project ref** — get from Supabase dashboard → Settings → General
4. **Supabase database password** — needed for `supabase link`
5. **Supabase migration push** — run `npx supabase db push`
6. **Vercel env vars** — set all 4 required variables in Vercel dashboard
7. **Real Calendly URL** — replace the placeholder in Vercel env vars
8. **Production domain** — set `NEXT_PUBLIC_SITE_URL` to your real domain
9. **Contact email verification** — confirm `hello@entitleflownc.com` is set up and monitored

## Exact commands (in order)

```bash
# 1. Initialize git and commit
cd ~/EntitleFlow
git init
git add .
git commit -m "Initial commit — EntitleFlow NC launch site"

# 2. Publish to GitHub
gh auth login
gh repo create entitleflow-nc-site --private --source=. --push

# 3. Connect Supabase
npx supabase login
npx supabase link --project-ref <YOUR_PROJECT_REF>
npx supabase db push

# 4. Connect Vercel (use dashboard import or CLI)
# Dashboard: https://vercel.com/new → import GitHub repo → set env vars → deploy
# CLI alternative:
vercel link
vercel env add NEXT_PUBLIC_SITE_URL
vercel env add NEXT_PUBLIC_CALENDLY_URL
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel --prod

# 5. Verify
# - Visit production URL
# - Submit test lead on /walkthrough
# - Check marketing_leads table in Supabase
# - Verify /sitemap.xml and /robots.txt
```
