# Type System Reference

Last updated: 2026-03-21

## File Locations

- `lib/database.types.ts` — Auto-generated Supabase types (source of truth)
- `lib/types/enums.ts` — Enum types + label maps + color maps
- `lib/types/index.ts` — Type aliases + composite types

## How Types Work

All row types are aliased from auto-generated Database types:
```typescript
import type { Database } from '../database.types';
export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
```

## Available Type Aliases (lib/types/index.ts)

### Row Types (read from DB)
Organization, Profile, Project, Permit, PermitStatusHistory, Comment, Document, ActivityLogEntry, Deadline, Jurisdiction, MarketingLead

### Insert Types (write to DB)
OrganizationInsert, ProfileInsert, ProjectInsert, PermitInsert, PermitStatusHistoryInsert, CommentInsert, DocumentInsert, ActivityLogEntryInsert, DeadlineInsert, JurisdictionInsert, MarketingLeadInsert

### Update Types (partial update)
OrganizationUpdate, ProfileUpdate, ProjectUpdate, PermitUpdate, CommentUpdate, DocumentUpdate, etc.

### Composite Types (for UI)
```typescript
ProjectWithPermits = Project & { permits: Permit[]; permit_count: number; comment_count: number }
PermitWithComments = Permit & { comments: Comment[]; project_name?: string; comment_count: number }
PermitEnriched = Permit & { comments, documents, status_history, project?, deadlines? }
ProjectEnriched = Project & { permits, comments, documents, deadlines, activity }
CommentThread = Comment & { replies: Comment[]; author: Profile; resolved_by_user?: Profile }
ActivityFeedEntry = ActivityLogEntry & { actor?, project?, permit? }
DashboardStats = { active_projects, pending_permits, open_comments, avg_review_days, overdue_deadlines, last_updated }
UserContext = { user_id, organization_id, role, profile, organization }
```

### Utility Types
```typescript
PaginationMeta = { total_count, page, page_size, total_pages, has_next, has_previous }
PaginatedResponse<T> = { data: T[]; pagination: PaginationMeta }
ApiResponse<T> = { success: boolean; data?: T; error?: string; message?: string }
FilterOptions = { project_status?, permit_status?, permit_type?, priority?, jurisdiction?, comment_category?, date_from?, date_to?, search_text?, assigned_to? }
SortOptions = { field: string; direction: 'asc' | 'desc' }
```

## Enum Types (lib/types/enums.ts)

Each enum has: type definition, LABELS map, COLORS map

| Type | Values |
|------|--------|
| ProjectStatus | draft, active, on_hold, completed, archived |
| ProjectType | residential, commercial, mixed_use, industrial, institutional, infrastructure |
| PermitStatus | draft, submitted, under_review, revision_requested, resubmitted, approved, approved_with_conditions, denied, withdrawn, expired |
| PermitType | site_plan_review, building_permit, ... (10 values) |
| Priority | low, normal, high, urgent |
| OrgRole | owner, admin, member, viewer |
| CommentSource | internal, jurisdiction, imported |
| CommentCategory | parking_access, stormwater, building_code, zoning, fire_safety, landscaping, traffic, environmental, general, other |
| DocumentType | site_plan, architectural_drawing, ... (12 values) |
| ActivityAction | project_created, permit_submitted, ... (16 values with Q2 additions) |
| DeadlineStatus | upcoming, due_soon, overdue, completed, cancelled |

## Import Patterns

From pages/components:
```typescript
import { Project, ProjectInsert, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/lib/types/index';
import type { Database } from '@/lib/database.types';
```

For types not yet in the alias file, use directly:
```typescript
type Profile = Database['public']['Tables']['profiles']['Row'];
```

## Validation Schemas (lib/validation/)

Using Zod. Located in:
- `lib/validation/comments.ts` — createComment, updateComment, resolveComment, assignComment, bulkAction
- `lib/validation/team.ts` — inviteMember, updateMember
- `lib/validation/notifications.ts` — updatePreferences
