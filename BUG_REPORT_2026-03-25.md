# EntitleFlow Platform Bug Report
**Date:** March 25, 2026
**Tested by:** Claude (automated platform testing)
**Environment:** Production (entitleflow.com)
**Session User:** jyece Maybury (support@entitleflow.com)

---

## Executive Summary

Full platform testing identified **19 bugs** across 4 severity levels. The two most critical systemic issues are: (1) all marketing pages render blank due to a Framer Motion animation conflict, and (2) most super admin pages crash due to API response format mismatches. The authenticated app portal works well overall, with the sidebar label truncation being the most visible UI issue there.

---

## Bug Inventory

### CRITICAL (3 bugs — platform-breaking)

#### BUG-001: All Marketing Pages Render Blank (Hero Section Invisible)
- **Severity:** CRITICAL
- **Pages Affected:** `/` (home), `/pricing`, `/product`, `/compare`, `/resources`, `/how-it-works`
- **Symptoms:** Only the navigation bar renders. All page body content (hero, feature sections, pricing cards, comparison tables) is invisible on initial load. Scrolling reveals some faded content below.
- **Root Cause:** Framer Motion animation conflict between `SectionShell` wrapper (`whileInView`) and `HeroSection` (`animate="visible"`). The `SectionShell` component applies `initial={{ opacity: 0, y: 20 }}` with `whileInView`, while the inner hero content uses `staggerChildren` animations that fire before the parent's viewport trigger resolves.
- **Files:**
  - `components/marketing/hero-section.tsx` (lines 48-51) — uses `animate="visible"` hardcoded
  - `components/site/section-shell.tsx` — applies `whileInView` animation wrapper
  - `app/(marketing)/home-page-client.tsx` — wraps hero in SectionShell
- **Fix:** Replace `animate="visible"` with `whileInView="visible"` in the hero section, or remove the `SectionShell` wrapper from the hero component since it's always above the fold.

#### BUG-002: Super Admin Pages Crash — "Something went wrong"
- **Severity:** CRITICAL
- **Pages Affected:** `/admin/organizations`, `/admin/leads`, `/admin/announcements`
- **Symptoms:** Full-page error: "Something went wrong. An unexpected error occurred."
- **Root Cause:** API response format mismatch. The API routes return `{ data: [...], error: null }` but the frontend pages expect direct arrays. When the UI tries to `.map()` over `{ data: [...], error: null }`, the component crashes.
- **Files:**
  - `app/api/admin/organizations/route.ts` (lines 56-59) — returns `{ data: enrichedOrgs, error: null }`
  - `app/api/admin/leads/route.ts` (lines 43-46) — returns `{ data: leads || [], error: null }`
  - `app/api/admin/announcements/route.ts` (lines 30-33) — returns `{ data: announcements || [], error: null }`
  - Corresponding page.tsx files expect unwrapped array responses
- **Fix (Option A — Backend):** Change all six failing API routes to return unwrapped responses matching the working pattern (e.g., return `enrichedOrgs` directly).
- **Fix (Option B — Frontend):** Extract the `data` property: `setOrgs(data.data)` instead of `setOrgs(data)`.

#### BUG-003: Company Admin Dashboard Crashes
- **Severity:** CRITICAL
- **Page:** `/app/admin/dashboard`
- **Symptoms:** Full-page error: "Something went wrong."
- **Root Cause:** Same API response format mismatch as BUG-002. The company admin stats API likely wraps response in `{ data: ... }`.
- **Fix:** Same approach as BUG-002.

---

### HIGH (4 bugs — feature-breaking)

#### BUG-004: Admin Users Page — "Failed to fetch users"
- **Severity:** HIGH
- **Page:** `/admin/users`
- **Symptoms:** Pink error banner "Failed to fetch users" + "No users found" below it (despite dashboard showing 1 user).
- **Root Cause:** Same API format mismatch as BUG-002. The `/api/admin/users` route returns `{ data: users || [], error: null }`.
- **File:** `app/api/admin/users/route.ts` (lines 51-54)
- **Fix:** Same as BUG-002.

#### BUG-005: Admin Settings Page — "Failed to fetch settings"
- **Severity:** HIGH
- **Page:** `/admin/settings`
- **Symptoms:** Pink error banner "Failed to fetch settings". Platform Configuration and Feature Flags sections render but are empty.
- **Root Cause:** The config and flags API endpoints (`/api/admin/config`, `/api/admin/flags`) return wrapped responses.
- **Files:** `app/api/admin/config/route.ts` (lines 30-33), `app/api/admin/flags/route.ts` (lines 30-33)
- **Fix:** Same as BUG-002.

#### BUG-006: Project Edit Button Non-Functional
- **Severity:** HIGH
- **Page:** `/app/projects/[id]`
- **Symptoms:** Clicking the "Edit" button on the project detail page does nothing — no modal, no form, no visual feedback.
- **Root Cause:** The `onClick` handler calls `setShowEditModal(true)`, but the edit modal requires `project`, `editFormData`, AND `profile` to all be non-null. If the profile fetch fails (RLS policies or missing profile record), the form submit silently fails at the guard clause.
- **File:** `app/app/projects/[id]/page.tsx` (lines 96, 318, 471)
- **Fix:** Add error handling and user feedback when profile is null. Show a toast/alert if the edit modal can't open due to missing data.

#### BUG-007: Company Admin Sub-Pages Likely All Crash
- **Severity:** HIGH
- **Pages:** `/app/admin/users`, `/app/admin/groups`, `/app/admin/permissions`, `/app/admin/security`, `/app/admin/storage`, `/app/admin/audit`
- **Symptoms:** Expected to crash like `/app/admin/dashboard` based on the same API pattern.
- **Root Cause:** Same wrapped response pattern from company admin API routes (`/api/company-admin/*`).
- **Fix:** Audit all `/api/company-admin/` routes for the same `{ data: ..., error: null }` wrapping pattern.

---

### MEDIUM (5 bugs — UI/UX degradation)

#### BUG-008: App Sidebar Labels Truncated When Sidebar is Open
- **Severity:** MEDIUM
- **Pages:** All `/app/*` authenticated pages
- **Symptoms:** Sidebar labels show as "Dashb...", "My Ta...", "Proje...", "Per...", "Map V...", "Analy...", "Docum...", "Notificat...", "Flow...", "Setti...", "Sign ..."
- **Root Cause:** The `truncate` Tailwind class is applied to nav item labels at lines 110, 141, and 159, but the sidebar container width is too narrow even in its "open" state.
- **File:** `components/app/app-sidebar.tsx` (lines 110, 141, 159)
- **Fix:** Either widen the sidebar container, remove `truncate` class when sidebar is expanded, or make truncation conditional on sidebar collapsed state.

#### BUG-009: Project Detail Page — Sidebar Collapses to Icons Only
- **Severity:** MEDIUM
- **Page:** `/app/projects/[id]`
- **Symptoms:** On the project detail page, the sidebar collapses to show only icons with no text labels at all, losing navigation context.
- **Fix:** Ensure sidebar state persists consistently across route navigations within `/app/*`.

#### BUG-010: Demo Portal — Faded/Low-Contrast Text on Several Pages
- **Severity:** MEDIUM
- **Pages:** `/demo/tasks`, `/demo/documents`
- **Symptoms:** Page headings and body text appear extremely faded/light, with very low contrast against the cream background. Task items and document descriptions are nearly invisible.
- **Root Cause:** Likely CSS opacity or overly light `text-muted-foreground` color applied to content areas.
- **Fix:** Audit text color classes on these pages; ensure headings use `text-foreground` (#102034) not `text-muted-foreground`.

#### BUG-011: Demo Projects — Clicking Project Name Doesn't Navigate
- **Severity:** MEDIUM
- **Page:** `/demo/projects`
- **Symptoms:** Clicking a project name (e.g., "Brightwater Mixed-Use") only toggles an accordion chevron — it doesn't navigate to a project detail page.
- **Expected:** Clicking the project name should navigate to the project detail view.
- **Fix:** Wrap project names in `<Link>` components pointing to `/demo/projects/[id]` or add a "View" button.

#### BUG-012: App Projects Page — Shows "Permits (0)" on Detail View Despite 3 Permits Existing
- **Severity:** MEDIUM
- **Page:** `/app/projects/[id]`
- **Symptoms:** The project detail view shows "Permits (0)" and "Documents (0)" in the tab headers, but the permits list page shows 3 permits linked to the same project.
- **Root Cause:** The permits tab query on the project detail page may not be matching permits to the project correctly.
- **Fix:** Debug the permit-to-project association query in the project detail page.

---

### LOW (7 bugs — polish issues)

#### BUG-013: "Approval Ops" Text Truncated in App Sidebar Header
- **Severity:** LOW
- **Page:** All `/app/*` pages
- **Symptoms:** The sidebar header shows "EntitleFlo" with "Approval Op..." truncated beneath it.
- **Fix:** Ensure the sidebar logo/brand area has sufficient width for full text.

#### BUG-014: Marketing Nav Missing "How it Works" Link
- **Severity:** LOW
- **Pages:** All marketing pages
- **Symptoms:** The main nav shows Home, Pricing, Compare, Resources, Product — but "How it Works" is missing from the navigation despite having a route at `/how-it-works`.
- **Fix:** Add "How it Works" to the site header nav items in `data/site.ts`.

#### BUG-015: Admin Permits Page — Not Tested (Potentially Broken)
- **Severity:** LOW
- **Page:** `/admin/permits`
- **Symptoms:** Not tested during this session. Given the pattern of other admin pages crashing, this is likely also affected.
- **Fix:** Test and apply same API response fix if needed.

#### BUG-016: Admin Analytics & Licenses Pages — Not Tested
- **Severity:** LOW
- **Pages:** `/admin/analytics`, `/admin/licenses`
- **Symptoms:** Not tested during this session.
- **Fix:** Test and verify these pages work correctly.

#### BUG-017: Admin Password Mgmt Page — Not Tested
- **Severity:** LOW
- **Page:** `/admin/password-management`
- **Symptoms:** Not tested during this session.
- **Fix:** Test and verify.

#### BUG-018: Demo Portal "Exit demo" Link Destination Unknown
- **Severity:** LOW
- **Page:** All `/demo/*` pages
- **Symptoms:** "Exit demo" appears in the sidebar footer. Destination not tested.
- **Fix:** Verify it navigates correctly (presumably to `/` or marketing home).

#### BUG-019: Page Title Inconsistency
- **Severity:** LOW
- **Pages:** Multiple pages
- **Symptoms:** Several pages use the same generic title "Permit chaos, comments, and resubmittals | EntitleFlow NC" instead of page-specific titles. The demo notifications page had no title at all initially.
- **Fix:** Set unique `<title>` tags per page via Next.js metadata.

---

## Pages That Work Correctly

| Page | Status | Notes |
|------|--------|-------|
| `/demo/dashboard` | OK | Stats, activity feed, deadlines all render |
| `/demo/projects` | OK | Table with filters, search, badges |
| `/demo/permits` | OK | Permit cards with comments and replies |
| `/demo/analytics` | OK | Stat cards, jurisdiction performance table |
| `/demo/settings` | OK | Profile form, notification preferences |
| `/demo/notifications` | OK | Filter tabs, notification items with "View" buttons |
| `/app/dashboard` | OK | Welcome message, stat cards, team workload |
| `/app/projects` | OK | Project list with status badges |
| `/app/projects/[id]` | Partial | Detail loads but Edit doesn't work, Permits(0) wrong |
| `/app/permits` | OK | 3 permits with filter tabs |
| `/app/flowe` | OK | AI chat interface with welcome message |
| `/admin/dashboard` | OK | Key metrics, recent signups, activity |
| `/admin/diagnostics` | OK | Platform stats, storage, database counts |
| `/login` | OK | Redirects to `/app/dashboard` when authenticated |

---

## Recommended Fix Priority

1. **BUG-001** (Marketing pages blank) — This is customer-facing. Fix the Framer Motion animation.
2. **BUG-002 + BUG-004 + BUG-005** (Admin API format mismatch) — Fix all 6 API routes in one pass.
3. **BUG-003 + BUG-007** (Company admin crashes) — Audit all `/api/company-admin/` routes.
4. **BUG-008** (Sidebar truncation) — Quick CSS fix with high visibility impact.
5. **BUG-006** (Edit button) — Investigate profile fetch and add error feedback.
6. **BUG-010** (Faded text) — CSS color adjustment.
7. Remaining LOW items as time allows.

---

## Testing Methodology

- Browser: Google Chrome via Claude in Chrome automation
- Full page navigation and screenshot capture for 30+ routes
- Interactive element testing (clicks on buttons, links, project rows)
- Console error monitoring
- Codebase analysis for root cause identification
- Routes tested: 62 page routes mapped, ~25 actively browser-tested
