# Deployment Guide — EntitleFlow NC

This document covers the exact steps to deploy the EntitleFlow NC marketing site using GitHub, Supabase, and Vercel.

## Prerequisites

- Node.js 20+
- GitHub CLI (`gh`) authenticated
- Supabase CLI (`npx supabase`)
- Vercel account (free tier is fine)
- A Supabase project (create at https://supabase.com/dashboard)

## 1. Publish to GitHub

```bash
# From the project root:
git init
git add .
git commit -m "Initial commit — EntitleFlow NC launch site"

# Create a private repo (change to --public when ready)
gh repo create entitleflow-nc-site --private --source=. --push
```

## 2. Connect Supabase

```bash
# Log in to Supabase CLI (opens browser for auth)
npx supabase login

# Link to your hosted project (get project ref from Supabase dashboard → Settings → General)
npx supabase link --project-ref <YOUR_PROJECT_REF>
# You will be prompted for your database password.

# Push the marketing_leads migration
npx supabase db push
```

### Verify migration

1. Open Supabase dashboard → Table Editor
2. Confirm `marketing_leads` table exists with all expected columns
3. Check indexes: `marketing_leads_intent_idx` and `marketing_leads_created_at_idx`

## 3. Connect Vercel

### Option A: Vercel Dashboard (recommended)

1. Go to https://vercel.com/new
2. Import the GitHub repo you just created
3. Framework preset: **Next.js** (auto-detected)
4. Set environment variables (see ENVIRONMENT_VARIABLES.md):
   - `NEXT_PUBLIC_SITE_URL` = your production domain (e.g., `https://entitleflownc.com`)
   - `NEXT_PUBLIC_CALENDLY_URL` = your real Calendly booking link
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key
5. Deploy

### Option B: Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Link to a new project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SITE_URL
vercel env add NEXT_PUBLIC_CALENDLY_URL
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy to production
vercel --prod
```

## 4. Verify production

After deploying:

1. Visit the production URL and confirm all pages load
2. Submit a test lead through `/walkthrough` and `/early-access`
3. Check Supabase dashboard → Table Editor → `marketing_leads` for new rows
4. Verify Calendly handoff link works after walkthrough submission
5. Check `/sitemap.xml` and `/robots.txt` render correctly
6. Confirm OG metadata with https://www.opengraph.xyz/

## Branch strategy

- `main` → production deploys
- Feature branches → Vercel preview deploys (automatic)
- Never commit `.env.local` or secrets to any branch

## Custom domain

1. Vercel dashboard → Project → Settings → Domains
2. Add your domain and follow DNS instructions
3. Update `NEXT_PUBLIC_SITE_URL` in Vercel env vars to match the new domain
4. Redeploy to pick up the URL change in metadata and sitemap
