# EntitleFlow Lint Cleanup Implementation Plan

**Date:** 2026-03-28
**Based on:** qa-report-2026-03-28.md
**Target:** Resolve all 226 ESLint errors + 129 warnings (355 total)
**Estimated effort:** 4 phases, ~2-3 hours total

---

## Diagnosis Summary

| Rule | Count | Type | Fix Strategy |
|---|---|---|---|
| `@typescript-eslint/no-explicit-any` | 196 | error | Remove vestigial `as any` casts (Phase 2) |
| `@typescript-eslint/no-unused-vars` | ~118 | warning | Delete unused imports/variables (Phase 1) |
| `react/no-unescaped-entities` | 9 | error | Escape apostrophes/quotes in JSX (Phase 3) |
| `react-hooks/exhaustive-deps` | 8 | warning | Add missing deps or suppress with comment (Phase 3) |
| `@typescript-eslint/no-empty-object-type` | 7 | error | Convert empty interfaces to type aliases (Phase 3) |
| `react-hooks/static-components` | 7 | error | Move components outside render (Phase 3) |
| `prefer-const` | 4 | error | Change `let` → `const` (Phase 1) |
| `react-hooks/immutability` | 1 | error | Use `router.push()` (Phase 3) |
| `react-hooks/set-state-in-effect` | 1 | error | Lazy state initializer (Phase 3) |
| `@next/next/no-html-link-for-pages` | 1 | error | Use `<Link>` from next/link (Phase 3) |
| `@next/next/no-img-element` | 1 | warning | Use `<Image>` from next/image (Phase 3) |
| `@typescript-eslint/no-unused-expressions` | 1 | warning | Fix expression in standalone jsx file (Phase 3) |

---

## Phase 0: Prerequisite — Regenerate Database Types

**Why first:** 3 tables from migration 00008 are missing from `database.types.ts`. Until types are regenerated, some `any` casts in license-related routes are technically required. Regenerating first makes Phase 2 clean.

**Command:**
```bash
npx supabase gen types typescript --project-id sjyzqqratghsjttqeghy > lib/database.types.ts
```

**Tables that will be added:**
- `license_change_requests`
- `organization_contracts`
- `contract_change_usage`

**Verify:** Run `tsc --noEmit` after regeneration to confirm nothing breaks.

---

## Phase 1: Unused Imports & Variables (118 warnings + 4 errors)

**Strategy:** Mechanical deletions. Zero risk to runtime behavior. Do this first because removing dead code makes the remaining diffs cleaner.

**Step 1a: Auto-fix what ESLint can handle**
```bash
npm run lint -- --fix
```
This resolves 3 errors + 1 warning automatically (the `prefer-const` issues).

**Step 1b: Remove unused imports — by file**

Each item below is a single-line deletion (remove the import). Grouped by directory for efficient batch editing.

### API Routes (`app/api/`)

| File | Unused Import/Var | Line |
|---|---|---|
| `api/admin/license-requests/route.ts` | `Database` | 3 |
| `api/admin/organizations/[id]/page.tsx` | `Database`, `Calendar`, `Package`, `AlertCircle` | 12-15 |
| `api/admin/users/[id]/route.ts` | `license_type` (destructured) | 123 |
| `api/comments/route.ts` | `Comment` | 6 |
| `api/company-admin/audit/route.ts` | `count` (destructured) | 48 |
| `api/company-admin/groups/route.ts` | `request` (param) | 4 |
| `api/company-admin/license-requests/route.ts` | `Database` | 3 |
| `api/company-admin/security/route.ts` | `request` (param) | 4 |
| `api/company-admin/stats/route.ts` | `totalPermits` (destructured) | 20 |
| `api/company-admin/storage/route.ts` | `breakdownByUser` (destructured) | 32 |
| `api/company-admin/users/route.ts` | `count` (destructured) | 41 |
| `api/documents/[id]/auto-parse/route.ts` | `_` (destructured, 2 occurrences) | 114, 169 |
| `api/documents/[id]/status/route.ts` | `jobError` (destructured) | 51 |

### Admin Pages (`app/admin/`)

| File | Unused Import/Var | Line |
|---|---|---|
| `admin/layout.tsx` | `loading` | 58 |
| `admin/leads/page.tsx` | `Button`, `Input`, `TabsContent` | 4, 7, 9 |
| `admin/license-requests/page.tsx` | `Calendar` | 16 |
| `admin/password-management/page.tsx` | `data` | 73 |
| `admin/users/page.tsx` | `useCallback`, `Button`, `idx` | 3, 4, 148 |

### App Pages (`app/app/`)

| File | Unused Import/Var | Line |
|---|---|---|
| `app/settings/profile/page.tsx` | Multiple destructured vars | Various |
| `app/settings/team/page.tsx` | Unused var | — |
| `app/settings/notifications/page.tsx` | Unused var | — |
| `app/projects/[id]/page.tsx` | Unused var | — |
| `app/tasks/page.tsx` | Unused var | — |
| `app/admin/security/page.tsx` | Unused var | — |

### Demo Pages

| File | Unused Import/Var | Line |
|---|---|---|
| `demo/dashboard/page.tsx` | Unused var | — |
| `demo/projects/page.tsx` | Unused var | — |
| `demo/settings/page.tsx` | `Mail`, `Check` | 6 |

### Components

| File | Unused Import/Var | Line |
|---|---|---|
| `components/app/app-sidebar.tsx` | `Users`, `SidebarLink` | 15, 26 |
| `components/app/app-topbar.tsx` | `Button` | 6 |
| `components/app/notification-bell.tsx` | `X` | 3 |
| `components/app/permit-progress-bar.tsx` | `inProgressPercent`, `openPercent` | 20, 21 |
| `components/marketing/cta-banner.tsx` | `Badge`, `eyebrow` | 6, 19 |
| `components/marketing/dashboard-preview.tsx` | `cn`, `isHovered` | 5, 12 |
| `components/site/site-footer.tsx` | `motion` | 4 |
| `components/ui/chat-message-list.tsx` | `_ref` | 13 |
| `components/ui/onboarding-dialog.tsx` | `onPrev` | 194 |

### Lib Files

| File | Unused Import/Var | Line |
|---|---|---|
| `lib/admin/auth.ts` | `NextResponse` | 3 |
| `lib/admin/company-auth.ts` | `Database` | 2 |
| `lib/ai/agents/base.ts` | `_jsonMode` | 23 |
| `lib/ai/embeddings.ts` | `vertexAI` | 36 |
| `lib/ai/knowledge-retriever.ts` | `vectorSearchError` | 145 |
| `lib/permissions/client.ts` | `UserPermissionContext` | 15 |
| `lib/permissions/server.ts` | `Database`, `clearPermissionCache` | 9, 28 |
| `lib/validation/notifications.ts` | `NOTIFICATION_CHANNELS` | 31 |

**Special cases for `request` parameter:**
For unused `request` parameters in route handlers (e.g., `export async function GET(request: Request)`), prefix with underscore: `_request`. This signals intent while keeping the function signature correct.

---

## Phase 2: Remove `as any` Casts (196 errors)

**Root cause:** `getSupabaseAdminClient()` now returns `SupabaseClient<Database> | null`, which is fully typed. The `as any` casts throughout the codebase are **vestigial** — they were added before the `<Database>` generic was fixed in commit `705377`. They can be safely removed.

**Pattern to find and replace:**

```typescript
// BEFORE (current — everywhere)
(adminClient as any).from('notifications').insert(...)

// AFTER (correct — uses Database types)
adminClient.from('notifications').insert(...)
```

**The null-check pattern is already correct** in most files:
```typescript
const adminClient = getSupabaseAdminClient();
if (!adminClient) { return; }
// After the null check, TypeScript narrows the type to SupabaseClient<Database>
```

### Files to fix, grouped by directory

**`lib/` (core — fix these first, they set the pattern)**

| File | `any` count | Notes |
|---|---|---|
| `lib/notifications.ts` | 13 | Every `createNotification` helper uses `(adminClient as any)` |
| `lib/ai/embeddings.ts` | 8 | Vertex AI + Supabase calls |
| `lib/ai/knowledge-retriever.ts` | 2 | Supabase queries |
| `lib/hooks/use-comment-actions.ts` | 1 | Client-side hook |
| `lib/permissions/server.ts` | 1 | Permission check |

**`app/api/documents/` (Document AI pipeline)**

| File | `any` count | Notes |
|---|---|---|
| `auto-parse/route.ts` | 15 | Heaviest file — Document AI + Gemini + Supabase |
| `parse/route.ts` | 4 | Document parsing |
| `status/route.ts` | 1 | Parse job status |
| `upload/route.ts` | 2 | File upload |

**`app/api/comments/` (Comment system)**

| File | `any` count | Notes |
|---|---|---|
| `[id]/route.ts` | 5 | Comment CRUD |
| `[id]/resolve/route.ts` | 5 | Resolve/unresolve |
| `[id]/assign/route.ts` | 5 | Assignment |
| `[id]/ai-response/route.ts` | 2 | AI response generation |
| `bulk/route.ts` | 6 | Bulk operations |
| `route.ts` | 4 | List/create |

**`app/api/company-admin/` (Company admin)**

| File | `any` count | Notes |
|---|---|---|
| `users/[id]/route.ts` | 11 | License change requests (needs Phase 0 types) |
| `license-requests/route.ts` | 10 | License request management (needs Phase 0 types) |
| `audit/export/route.ts` | 5 | Audit export |
| `storage/route.ts` | 3 | Storage tracking |
| `groups/route.ts` | 2 | Group management |
| `security/route.ts` | 1 | Security settings |
| `users/route.ts` | 1 | User list |

**`app/api/admin/` (Super admin)**

| File | `any` count | Notes |
|---|---|---|
| `license-requests/route.ts` | 10 | License approval (needs Phase 0 types) |
| `organizations/[id]/route.ts` | 1 | Org detail |
| `organizations/route.ts` | 1 | Org list |
| `users/[id]/route.ts` | 1 | User detail |
| `announcements/route.ts` | 1 | Announcements |

**Other**

| File | `any` count | Notes |
|---|---|---|
| `app/api/ai/knowledge/route.ts` | 3 | Knowledge base |
| `app/api/notifications/preferences/route.ts` | 2 | Notification prefs |
| `app/api/tasks/route.ts` | 2 | Task management |
| `components/portal/portal-topbar.tsx` | 1 | Supabase call in client component |
| `components/app/document-parse-status.tsx` | 1 | Type narrowing |
| `app/app/settings/profile/page.tsx` | 7 | Profile settings (client component) |

### Strategy for each cast type

**Type A — `(supabaseClient as any).from('table')`**
Remove the `as any`. The client is already typed with `<Database>`.

**Type B — `(error as any).message`**
Replace with `(error as Error).message` or use a type guard:
```typescript
if (error instanceof Error) { ... }
```

**Type C — `(data as any).field`**
Replace with proper Supabase return type. After the `.from('table').select()` call, data is already typed.

**Type D — Function parameters typed as `any`**
Replace with the correct type from `database.types.ts`, e.g.:
```typescript
// BEFORE
items.map((item: any) => item.id)
// AFTER
items.map((item: Database['public']['Tables']['comments']['Row']) => item.id)
// Or define a type alias at the top of the file
```

---

## Phase 3: Remaining Errors (30 issues)

### 3a. Empty interfaces in `components/ui/card.tsx` (7 errors)

```typescript
// BEFORE
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
// AFTER
type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;
```

Do the same for all 6 interfaces: `CardProps`, `CardHeaderProps`, `CardTitleProps`, `CardDescriptionProps`, `CardContentProps`, `CardFooterProps`.

Also fix `components/ui/chat-input.tsx` (1 occurrence).

### 3b. Unescaped entities (9 errors)

| File | Line | Fix |
|---|---|---|
| `app/(marketing)/pricing/page.tsx` | 48 | `'` → `&apos;` |
| `components/app/notification-bell.tsx` | 288 | `'` → `&apos;` |
| `app/demo/projects/page.tsx` | 360, 536-537 | `"` → `&quot;` or `{'"'}` |
| `app/demo/projects/page.tsx` | 72 | `'` → `&apos;` |

### 3c. React hook violations (3 real bugs)

**`app/demo/projects/page.tsx` — SortArrow inside render (7 errors)**

Move the `SortArrow` component outside the parent component:
```typescript
// Move from line 300 (inside DemoProjectsPage) to before the component
function SortArrow({ columnKey, sortKey, sortOrder }: {
  columnKey: SortKey;
  sortKey: SortKey;
  sortOrder: string
}) {
  if (sortKey !== columnKey) return null;
  return <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
}
```
Then pass `sortKey` and `sortOrder` as props where it's used.

**`components/app/notification-toast.tsx` — window.location.href (1 error)**

```typescript
// BEFORE (line 111)
window.location.href = toast.action_url;

// AFTER
import { useRouter } from 'next/navigation';
// ... in component:
const router = useRouter();
// ... in handler:
router.push(toast.action_url);
```

**`components/ui/onboarding-dialog.tsx` — setState in effect (1 error)**

```typescript
// BEFORE
const [isOpen, setIsOpen] = useState(false);
useEffect(() => {
  const hasSeenOnboarding = localStorage.getItem('entitleflow-onboarding-seen');
  if (!hasSeenOnboarding) {
    setIsOpen(true);
  }
}, []);

// AFTER — lazy initializer (no effect needed)
const [isOpen, setIsOpen] = useState(() => {
  if (typeof window === 'undefined') return false;
  return !localStorage.getItem('entitleflow-onboarding-seen');
});
```

### 3d. Missing useEffect dependencies (8 warnings)

For each, evaluate whether to add the dependency or suppress:

| File | Missing Dep | Recommended Fix |
|---|---|---|
| `admin/layout.tsx:111` | `supabase` | Add to deps (stable reference) |
| `components/app/document-parse-status.tsx:150,168` | `fetchStatus` | Wrap `fetchStatus` in `useCallback` |
| `app/app/settings/team/page.tsx:150` | `loadTeamData` | Wrap in `useCallback` |
| `app/demo/projects/page.tsx:47` | `loadProjects` | Wrap in `useCallback` |
| `app/demo/projects/page.tsx:261` | `loadDocuments` | Wrap in `useCallback` |
| `app/demo/projects/page.tsx:301` | `loadNotifications` | Wrap in `useCallback` |
| `app/app/admin/security/page.tsx:78` | `loadAnalytics` | Wrap in `useCallback` |

### 3e. Miscellaneous (3 issues)

| File | Issue | Fix |
|---|---|---|
| `components/portal/portal-topbar.tsx:242` | `<a>` instead of `<Link>` | Replace with `<Link href="/">` |
| `components/app/app-topbar.tsx:264` | `<img>` instead of `<Image>` | Replace with `next/image` `<Image>` |
| `docs/standalone/entitleflow-roadmap.jsx:435` | Unused expression | Review and fix or suppress |

---

## Phase 4: Verify & Commit

1. Run full lint check: `npm run lint`
2. Run TypeScript check: `npx tsc --noEmit`
3. Test build: `npm run build` (on Vercel via push)
4. Commit with message:
   ```
   fix: resolve all 355 ESLint errors and warnings

   Phase 0: Regenerate database.types.ts for migration 00008 tables
   Phase 1: Remove 118 unused imports/variables across 40+ files
   Phase 2: Replace 196 `as any` casts with proper Database types
   Phase 3: Fix React hook violations, empty interfaces, unescaped entities
   ```
5. Push to main — monitor Vercel deployment

---

## Execution Order Rationale

```
Phase 0 (types)  →  Phase 1 (unused)  →  Phase 2 (any)  →  Phase 3 (misc)  →  Phase 4 (verify)
```

- **Phase 0 first**: Regenerating types unlocks proper typing for license-related routes, preventing the need for new `any` casts in Phase 2.
- **Phase 1 second**: Removing dead imports reduces file noise, making Phase 2 diffs cleaner and more reviewable.
- **Phase 2 third**: The bulk of the work. Each file follows the same pattern: remove `as any`, let TypeScript infer from the `<Database>` generic.
- **Phase 3 last**: These are one-off fixes in specific files, independent of the broader patterns.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Removing `as any` reveals hidden type errors | Medium | Phase 0 ensures types are up-to-date; run `tsc` after each batch |
| Removing unused import breaks a file that lazy-imports | Low | All flagged items are truly unused per ESLint static analysis |
| React hook dep changes cause infinite re-renders | Low | Use `useCallback` pattern, not adding raw functions to dep arrays |
| Build breaks on Vercel after push | Low | TypeScript and lint pass locally first; Vercel preview deployment available |

---

## Success Criteria

- `npm run lint` → 0 errors, 0 warnings
- `npx tsc --noEmit` → 0 errors (maintains current clean state)
- `npm run build` → succeeds on Vercel
- No runtime regressions on entitleflow.com
