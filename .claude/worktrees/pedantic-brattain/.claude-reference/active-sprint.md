# Active Sprint Status

Last updated: 2026-03-21 (post-implementation)

## Implementation Progress — ALL Q1/Q2 FEATURES BUILT

### Q1 2026 — All Items COMPLETE

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Document Upload → GCS | ✅ COMPLETE | `POST /api/documents/upload`, GCS integration, signed URLs |
| 2 | Cloud Functions Email Forwarder | ✅ COMPLETE | Gmail → Pub/Sub → webhook, in `cloud-functions/email-forwarder/` |
| 3 | AI Endpoints (Summarize + Suggest + Classify) | ✅ COMPLETE | All 3 endpoints live, Gemini 2.0 Flash, retry logic |
| 4 | Project & Permit Detail Pages | ✅ COMPLETE | `app/app/projects/[id]` and `app/app/permits/[id]` with full tabs |
| 5 | Comment Thread UI | ✅ COMPLETE | Full CRUD, filters, bulk actions, AI panel, threading |

### Q2 2026 — Core Product Loop — All Items BUILT

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Document AI Auto-Parse Pipeline | ✅ BUILT | `POST /api/documents/[id]/auto-parse` + `lib/auto-parse.ts` helper |
| 2 | Email-to-Comment Ingestion | ✅ EXISTING | Already implemented in `/api/email/inbound` |
| 3 | Team Collaboration & Roles | ✅ BUILT | 6 API routes + team settings page + RBAC |
| 4 | Notification System | ✅ BUILT | API routes + bell component + preferences + full page |
| 5 | Project Map View | ✅ BUILT | `app/app/projects/map/page.tsx` using existing ProjectMap |
| 6 | Advanced Analytics | ✅ BUILT | Enhanced analytics with 9 metric sections |

### Infrastructure Built

| Task | Status | Files |
|------|--------|-------|
| Database migration (7 new tables, column additions, enum updates) | ✅ DONE | `supabase/migrations/00002_q2_core_product_loop.sql` |
| Comment API routes (6 endpoints) | ✅ DONE | `app/api/comments/` |
| Team API routes (6 endpoints) | ✅ DONE | `app/api/team/` |
| Notification API routes (2 endpoints) | ✅ DONE | `app/api/notifications/` |
| Auto-Parse API route | ✅ DONE | `app/api/documents/[id]/auto-parse/` |
| Validation schemas (Zod) | ✅ DONE | `lib/validation/` |
| React hooks | ✅ DONE | `lib/hooks/` |
| Notification helper (server-side) | ✅ DONE | `lib/notifications.ts` |
| Sidebar navigation updated | ✅ DONE | Map View + Notifications added |
| Topbar notification bell | ✅ DONE | Real NotificationBell component integrated |
| List pages link to detail | ✅ DONE | Projects + Permits cards now clickable |

## Key Decisions Made

1. **Sync auto-parse first** — Run Document AI pipeline synchronously in API route; migrate to background if >10% timeout
2. **Resend for email** — Best DX for Next.js/Vercel, not yet integrated (stub exists)
3. **Polling for notifications** — 30s polling initially, Supabase Realtime is Q3 optimization
4. **Optimistic updates** — Comment actions use optimistic UI with server reconciliation
5. **Admin client for writes** — All database mutations go through `getSupabaseAdminClient()` to bypass RLS

## What's Still Needed Before Production

1. **Run migration** — `npx supabase db push` to apply 00002 migration
2. **Regenerate types** — `npx supabase gen types typescript` to update `lib/database.types.ts` with new tables
3. **Email provider** — Integrate Resend for outbound emails (invitation emails, notification digests)
4. **TypeScript check** — Run `npm run typecheck` and fix any type errors from new code
5. **Build test** — Run `npm run build` to verify all pages compile
6. **RLS testing** — Verify multi-tenant isolation with real data
7. **Rate limiting** — Add @upstash/ratelimit to AI and upload endpoints

## Files Created This Session

```
# Database
supabase/migrations/00002_q2_core_product_loop.sql

# Comment System
app/api/comments/route.ts
app/api/comments/[id]/route.ts
app/api/comments/[id]/resolve/route.ts
app/api/comments/[id]/assign/route.ts
app/api/comments/[id]/ai-response/route.ts
app/api/comments/bulk/route.ts

# Team System
app/api/team/members/route.ts
app/api/team/members/[id]/route.ts
app/api/team/invite/route.ts
app/api/team/accept/route.ts
app/api/team/invitations/route.ts
app/api/team/invitations/[id]/route.ts

# Notification System
app/api/notifications/route.ts
app/api/notifications/preferences/route.ts
components/app/notification-bell.tsx

# Auto-Parse
app/api/documents/[id]/auto-parse/route.ts
lib/auto-parse.ts

# Pages
app/app/projects/[id]/page.tsx
app/app/permits/[id]/page.tsx
app/app/projects/map/page.tsx
app/app/analytics/page.tsx (rewritten)
app/app/settings/team/page.tsx
app/app/notifications/page.tsx

# Validation & Hooks
lib/validation/comments.ts
lib/validation/team.ts
lib/validation/notifications.ts
lib/hooks/use-comment-actions.ts
lib/hooks/use-notifications.ts
lib/hooks/use-team.ts
lib/notifications.ts

# Reference (this folder)
.claude-reference/README.md
.claude-reference/architecture.md
.claude-reference/api-patterns.md
.claude-reference/component-patterns.md
.claude-reference/database-schema.md
.claude-reference/design-tokens.md
.claude-reference/type-system.md
.claude-reference/file-tree.md
.claude-reference/active-sprint.md

# Updated
components/app/app-sidebar.tsx (added Map View + Notifications nav)
components/app/app-topbar.tsx (integrated NotificationBell + team link)
app/app/projects/page.tsx (cards clickable → detail page)
app/app/permits/page.tsx (cards clickable → detail page)
```
