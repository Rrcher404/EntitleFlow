# File Tree Reference

Last updated: 2026-03-21

## Top Level
```
app/                    Next.js App Router pages and API routes
components/             React components organized by domain
data/                   Typed content seed files for marketing pages
lib/                    Shared utilities, types, clients, validation
supabase/               Database migrations and config
cloud-functions/        GCP Cloud Functions (email forwarder)
public/                 Static assets
scripts/                Utility scripts
.claude-reference/      THIS FOLDER - codebase analysis for AI sessions
```

## app/ (Pages & Routes)

```
app/
├── (marketing)/              Public marketing pages (no auth)
│   ├── page.tsx              Homepage
│   ├── pricing/              Pricing page
│   ├── product/              Product page
│   ├── compare/              Competitor comparison
│   ├── resources/            Resource hub
│   ├── how-it-works/         Workflow explainer
│   └── nc-jurisdictions/     Jurisdiction-specific pages
│       └── [city]/           Dynamic city pages
│
├── (auth)/                   Auth pages
│   ├── login/                Login
│   ├── signup/               Signup
│   └── auth/callback/        OAuth callback
│
├── app/                      Authenticated portal
│   ├── layout.tsx            Shell (sidebar + topbar)
│   ├── page.tsx              Redirect to dashboard
│   ├── dashboard/            KPI dashboard
│   ├── projects/             Project list + CRUD
│   │   └── [id]/             Project detail (Q1 build) ← NEW
│   ├── permits/              Permit list + CRUD
│   │   └── [id]/             Permit detail (Q1 build) ← NEW
│   ├── documents/            Document management
│   ├── analytics/            Analytics dashboard
│   ├── settings/             User + org settings
│   │   └── team/             Team management (Q2 build) ← NEW
│   └── notifications/        Notification center (Q2 build) ← NEW
│
├── demo/                     Public demo (no auth)
├── admin/                    Admin panel (super_admin only)
│
└── api/                      API routes
    ├── documents/
    │   ├── upload/            POST - file upload to GCS
    │   └── [id]/
    │       ├── parse/         POST - Document AI parsing
    │       ├── download/      GET - signed download URL
    │       └── auto-parse/    POST - zero-touch pipeline (Q2)
    ├── ai/
    │   ├── summarize/         POST - Vertex AI summarize
    │   ├── suggest-response/  POST - AI response suggestion
    │   └── classify/          POST - comment classification
    ├── comments/              ← NEW (Q1 build)
    │   ├── route.ts           GET (list) + POST (create)
    │   ├── [id]/
    │   │   ├── route.ts       GET + PATCH + DELETE
    │   │   ├── resolve/       POST - mark resolved
    │   │   ├── assign/        POST - assign to user
    │   │   └── ai-response/   POST - get AI suggestion
    │   └── bulk/              POST - bulk operations
    ├── team/                  ← NEW (Q2 build)
    │   ├── invite/            POST - send invitation
    │   ├── accept/            POST - accept invitation
    │   ├── members/           GET (list)
    │   │   └── [id]/          PATCH (role) + DELETE (remove)
    │   └── invitations/       GET (list)
    │       └── [id]/          DELETE (revoke)
    ├── notifications/         ← NEW (Q2 build)
    │   ├── route.ts           GET (list) + PATCH (mark read)
    │   └── preferences/       GET + PUT
    ├── email/
    │   ├── inbound/           POST - webhook for forwarded emails
    │   └── send/              POST - outbound (stub)
    ├── geocode/               GET - server-side geocoding
    ├── leads/                 POST - marketing lead capture
    └── admin/                 Admin endpoints
```

## components/

```
components/
├── ui/                 Shared primitives (~48 components)
│   ├── button.tsx, card.tsx, input.tsx, skeleton.tsx
│   ├── aceternity-sidebar.tsx (SidebarProvider)
│   ├── floating-action-menu.tsx
│   ├── onboarding-dialog.tsx
│   └── ... many more
├── app/                App shell
│   ├── app-sidebar.tsx
│   ├── app-topbar.tsx
│   └── notification-bell.tsx  ← NEW (Q2)
├── portal/             Portal layout
│   ├── portal-sidebar.tsx
│   └── portal-topbar.tsx
├── marketing/          Marketing page sections
├── forms/              Lead capture forms
├── maps/               Google Maps
│   ├── ProjectMap.tsx
│   └── AddressGeocoder.tsx
└── comments/           ← NEW (Q1 build)
    ├── comment-card.tsx
    ├── comment-list.tsx
    ├── comment-filter-bar.tsx
    ├── bulk-actions-toolbar.tsx
    └── ai-response-panel.tsx
```

## lib/

```
lib/
├── supabase/
│   ├── server.ts       createServerSupabaseClient() + getSupabaseAdminClient()
│   ├── client.ts       createClient() for browser
│   └── middleware.ts    Auth middleware
├── gcp/
│   ├── storage.ts      GCS upload, signed URL, delete
│   ├── document-ai.ts  OCR + form parsing
│   ├── vertex-ai.ts    Gemini classify, summarize, suggest
│   └── config.ts       GCP credential handling
├── email/
│   ├── parser.ts       Email parsing utilities
│   └── types.ts        Email type definitions
├── types/
│   ├── index.ts        Type aliases + composite types
│   └── enums.ts        Enum types + labels + colors
├── validation/         ← NEW
│   ├── comments.ts     Zod schemas for comments
│   ├── team.ts         Zod schemas for team ops
│   └── notifications.ts Zod schemas for notifications
├── hooks/              ← NEW
│   ├── use-comment-actions.ts  Optimistic comment operations
│   ├── use-notifications.ts    Notification polling
│   └── use-team.ts             Team management
├── notifications.ts    ← NEW server-side notification helper
├── admin/auth.ts       Admin role verification
├── database.types.ts   Auto-generated Supabase types
├── utils.ts            General utilities (cn, etc.)
├── content.ts          Content helpers
├── fonts.ts            Font configuration
└── site-config.ts      Marketing site config
```

## data/ (Marketing Content)

```
data/
├── home.ts             Homepage hero, audience, why-now
├── product.ts          Product modules, differentiators
├── pricing.ts          Pricing cards, FAQ
├── resources.ts        Guide hub cards
├── jurisdictions.ts    Greensboro/Raleigh pages
├── workflow.ts         How-it-works stages
├── compare.ts          Competitor comparison
└── site.ts             Nav items, credibility signals
```
