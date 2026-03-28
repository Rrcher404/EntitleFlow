# EntitleFlow — Cowork Project Instructions

## What This Project Is

EntitleFlow is a North Carolina-first **land entitlement operations platform** — the operating system for teams managing development approval workflows. The core problem it solves: after a permit set is submitted to a municipality, teams receive PDF redline packages full of reviewer comments with no structured way to track, assign, respond to, or resolve them. EntitleFlow replaces spreadsheets and email chains with a structured workspace for the post-submission review cycle.

The repo at `/PermitPilot` contains two things in one codebase:
1. **The marketing site** — a public-facing Next.js site for outreach, lead capture, and early-access signup (currently deployed at entitleflow.com)
2. **The authenticated app** — a permit comment tracker and project management platform that lives under the `/app` route group

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6, React 19, TypeScript |
| Styling | Tailwind CSS 4, Radix UI primitives, shadcn-style components |
| Auth | Supabase Auth (`@supabase/ssr`) with cookie-based sessions |
| Database | Supabase (Postgres) |
| File Storage | Google Cloud Storage (GCS) |
| Document Intelligence | Google Cloud Document AI |
| AI/LLM | Vertex AI — Gemini (summarize + suggest-response endpoints) |
| Background Jobs | Google Cloud Functions (email forwarder via Pub/Sub) |
| Maps | `@vis.gl/react-google-maps` |
| Forms | react-hook-form + Zod |
| Animation | framer-motion |
| Deployment | Vercel (marketing + app), GCP (cloud functions) |
| Analytics | Vercel Analytics |

---

## Repository Structure

```
app/
  (marketing)/        Public marketing pages — home, pricing, product, compare, resources, how-it-works, jurisdictions
  (auth)/             Login, signup, auth callback (Supabase)
  app/                Authenticated portal — dashboard, projects, permits, documents, analytics, settings
  demo/               Public demo portal (no auth required)
  admin/              Admin area
  api/                API routes: leads, documents/upload, ai/summarize, ai/suggest-response

components/
  site/               Nav, footer, marketing layout components
  marketing/          Hero, feature grid, how-it-works, CTA, trust band, dashboard preview
  forms/              Walkthrough and early-access lead capture forms
  app/                App sidebar, topbar (authenticated portal shell)
  portal/             Portal sidebar, topbar, stat cards, activity feed, project table, permit card, analytics chart
  ui/                 Shared UI primitives (Button, Card, Input, etc.)
  maps/               ProjectMap component (Google Maps)

data/                 Typed content seed files: home.ts, product.ts, pricing.ts, resources.ts, jurisdictions.ts, workflow.ts, compare.ts, site.ts
lib/
  supabase/           client.ts (browser), server.ts (server + admin), middleware.ts (session mgmt)
  leads/              Zod validation schemas + lead storage adapter
  content.ts          Content helpers
  site.ts             Site config
supabase/migrations/  DB migrations (marketing_leads table)
cloud-functions/      GCP Cloud Functions source (email forwarder)
scripts/              Utility scripts
```

---

## Design System — V3 (Light Only)

**Critical: This project is light-mode only. Never add dark mode classes or `dark:` variants. The `next-themes` ThemeProvider has been removed.**

### Color Tokens (CSS Variables)
```
--background:          #f6f5f0   warm cream page background
--foreground:          #102034   deep navy-slate text
--card:                #ffffff   pure white card surface
--primary:             #0f3c35   deep forest teal (brand color)
--primary-foreground:  #f8fafc
--secondary:           #edf3f2   pale teal-gray
--muted:               #f0f2f4   cool light gray
--muted-foreground:    #5a6676
--accent:              #dff2ef   light teal wash
--border:              #e2e5e5
--ring:                #25a18e   (focus ring, interactive teal)
```

### Typography
- **Display / headings**: Manrope (`font-display`) — use `font-weight: 700–800`, tight `letter-spacing`
- **Body**: Instrument Sans (`font-sans`) — `line-height: 1.6`, regular weight
- Heading size scale: `text-4xl`/`text-5xl` for hero, `text-2xl`/`text-3xl` for section headers, `text-base`/`text-sm` for body

### Component Conventions
- Cards: `rounded-xl`, `border border-border`, `bg-card`, `shadow-sm`
- Buttons: Use `bg-primary text-primary-foreground` for primary CTAs; `border border-border bg-card` for secondary
- Eyebrow labels: small caps, `text-primary`, `text-xs font-semibold tracking-widest uppercase`
- Status badges: Use the `StatusBadge` component in `components/marketing/status-badge.tsx`
- Spacing: Section padding `py-16 md:py-24`, container `max-w-6xl mx-auto px-4 md:px-8`

---

## Authentication & Route Protection

- **Public routes**: Everything under `(marketing)` — no auth required
- **Protected routes**: Everything under `/app/*` — redirects to `/login` if not authenticated
- **Auth flow**: Supabase email/password or magic link → `/auth/callback` exchanges code → redirect to `/app/dashboard`
- **Server components**: Use `createServerSupabaseClient()` from `lib/supabase/server.ts`
- **Client components**: Use `createClient()` from `lib/supabase/client.ts`
- **API routes**: Always authenticate via `createServerSupabaseClient()` and check `supabase.auth.getUser()` before processing — return 401 if not authenticated
- **Admin operations**: Use `getSupabaseAdminClient()` (service role) — only in server-side code, never in client components

---

## Environment Variables

```bash
# Public (safe to expose to browser)
NEXT_PUBLIC_SITE_URL=https://entitleflow.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/...

# Server-only (NEVER prefix with NEXT_PUBLIC_)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Security rule**: `SUPABASE_SERVICE_ROLE_KEY` has full database access. It must never appear in any file with `'use client'` or any component rendered in the browser.

---

## Current Sprint — Q1 2026 (Active Development)

These are the items being built right now. When working on the app, prioritize completing these:

1. **Document Upload → GCS** (`in-progress`): Connect the documents page upload form to `/api/documents/upload`. Files should store in Cloud Storage; the endpoint currently only creates DB records.

2. **Cloud Functions Email Forwarder** (`ready`): Deploy the email-forwarder Cloud Function in `/cloud-functions/`. Set up Gmail watch for Pub/Sub push notifications. This replaces an Apps Script polling approach with real-time processing.

3. **AI Endpoints — Summarize + Suggest** (`in-progress`): Complete `/api/ai/summarize` and `/api/ai/suggest-response`. These use Vertex AI (Gemini). The stubs exist — they need full Gemini integration, prompt engineering, and error handling.

4. **Project & Permit Detail Pages** (`in-progress`): Individual project and permit views with full CRUD editing, status timeline, linked documents, comment threads, and activity history. Lives in `app/app/projects/[id]/` and `app/app/permits/`.

5. **Comment Thread UI** (`planned`): Interface to view parsed comments per permit, resolve/unresolve them, assign to team members, and draft AI-assisted responses. This is the core value-delivery feature.

---

## Roadmap Context — What's Coming Next

**Q2 2026 — Core Product Loop:**
- Document AI Auto-Parse Pipeline: PDF upload → Document AI → extract comments → Vertex AI classify → create comment records (zero-touch)
- Email-to-Comment Ingestion: Inbound reviewer emails auto-parsed to structured comments, matched to permit by permit number
- Team Collaboration & Roles: Invite team members, assign roles (owner/admin/member/viewer), assign comments
- Notification System: In-app + email digests for status changes, deadlines, assigned tasks
- Project Map View: Wire `ProjectMap` component into projects page with status filters
- Advanced Analytics: Permit approval timelines, comment resolution rates, reviewer patterns

**Q3–Q4 2026 — Scale & Differentiate:**
- Jurisdiction API Integrations: Direct connections to Greensboro, Raleigh, Charlotte municipal permit systems
- AI Response Drafting: Full response letters to reviewer comments using project + permit + jurisdiction context
- Resubmittal Package Builder: Compile resolved comments, response letters, updated drawings into a single resubmittal PDF
- Multi-Jurisdiction Expansion: SC, VA, GA, TN markets
- Client Portal: White-labeled read-only project status sharing for clients
- Stripe Billing: Subscription tiers with seat-based billing
- Mobile App: React Native for field teams

---

## Product & Business Context

**Target users**: NC-based land development teams — architects, engineers, contractors, developers, and property managers managing municipal permit review cycles.

**Core value proposition**: Saves 10+ hours per permit cycle by replacing the current workflow of manually tracking reviewer PDF comments in spreadsheets and coordinating responses over email.

**Strategic phases**:
- Phase 1 (Now–Q2 2026): Comment tracker MVP — upload → AI parse → assign → respond → resubmit
- Phase 2 (Q2–Q3 2026): Full workflow platform — team collab, email ingestion, jurisdiction integrations
- Phase 3 (Q3–Q4 2026): Intelligence layer — ML timeline predictions, automated response drafting
- Phase 4 (2027+): National expansion, mobile, billing

**Jurisdictions currently targeted**: Greensboro, Raleigh (jurisdiction-specific pages exist at `/nc-jurisdictions/[city]`)

**Pricing approach**: Early-access, founder-led onboarding, NC-first positioning. Stripe billing is a Q3 2026 roadmap item — no live payments yet.

---

## Content Architecture

Most marketing copy lives in typed seed files under `data/`. When updating marketing content, edit these files — do not hardcode content in page components:

| File | Controls |
|---|---|
| `data/home.ts` | Homepage hero, audience callouts, why-now copy |
| `data/product.ts` | Product modules and differentiators |
| `data/pricing.ts` | Pricing cards and FAQ |
| `data/resources.ts` | Guide hub cards |
| `data/jurisdictions.ts` | Greensboro and Raleigh jurisdiction pages |
| `data/workflow.ts` | How-it-works workflow stages |
| `data/compare.ts` | Competitor comparison table |
| `data/site.ts` | Nav items and credibility signals |

---

## Key Development Rules

1. **TypeScript is strict.** Always run `npm run typecheck` before considering any work done. No `any` types without explicit justification.

2. **Light-mode only.** No `dark:` Tailwind classes. No `useTheme()`. No ThemeProvider. The V3 design system is canonical and light-only.

3. **Server/client boundary.** Supabase server client (`createServerSupabaseClient`) is for Server Components and Route Handlers only. Browser client (`createClient`) is for `'use client'` components only. Never cross these.

4. **Service role key stays server-side.** `SUPABASE_SERVICE_ROLE_KEY` must never appear in client code. Only use `getSupabaseAdminClient()` in Route Handlers or server-side functions.

5. **Forms use react-hook-form + Zod.** All form validation is schema-first with Zod. Schemas live in `lib/leads/` (lead forms) and adjacent schema files for app forms.

6. **API routes check auth.** Every `/api/` route that touches permit, project, or document data must verify the session via `supabase.auth.getUser()` and return a `401` before any data operation.

7. **Content edits go in `data/`.** Don't hardcode marketing copy in page components. Use the seed files.

8. **GCP credentials.** Document AI, GCS, and Vertex AI require GCP service account credentials. These are handled via environment variables / Application Default Credentials — never commit credential JSON files.

9. **Pre-deploy checklist.** Run `npm run typecheck && npm run lint && npm run build` before any production deploy. See `RELEASE_CHECKLIST.md` for the full checklist.

10. **Lead capture.** The `marketing_leads` Supabase table stores walkthrough and early-access form submissions. The migration is in `supabase/migrations/`. Schema changes go through `npx supabase db push`.

---

## When to Use Which Component Layer

| Task | Use |
|---|---|
| New marketing section | `components/marketing/` + wire into `app/(marketing)/` page |
| New app feature (authenticated) | `app/app/[feature]/page.tsx` + `components/app/` or new feature folder |
| New form | `components/forms/`, schema in `lib/`, submit to `/api/` Route Handler |
| Shared UI primitive (button, input, etc.) | `components/ui/` |
| Portal layout element | `components/portal/` (sidebar, topbar, stat cards) |
| Data displayed on a marketing page | Update `data/[page].ts` |
| New API endpoint | `app/api/[name]/route.ts`, always auth-check first |

---

## Deployment Stack

- **Hosting**: Vercel — `main` branch auto-deploys to production; feature branches get preview deployments
- **Database**: Supabase hosted Postgres
- **File storage**: Google Cloud Storage bucket
- **AI/ML**: Vertex AI (Gemini) via `@google-cloud/vertexai`
- **Document parsing**: Google Cloud Document AI via `@google-cloud/documentai`
- **Background functions**: Google Cloud Functions (email forwarder in `/cloud-functions/`)
- **Analytics**: Vercel Analytics (already wired in `app/layout.tsx`)

---

## Quick Reference Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run typecheck    # TypeScript check (must pass before deploy)
npm run lint         # ESLint check (must pass before deploy)
npm run build        # Production build (must succeed before deploy)

npx supabase link --project-ref <REF>   # Link to Supabase project
npx supabase db push                    # Push migrations to Supabase
```
