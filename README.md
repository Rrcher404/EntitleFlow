# EntitleFlow NC — Public Launch Site

EntitleFlow NC is the public marketing site for a North Carolina-first development approval operations platform. It supports outreach, walkthrough booking, early-access capture, and local workflow credibility.

**This is the marketing/launch site only — not the customer application.**

## Stack

- Next.js 16 · React 19 · TypeScript
- Tailwind CSS 4 · shadcn/ui-style components
- Supabase (lead storage) · Vercel Analytics
- Zod + react-hook-form (form validation)

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev                   # http://localhost:3000
```

## Validate before deploy

```bash
npm run typecheck
npm run lint
npm run build
```

## Environment variables

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for the full reference.

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public | Metadata, sitemap, OG tags |
| `NEXT_PUBLIC_CALENDLY_URL` | Public | Walkthrough booking handoff |
| `SUPABASE_URL` | Server only | Lead capture API |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Lead capture API |

**Security note:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are intentionally server-only (no `NEXT_PUBLIC_` prefix). They are only used in `app/api/leads/route.ts`.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step GitHub → Supabase → Vercel instructions.

See [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) for the pre-deploy checklist.

## Lead storage

Form submissions from `/walkthrough` and `/early-access` post to `app/api/leads/route.ts` and are stored in the `marketing_leads` table in Supabase.

The migration is at `supabase/migrations/202603161430_marketing_leads.sql`. Push it with:

```bash
npx supabase link --project-ref <YOUR_PROJECT_REF>
npx supabase db push
```

## Pages

| Route | Purpose |
|---|---|
| `/` | Homepage with hero, product preview, credibility signals |
| `/pricing` | Launch pricing cards and FAQ |
| `/walkthrough` | Walkthrough request form → Calendly handoff |
| `/early-access` | Early-access sign-up form |
| `/compare` | Feature comparison table |
| `/resources` | Guide hub |
| `/product` | Product feature modules |
| `/how-it-works` | Workflow stages |
| `/nc-jurisdictions/greensboro` | Greensboro jurisdiction guide |
| `/nc-jurisdictions/raleigh` | Raleigh jurisdiction guide |
| `/privacy` | Privacy policy |

## Editing content

Most content lives in typed seed files under `data/`:

- `data/home.ts` — homepage hero, audiences, why-now copy
- `data/product.ts` — product modules and differentiators
- `data/pricing.ts` — pricing cards and FAQ
- `data/resources.ts` — guide hub cards
- `data/jurisdictions.ts` — Greensboro and Raleigh pages
- `data/workflow.ts` — workflow stages
- `data/compare.ts` — comparison page
- `data/site.ts` — nav items and credibility signals

## Project structure

```
app/(marketing)/      Public routes + shared layout
app/api/leads/        Lead capture API endpoint
components/site/      Layout and marketing components
components/forms/     Walkthrough and early-access forms
components/ui/        Shared UI primitives (shadcn-style)
data/                 Typed content seed files
lib/leads/            Validation schemas + lead storage adapter
lib/supabase/         Server-side Supabase client
lib/                  Site config, analytics, content helpers, types
supabase/migrations/  Database migrations
```

## Future content migration

The site is code-managed for launch speed. The content layer is adapter-friendly. To move to a CMS or Supabase-managed content:

1. Move `resources` and `jurisdictions` data into Supabase tables
2. Replace the getters in `lib/content.ts`
3. Leave page components untouched
