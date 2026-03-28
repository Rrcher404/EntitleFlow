# Architecture Overview

Last updated: 2026-03-21

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16.1.6, React 19, TypeScript | App Router, strict TS |
| Styling | Tailwind CSS 4, Radix UI, shadcn-style | Light mode ONLY |
| Auth | Supabase Auth (`@supabase/ssr`) | Cookie-based sessions |
| Database | Supabase (Postgres) | RLS on all tables |
| File Storage | Google Cloud Storage (GCS) | Signed URLs for download |
| Document AI | Google Cloud Document AI | PDF parsing + OCR |
| AI/LLM | Vertex AI Gemini 2.0 Flash | Summarize, classify, suggest |
| Background Jobs | Google Cloud Functions | Email forwarder via Pub/Sub |
| Maps | `@vis.gl/react-google-maps` | ProjectMap component |
| Forms | react-hook-form + Zod | Schema-first validation |
| Animation | framer-motion | Sidebar, modals |
| Deployment | Vercel (app), GCP (cloud functions) | Auto-deploy from main |

## Two Apps, One Codebase

1. **Marketing site** — public pages under `app/(marketing)/`, no auth
2. **Authenticated app** — under `app/app/`, requires login

## Auth Flow

```
Login → Supabase email/password or magic link
     → /auth/callback exchanges code
     → Redirect to /app/dashboard
```

## Server vs Client Boundary

- **Server Components:** Use `createServerSupabaseClient()` from `lib/supabase/server.ts`
- **Client Components:** Use `createClient()` from `lib/supabase/client.ts`
- **API Routes:** Use `createServerSupabaseClient()` for auth, `getSupabaseAdminClient()` for writes
- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` in client code

## GCP Integration (lib/gcp/)

- `storage.ts` — GCS upload, signed URL, delete (singleton client)
- `document-ai.ts` — OCR + form parsing, comment extraction
- `vertex-ai.ts` — Gemini classify, summarize, suggest (retry with backoff)
- `config.ts` — Credential handling for local dev + Vercel

## Deployment

- Vercel: `main` branch auto-deploys to production
- Database: `npx supabase db push` for migrations
- Cloud Functions: Manual deploy from `/cloud-functions/`
- Pre-deploy: `npm run typecheck && npm run lint && npm run build`
