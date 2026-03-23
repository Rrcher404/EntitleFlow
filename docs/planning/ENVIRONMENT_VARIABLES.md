# Environment Variables — EntitleFlow NC

## Required variables

| Variable | Scope | Where used | Example |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public (client + server) | Metadata, sitemap, robots.txt, OG tags | `https://entitleflownc.com` |
| `NEXT_PUBLIC_CALENDLY_URL` | Public (client) | Walkthrough form success → booking link | `https://calendly.com/jene/entitleflow-walkthrough` |
| `SUPABASE_URL` | Server only | `lib/supabase/server.ts` → lead API route | `https://abcdefg.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | `lib/supabase/server.ts` → lead API route | `eyJhbGciOi...` (long JWT) |

## Security rules

- **`NEXT_PUBLIC_*` variables** are bundled into the client JavaScript. Only put values here that are safe for anyone to see (URLs, feature flags, etc.).
- **`SUPABASE_URL`** does NOT have the `NEXT_PUBLIC_` prefix. It is only accessed server-side in `app/api/leads/route.ts`. This is intentional.
- **`SUPABASE_SERVICE_ROLE_KEY`** has full database access. It must never be prefixed with `NEXT_PUBLIC_` and must never appear in client components or `"use client"` files.

## Vercel environment setup

When adding variables in Vercel (Settings → Environment Variables):

| Variable | Production | Preview | Development |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://entitleflownc.com` | `https://preview.entitleflownc.com` (or auto) | `http://localhost:3000` |
| `NEXT_PUBLIC_CALENDLY_URL` | Real Calendly URL | Real Calendly URL | Real Calendly URL |
| `SUPABASE_URL` | Production Supabase URL | Same (or staging branch) | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | Production key | Same (or staging branch key) | Local key |

## Local development

```bash
cp .env.example .env.local
# Edit .env.local with your real values
```

## What happens if variables are missing

- **`NEXT_PUBLIC_SITE_URL`**: Falls back to `http://localhost:3000`. Sitemap and OG URLs will be wrong in production.
- **`NEXT_PUBLIC_CALENDLY_URL`**: Falls back to a placeholder URL. Users will see a broken booking link.
- **`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`**: Lead form submissions will fail with a 500 error ("Supabase environment variables are not configured").
