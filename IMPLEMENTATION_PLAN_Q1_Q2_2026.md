# EntitleFlow — Implementation Plan: Q1 2026 (Remaining) + Q2 2026 Core Product Loop

**Version:** 1.0
**Date:** March 21, 2026
**Prepared by:** Architecture Review Committee
**Status:** Ready for Implementation

---

## Executive Summary

This document is the consolidated output of a three-panel architecture review covering backend systems, frontend architecture, and security/operations. It provides an implementation-ready plan for completing the Q1 2026 sprint and executing the Q2 2026 Core Product Loop — the features that transform EntitleFlow from a permit tracker into a full workflow platform.

**Key finding:** Q1 items 1–3 (Document Upload → GCS, Cloud Functions Email Forwarder, AI Endpoints) are **already substantially complete**. The remaining Q1 work focuses on Project/Permit Detail Pages and the Comment Thread UI — the core value-delivery feature. Q2 builds on this foundation with automation, collaboration, and intelligence.

### Scope

| Phase | Items | Effort Estimate |
|-------|-------|-----------------|
| Q1 Remaining | Project & Permit Detail Pages, Comment Thread UI | 5–6 weeks |
| Q2 Core Loop | Auto-Parse Pipeline, Email Ingestion, Team Collab, Notifications, Map View, Advanced Analytics | 10–12 weeks |

### Architecture Principles

1. **Server Components First** — Data fetching on the server; client components only for interactivity
2. **Optimistic Updates** — Instant UI feedback for comment resolution/assignment with server reconciliation
3. **Multi-Tenant Isolation** — Every query scoped to `organization_id` via RLS policies
4. **Progressive Complexity** — Ship the simplest working version of each feature, iterate with user feedback
5. **Type Safety End-to-End** — Supabase-generated types flow from database → API → UI

---

## Part 1: Current State Assessment

### What's Already Built (85–90% of Q1 Original Scope)

| Feature | Status | Notes |
|---------|--------|-------|
| Document Upload → GCS | ✅ Complete | `POST /api/documents/upload` with org-based paths, signed URLs |
| Document AI Parsing | ✅ Complete | `POST /api/documents/[id]/parse` with comment extraction |
| AI Summarize | ✅ Upgraded | Now powered by Document Strategist agent — adds approval risk, effort estimates, resolution timeline |
| AI Suggest Response | ✅ Upgraded | Now powered by Response Drafter agent — adds NC code references, tone control, confidence scoring |
| AI Classify Comments | ✅ Upgraded | Now powered by Comment Analyst agent — adds severity assessment, triage priority (1-4) |
| AI Agent Layer | ✅ Complete | 6 specialized agents, hybrid Gemini backbone + MiMo-v2-Pro enhancement, swappable model registry |
| AI Compliance Advisor | ✅ Complete | NEW — NC code compliance analysis via `/api/ai/compliance` |
| AI Resubmittal Planner | ✅ Complete | NEW — Prioritized resubmittal strategy via `/api/ai/resubmittal-plan` |
| AI Project Intelligence | ✅ Complete | NEW — Pattern analysis & timeline prediction via `/api/ai/project-insights` |
| AI Batch Classify | ✅ Complete | NEW — Classify up to 50 comments in one call via `/api/ai/batch-classify` |
| AI Response Letter | ✅ Complete | NEW — Full resubmittal letter generation via `/api/ai/response-letter` |
| OpenRouter Integration | ✅ Complete | MiMo-v2-Pro (1T params, 1M ctx) for complex reasoning tasks |
| Email Forwarder Cloud Function | ✅ Complete | Gmail → Pub/Sub → webhook pipeline |
| Email Inbound Webhook | ✅ Complete | Parses sender/subject/body, extracts permit numbers |
| Dashboard | ✅ Complete | KPIs, recent activity, upcoming deadlines |
| Projects List | ✅ Complete | CRUD, status filtering, jurisdiction selection |
| Permits List | ✅ Complete | CRUD, status tabs, priority badges |
| Documents List | ✅ Complete | Upload, type selection, listing |
| Analytics | ✅ Complete | Status breakdowns, resolution metrics |
| Settings | ✅ Complete | Profile editing, password change |
| Admin Panel | ✅ Complete | Users, orgs, leads, flags, config, audit log |
| Database Schema | ✅ Complete | 17 tables, all enums, auto-generated numbers |

### AI Agent Layer — Implemented March 21, 2026

A hybrid AI agent system has been added that significantly accelerates the Q2–Q3 roadmap:

**Architecture:** Vertex AI (Gemini 2.0 Flash) remains the backbone for fast/cheap tasks. MiMo-v2-Pro via OpenRouter is the enhancement layer for complex reasoning. Model is swappable via `lib/ai/model-registry.ts` — change one line to swap the brain. If no OpenRouter key is set, everything runs on GCP.

**6 Specialized Agents:**
1. **Comment Analyst** — Classification with severity + priority triage (Gemini backbone)
2. **Response Drafter** — Professional responses with NC code references (MiMo enhancement)
3. **Document Strategist** — Review analysis with approval risk + timeline (MiMo enhancement)
4. **Compliance Advisor** — NC code compliance checking (MiMo enhancement) — NEW capability
5. **Resubmittal Planner** — Prioritized resubmittal strategy with work packages (MiMo enhancement) — NEW capability
6. **Project Intelligence** — Pattern analysis + timeline prediction (MiMo enhancement) — NEW capability

**Roadmap acceleration:** The Compliance Advisor, Resubmittal Planner, and Response Letter endpoints directly implement Q2–Q3 items (AI Response Drafting, Resubmittal Package Builder, ML Timeline Predictions) ahead of schedule. The agent abstraction also makes Q3's "full response letters" a near-term possibility.

**New API endpoints:** `/api/ai/compliance`, `/api/ai/resubmittal-plan`, `/api/ai/project-insights`, `/api/ai/batch-classify`, `/api/ai/response-letter`, `/api/ai/agents`

**Files:** `lib/ai/` (types, openrouter client, model registry, router, 6 agent files)

---

### What Remains (Q1)

| Feature | Status | Blocks |
|---------|--------|--------|
| Project Detail Page (`/app/projects/[id]`) | 🔧 Not started | None |
| Permit Detail Page (`/app/permits/[id]`) | 🔧 Not started | None |
| Comment Thread UI | 🔧 Not started | Depends on Permit Detail |
| Comment API routes (resolve, assign, filter) | 🔧 Not started | None |

---

## Part 2: Database Schema Changes

### 2.1 New Tables

#### `team_members` — Organization membership with explicit roles

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, profile_id)
);

CREATE INDEX idx_team_members_org ON team_members(organization_id);
CREATE INDEX idx_team_members_profile ON team_members(profile_id);
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### `team_invitations` — Pending invites

```sql
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitations_token ON team_invitations(token);
CREATE INDEX idx_invitations_email ON team_invitations(email);
```

#### `comment_assignments` — Track who's assigned to which comments

```sql
CREATE TABLE comment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  unassigned_at TIMESTAMPTZ,
  UNIQUE(comment_id, assigned_to)
);

CREATE INDEX idx_comment_assignments_comment ON comment_assignments(comment_id);
CREATE INDEX idx_comment_assignments_user ON comment_assignments(assigned_to);
```

#### `notifications` — In-app notification system

```sql
CREATE TYPE notification_type AS ENUM (
  'comment_assigned', 'comment_resolved', 'permit_status_changed',
  'deadline_approaching', 'document_uploaded', 'team_invitation',
  'mention', 'ai_parse_complete', 'email_ingested'
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_org ON notifications(organization_id);
```

#### `notification_preferences` — Per-user notification settings

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  in_app BOOLEAN DEFAULT TRUE,
  email BOOLEAN DEFAULT TRUE,
  email_digest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, notification_type)
);
```

#### `parse_jobs` — Track Document AI processing pipeline

```sql
CREATE TYPE parse_job_status AS ENUM ('queued', 'processing', 'completed', 'failed');

CREATE TABLE parse_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status parse_job_status NOT NULL DEFAULT 'queued',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  comments_created INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parse_jobs_status ON parse_jobs(status, created_at);
CREATE INDEX idx_parse_jobs_document ON parse_jobs(document_id);
```

### 2.2 Column Additions to Existing Tables

```sql
-- comments: add assignment and AI metadata
ALTER TABLE comments ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);
ALTER TABLE comments ADD COLUMN IF NOT EXISTS ai_suggested_response TEXT;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3,2);
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parse_job_id UUID REFERENCES parse_jobs(id);
CREATE INDEX idx_comments_assigned ON comments(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_comments_permit_status ON comments(permit_id, is_resolved);

-- documents: add parse status tracking
ALTER TABLE documents ADD COLUMN IF NOT EXISTS parse_status parse_job_status;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS parsed_at TIMESTAMPTZ;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS auto_parse BOOLEAN DEFAULT TRUE;

-- profiles: add notification preferences
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- projects: add coordinates for map view
ALTER TABLE projects ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7);
```

---

## Part 3: Q1 Remaining — Project & Permit Detail Pages

### 3.1 Project Detail Page

**Route:** `app/app/projects/[id]/page.tsx`

#### File Structure
```
app/app/projects/[id]/
├── page.tsx                     (Server component — data fetching)
├── components/
│   ├── project-header.tsx       (Client — metadata + actions)
│   ├── project-tabs.tsx         (Client — tab navigation)
│   ├── overview-tab.tsx         (Client — project info)
│   ├── permits-tab.tsx          (Client — linked permits)
│   ├── documents-tab.tsx        (Client — file management)
│   ├── activity-tab.tsx         (Server — timeline)
│   ├── edit-project-modal.tsx   (Client — form modal)
│   └── status-change-modal.tsx  (Client — workflow)
```

#### Server Component Data Shape
```typescript
interface ProjectPageData {
  project: Project & {
    organization: Organization;
    jurisdiction: Jurisdiction;
  };
  permits: (Permit & { comment_count: number })[];
  documents: Document[];
  activity: ActivityLogEntry[];
  deadlines: Deadline[];
}
```

#### Key Behaviors
- **Tabs:** Overview | Permits | Documents | Activity (Radix UI Tabs)
- **Status Change:** Modal with valid state transitions, creates `permit_status_history` record
- **Edit:** Modal with react-hook-form + Zod, updates project record
- **Permits Tab:** Cards linking to `/app/permits/[id]`, shows comment count badge
- **Documents Tab:** Drag-drop upload zone, type icons, delete/download actions

### 3.2 Permit Detail Page

**Route:** `app/app/permits/[id]/page.tsx`

#### File Structure
```
app/app/permits/[id]/
├── page.tsx                     (Server component)
├── components/
│   ├── permit-header.tsx        (Client — number, status, priority)
│   ├── permit-status-timeline.tsx (Client — visual state progression)
│   ├── permit-tabs.tsx          (Client — tab navigation)
│   ├── comments-section.tsx     (Client — THE CORE FEATURE)
│   │   ├── comment-list.tsx
│   │   ├── comment-card.tsx
│   │   ├── comment-filter-bar.tsx
│   │   ├── bulk-actions-toolbar.tsx
│   │   └── ai-response-panel.tsx
│   ├── documents-section.tsx    (Client)
│   ├── deadline-tracker.tsx     (Client)
│   └── activity-history.tsx     (Server)
```

#### Status Timeline Component
Visual horizontal progression through permit states:
```
[Draft] → [Submitted] → [Under Review] → [Revision Requested] → [Approved]
```
- Current state highlighted with primary color
- Past states in muted green
- Future states in muted gray
- Clickable for status change (if user has permission)

#### Valid State Transitions
```
draft → submitted, withdrawn
submitted → under_review, withdrawn
under_review → revision_requested, approved, approved_with_conditions, denied
revision_requested → resubmitted, withdrawn
resubmitted → under_review, withdrawn
approved / approved_with_conditions / denied → withdrawn
```

---

## Part 4: Q1 Remaining — Comment Thread UI (Core Feature)

### 4.1 API Endpoints

#### `GET /api/comments`
```
Query params: permit_id, category, is_resolved, assigned_to, page, limit, sort
Response: { data: Comment[], meta: { total, page, limit, pages } }
```

#### `PATCH /api/comments/[id]`
```
Body: { is_resolved?, assigned_to?, category?, text? }
Response: { data: Comment }
Side effects: Creates activity_log entry, sends notification
```

#### `POST /api/comments/[id]/resolve`
```
Body: { resolution_note?: string }
Response: { data: Comment }
Side effects: Sets is_resolved=true, resolved_by, resolved_at
```

#### `POST /api/comments/[id]/assign`
```
Body: { assigned_to: string }
Response: { data: Comment }
Side effects: Creates comment_assignment, sends notification
```

#### `POST /api/comments/[id]/ai-response`
```
Body: {} (uses comment text + category from DB)
Response: { data: { suggestion: string, confidence: number } }
Calls: /api/ai/suggest-response internally
```

#### `POST /api/comments/bulk`
```
Body: { comment_ids: string[], action: 'resolve' | 'assign', assigned_to?: string }
Response: { data: { updated: number, failed: string[] } }
```

### 4.2 Comment Card Component

```typescript
interface CommentCardProps {
  comment: Comment & { author?: Profile; assignee?: Profile };
  threadChildren?: Comment[];
  isSelected?: boolean;
  isLoading?: boolean;
  onResolve: (commentId: string) => Promise<void>;
  onAssign: (commentId: string, assigneeId: string) => Promise<void>;
  onSelect: (commentId: string) => void;
  onAISuggest: (commentId: string) => Promise<void>;
}
```

**Card Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [☐] [🏷 Stormwater]  [🔴 Open]  [Source: Jurisdiction]     │
│                                                              │
│ "The proposed grading plan does not adequately address       │
│  stormwater runoff for the 25-year storm event..."           │
│                                                              │
│ 👤 Assigned to: Sarah Chen          📅 Mar 15, 2026         │
│                                                              │
│ [✅ Resolve]  [👤 Assign]  [🤖 AI Suggest]  [💬 Reply]     │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Optimistic Updates Pattern

```typescript
// useCommentActions hook
const resolveComment = async (commentId: string) => {
  // 1. Optimistic update
  setComments(prev => prev.map(c =>
    c.id === commentId
      ? { ...c, is_resolved: true, resolved_by: userId, resolved_at: new Date().toISOString() }
      : c
  ));

  try {
    // 2. Server update
    await fetch(`/api/comments/${commentId}/resolve`, { method: 'POST' });
  } catch (error) {
    // 3. Revert on failure
    setComments(prev => prev.map(c =>
      c.id === commentId
        ? { ...c, is_resolved: false, resolved_by: null, resolved_at: null }
        : c
    ));
    toast.error('Failed to resolve comment');
  }
};
```

### 4.4 Filter & Search Bar

```
┌──────────────────────────────────────────────────────────────┐
│ 🔍 Search comments...   [Category ▾] [Status ▾] [Assignee ▾]│
│                                                               │
│ Showing 24 of 47 comments  │  12 resolved  │  35 open        │
│                                                               │
│ [3 selected]  [✅ Bulk Resolve]  [👤 Bulk Assign ▾]          │
└──────────────────────────────────────────────────────────────┘
```

### 4.5 AI Response Panel

When user clicks "AI Suggest" on a comment:
1. Loading state with shimmer animation
2. Calls `/api/ai/suggest-response` with comment text + category
3. Displays suggestion in an expandable panel below the comment
4. User can: **Copy**, **Insert as Reply**, **Regenerate**, or **Dismiss**
5. If inserted as reply, creates a child comment with `source: 'internal'`

### 4.6 Threading

Comments with `parent_comment_id` render as indented children:
```
├── [Parent Comment - Jurisdiction Reviewer]
│   ├── [Reply - Internal: AI-drafted response]
│   └── [Reply - Internal: Team member follow-up]
```

---

## Part 5: Q2 — Document AI Auto-Parse Pipeline

### 5.1 Zero-Touch Flow

```
User uploads PDF
       │
       ▼
POST /api/documents/upload
       │ (creates document record + uploads to GCS)
       ▼
POST /api/documents/[id]/auto-parse  (triggered automatically)
       │
       ▼
Create parse_job record (status: 'queued')
       │
       ▼
Document AI: Extract text + form data
       │
       ▼
Vertex AI: Classify each extracted comment
       │
       ▼
Create comment records (linked to permit + parse_job)
       │
       ▼
Update parse_job (status: 'completed', comments_created: N)
       │
       ▼
Create notification: "N comments extracted from [document]"
       │
       ▼
Log activity
```

### 5.2 Implementation Strategy

**Option A (Recommended): Synchronous with Vercel Pro timeout**
- Vercel Pro gives 60s function timeout
- Most permit PDFs are 2–20 pages; Document AI processes in <30s
- Run the full pipeline in a single API route call
- Use `parse_jobs` table as audit trail, not as a queue

**Option B (If timeout issues): Background via Supabase Edge Functions**
- Upload triggers a Supabase Edge Function via database webhook
- Edge Function runs the Document AI + classification pipeline
- Updates database when complete
- More infrastructure but handles large documents

**Recommendation:** Start with Option A. If >10% of documents timeout, migrate to Option B.

### 5.3 API Route: Auto-Parse

```typescript
// POST /api/documents/[id]/auto-parse
// 1. Auth check
// 2. Fetch document record, verify org ownership
// 3. Create parse_job (status: 'processing')
// 4. Download file from GCS to buffer
// 5. Send to Document AI
// 6. For each extracted comment:
//    a. Classify via Vertex AI
//    b. Insert comment record
// 7. Update parse_job (status: 'completed')
// 8. Create notification
// 9. Return { parse_job_id, comments_created }
```

### 5.4 Error Handling

- **Document AI fails:** Set parse_job status to 'failed', store error message, notify user
- **Individual comment classification fails:** Create comment with `category: null`, log warning (non-fatal)
- **Timeout approaching:** Save partial results, mark parse_job as 'partial', create notification with "X of Y comments extracted"
- **Malicious PDF:** Document AI has built-in protections; additionally validate file type via magic bytes before upload

---

## Part 6: Q2 — Email-to-Comment Ingestion

### 6.1 Enhanced Flow

The existing email pipeline (Cloud Function → webhook → `/api/email/inbound`) already extracts permit numbers and classifies categories. Enhancement needed:

```
Existing: Email → Extract metadata → Create comment record
Enhanced: Email → Extract metadata → Match to permit → Classify via AI → Create comment → Notify assignee
```

### 6.2 Changes to `/api/email/inbound`

```typescript
// Enhanced inbound email handler:
// 1. Authenticate webhook (existing)
// 2. Parse email (existing)
// 3. Extract permit number (existing)
// 4. NEW: Fuzzy match permit by number + org context
// 5. NEW: If no exact match, create "unmatched" queue entry
// 6. NEW: Classify via Vertex AI (instead of keyword-only)
// 7. Create comment record (existing, enhanced)
// 8. NEW: Create notification for permit assignee
// 9. NEW: Log activity with email metadata
```

### 6.3 Unmatched Email Queue

```sql
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  raw_payload JSONB NOT NULL,
  permit_id UUID REFERENCES permits(id),
  status TEXT NOT NULL DEFAULT 'unmatched', -- 'unmatched', 'matched', 'discarded'
  matched_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Users can manually match unmatched emails to permits from the UI.

---

## Part 7: Q2 — Team Collaboration & Roles

### 7.1 RBAC Permission Matrix

| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| View projects/permits | ✅ | ✅ | ✅ | ✅ |
| Create/edit projects | ✅ | ✅ | ✅ | ❌ |
| Delete projects | ✅ | ✅ | ❌ | ❌ |
| Resolve comments | ✅ | ✅ | ✅ | ❌ |
| Assign comments | ✅ | ✅ | ✅ | ❌ |
| Upload documents | ✅ | ✅ | ✅ | ❌ |
| Delete documents | ✅ | ✅ | ❌ | ❌ |
| Invite team members | ✅ | ✅ | ❌ | ❌ |
| Change member roles | ✅ | ✅ | ❌ | ❌ |
| Remove members | ✅ | ✅ | ❌ | ❌ |
| Edit org settings | ✅ | ✅ | ❌ | ❌ |
| Delete organization | ✅ | ❌ | ❌ | ❌ |

### 7.2 API Endpoints

```
POST   /api/team/invite           — Send invitation email
POST   /api/team/accept           — Accept invitation (via token)
PATCH  /api/team/members/[id]     — Change role
DELETE /api/team/members/[id]     — Remove member
GET    /api/team/members          — List team members
GET    /api/team/invitations      — List pending invitations
DELETE /api/team/invitations/[id] — Revoke invitation
```

### 7.3 Invite Flow

```
Admin clicks "Invite" → enters email + role
       │
       ▼
Create team_invitation record with token
       │
       ▼
Send invitation email (via Resend/SendGrid)
       │
       ▼
Recipient clicks link → /app/invite/[token]
       │
       ├── If existing user: Accept → create team_member
       └── If new user: Signup → auth callback → accept → create team_member
```

### 7.4 RLS Policies for Multi-Tenant Isolation

```sql
-- Core policy: users can only see data in their organization
CREATE POLICY "org_isolation_projects" ON projects
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Role-based: only admin+ can delete
CREATE POLICY "admin_delete_projects" ON projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND organization_id = projects.organization_id
      AND role IN ('owner', 'admin')
    )
  );

-- Comments: org members can view, members+ can create/update
CREATE POLICY "org_view_comments" ON comments
  FOR SELECT USING (
    permit_id IN (
      SELECT id FROM permits WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Notifications: only the recipient can see their own
CREATE POLICY "own_notifications" ON notifications
  FOR ALL USING (recipient_id = auth.uid());
```

---

## Part 8: Q2 — Notification System

### 8.1 Architecture

```
Event occurs (comment assigned, status change, etc.)
       │
       ▼
createNotification() helper function
       │
       ├── Insert into notifications table (in-app)
       │
       ├── Check notification_preferences
       │
       └── If email enabled → queue email via /api/email/send
```

### 8.2 Notification Helper

```typescript
// lib/notifications.ts
async function createNotification(params: {
  recipientId: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  body?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = getSupabaseAdminClient();

  // 1. Insert in-app notification
  await supabase.from('notifications').insert(params);

  // 2. Check preferences
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('profile_id', params.recipientId)
    .eq('notification_type', params.type)
    .single();

  // 3. Send email if enabled (default: true)
  if (!prefs || prefs.email) {
    await fetch('/api/email/send', {
      method: 'POST',
      body: JSON.stringify({
        to: recipientEmail,
        subject: params.title,
        html: renderNotificationEmail(params),
      }),
    });
  }
}
```

### 8.3 Frontend: Notification Bell

```typescript
// components/app/notification-bell.tsx
// - Bell icon in app topbar
// - Badge with unread count
// - Dropdown with recent notifications
// - Mark as read on click
// - "View all" link to /app/notifications
// - Poll every 30s for new notifications (or Supabase Realtime)
```

### 8.4 Email Provider Integration

**Recommendation: Resend** (best DX for Next.js/Vercel)

```typescript
// lib/email/sender.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(params: OutboundEmailPayload) {
  return resend.emails.send({
    from: 'EntitleFlow <notifications@entitleflow.com>',
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}
```

---

## Part 9: Q2 — Project Map View

### 9.1 Implementation

The `ProjectMap` component already exists at `components/maps/ProjectMap.tsx`. Wire it into a new tab or page:

**Route:** `app/app/projects/map/page.tsx` (or a tab on the projects list page)

### 9.2 Data Requirements

- Projects need `latitude` and `longitude` columns (added in schema changes above)
- Geocode on project creation using existing `/api/geocode` endpoint
- Store coordinates at creation time, not on every map render

### 9.3 Map Features

- Color-coded markers by project status (active=green, on_hold=yellow, draft=gray)
- Click marker → popup with project name, status, permit count → link to detail page
- Filter sidebar: status, jurisdiction, project type
- Cluster markers when zoomed out (use `@vis.gl/react-google-maps` clustering)

---

## Part 10: Q2 — Advanced Analytics

### 10.1 New Analytics Queries

```sql
-- Average days from submission to approval, by jurisdiction
SELECT
  j.name as jurisdiction,
  AVG(EXTRACT(EPOCH FROM (
    psh_approved.changed_at - psh_submitted.changed_at
  )) / 86400) as avg_days_to_approval
FROM permits p
JOIN jurisdictions j ON p.jurisdiction_id = j.id
JOIN permit_status_history psh_submitted ON psh_submitted.permit_id = p.id
  AND psh_submitted.new_status = 'submitted'
JOIN permit_status_history psh_approved ON psh_approved.permit_id = p.id
  AND psh_approved.new_status IN ('approved', 'approved_with_conditions')
GROUP BY j.name;

-- Comment resolution rate by category
SELECT
  category,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_resolved) as resolved,
  ROUND(COUNT(*) FILTER (WHERE is_resolved)::DECIMAL / COUNT(*) * 100, 1) as resolution_rate
FROM comments
WHERE organization_id = $1
GROUP BY category
ORDER BY total DESC;

-- Reviewer comment patterns (who sends the most comments, what categories)
SELECT
  author_name,
  category,
  COUNT(*) as comment_count,
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400) as avg_resolution_days
FROM comments
WHERE source = 'jurisdiction' AND organization_id = $1
GROUP BY author_name, category
ORDER BY comment_count DESC;
```

### 10.2 Dashboard Components

- **Approval Timeline Chart** — Bar chart showing avg days by jurisdiction
- **Resolution Funnel** — Open → In Progress → Resolved conversion rates
- **Category Heatmap** — Which comment categories take longest to resolve
- **Reviewer Patterns** — Which reviewers generate the most revision requests
- **Trend Lines** — Week-over-week comment volume and resolution rates

---

## Part 11: Security & Operations

### 11.1 Rate Limiting Strategy

| Endpoint | Limit | Window | Implementation |
|----------|-------|--------|----------------|
| `/api/ai/*` | 20 requests | per minute per user | Vercel Edge Config or in-memory counter |
| `/api/documents/upload` | 10 uploads | per hour per org | Database counter check |
| `/api/email/inbound` | 100 emails | per hour per org | Webhook counter |
| `/api/team/invite` | 20 invites | per day per org | Database counter |
| `/api/leads` | 5 submissions | per minute per IP | Vercel Edge middleware |

**Implementation:** Use `@upstash/ratelimit` with Vercel KV (simplest for serverless), or a Supabase-based counter table if avoiding new infrastructure.

### 11.2 Input Validation

Every API route must validate with Zod:

```typescript
// lib/validation/comments.ts
export const resolveCommentSchema = z.object({
  resolution_note: z.string().max(2000).optional(),
});

export const assignCommentSchema = z.object({
  assigned_to: z.string().uuid(),
});

export const bulkActionSchema = z.object({
  comment_ids: z.array(z.string().uuid()).min(1).max(100),
  action: z.enum(['resolve', 'assign']),
  assigned_to: z.string().uuid().optional(),
});
```

### 11.3 File Upload Security

- Validate MIME type via magic bytes (not just extension)
- Max file size: 100MB (already enforced)
- Allowed types: PDF, PNG, JPG, TIFF, DOC, DOCX, XLS, XLSX
- Scan file names for path traversal (strip `../`, null bytes)
- Store with UUID filename, not original name

### 11.4 AI Cost Controls

- **Budget alerts:** Monitor Vertex AI billing daily; alert at $50/day
- **Per-request limits:** Max 50KB input text for summarize, 5000 chars for classify
- **Caching:** Cache identical classification requests (same text hash) for 24 hours
- **Circuit breaker:** If AI error rate >20% in 5 minutes, pause AI features and show manual fallback

### 11.5 Monitoring Checklist

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| API error rate | Vercel Analytics | >5% in 5 min |
| Document AI latency | GCP Monitoring | >30s avg |
| Vertex AI failures | GCP Monitoring | >10% error rate |
| Supabase connection pool | Supabase Dashboard | >80% utilization |
| GCS storage size | GCP Monitoring | >50GB |
| Email delivery failures | Resend Dashboard | >5% bounce rate |

---

## Part 12: Implementation Sequence

### Phase 1: Q1 Completion (Weeks 1–6)

#### Week 1–2: Comment System Foundation
- [ ] Create comment API routes (CRUD, resolve, assign, bulk)
- [ ] Add Zod validation schemas for all comment operations
- [ ] Build `useCommentActions` hook with optimistic updates
- [ ] Build CommentCard, CommentFilterBar, BulkActionsToolbar components
- [ ] Build AI response panel component

#### Week 3: Project Detail Page
- [ ] Create `app/app/projects/[id]/page.tsx` server component
- [ ] Build ProjectHeader, ProjectTabs, OverviewTab components
- [ ] Build PermitsTab (cards linking to permit detail)
- [ ] Build DocumentsTab (upload + listing)
- [ ] Build ActivityTab (timeline)
- [ ] Edit project modal with react-hook-form + Zod

#### Week 4: Permit Detail Page
- [ ] Create `app/app/permits/[id]/page.tsx` server component
- [ ] Build PermitHeader, PermitStatusTimeline components
- [ ] Integrate CommentsSection as primary tab
- [ ] Build DocumentsSection, DeadlineTracker
- [ ] Build ActivityHistory
- [ ] Status change modal with valid transitions

#### Week 5: Integration & Polish
- [ ] Wire AI suggest-response into comment cards
- [ ] Add threading support (parent/child rendering)
- [ ] Loading skeletons for all new components
- [ ] Error states and empty states
- [ ] Framer Motion animations for comment list + modals

#### Week 6: Testing & QA
- [ ] End-to-end test: upload document → parse → view comments → resolve
- [ ] Responsive design pass (mobile, tablet, desktop)
- [ ] Accessibility audit (keyboard nav, screen reader, contrast)
- [ ] Run `npm run typecheck && npm run lint && npm run build`

### Phase 2: Q2 Core Product Loop (Weeks 7–18)

#### Weeks 7–8: Auto-Parse Pipeline
- [ ] Run database migration for `parse_jobs` table + column additions
- [ ] Build `/api/documents/[id]/auto-parse` route
- [ ] Wire auto-parse trigger into document upload flow
- [ ] Build parse status UI (progress indicator on document card)
- [ ] Error handling + partial results support

#### Weeks 9–10: Team Collaboration
- [ ] Run migration for `team_members`, `team_invitations` tables
- [ ] Build team API routes (invite, accept, remove, role change)
- [ ] Implement invitation email templates
- [ ] Build Team Management UI (`/app/settings/team`)
- [ ] Wire RBAC checks into existing API routes
- [ ] Update RLS policies

#### Weeks 11–12: Email-to-Comment Enhancement
- [ ] Enhance `/api/email/inbound` with AI classification
- [ ] Build email queue table and unmatched email UI
- [ ] Manual email-to-permit matching interface
- [ ] Email provider integration (Resend) for outbound

#### Weeks 13–14: Notification System
- [ ] Run migration for `notifications`, `notification_preferences`
- [ ] Build `createNotification` helper
- [ ] Wire notifications into: comment assignment, status changes, deadlines, parse completion
- [ ] Build NotificationBell component + dropdown
- [ ] Build notification preferences page
- [ ] Email digest system (daily/weekly summary)

#### Weeks 15–16: Map View + Analytics
- [ ] Add geocoding to project creation flow
- [ ] Build Project Map page with status filters + clustering
- [ ] Build Advanced Analytics dashboard components
- [ ] Approval timeline chart, resolution funnel, category heatmap
- [ ] Reviewer patterns table

#### Weeks 17–18: Integration, Security, Launch Prep
- [ ] Rate limiting on all new endpoints
- [ ] Full RLS policy audit
- [ ] Load testing with realistic data volumes
- [ ] Security review of email ingestion pipeline
- [ ] Documentation update
- [ ] `npm run typecheck && npm run lint && npm run build`

---

## Part 13: Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Vercel timeout on large PDF parse | Medium | Medium | Start with sync, migrate to edge function if needed |
| Vertex AI cost spike | Low | High | Budget alerts, per-request limits, caching |
| Email spoofing creates bad comments | Medium | Medium | Webhook secret, sender domain validation, flagging |
| RLS policy gap leaks data cross-org | Low | Critical | Automated RLS tests, security audit before launch |
| Comment volume overwhelms UI | Low | Medium | Virtual scrolling, pagination, server-side filtering |
| Team invitation token brute force | Low | Medium | Rate limit, 7-day expiry, single-use tokens |

---

## Part 14: Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to resolve a comment | <5 min (from 30+ min manual) | `resolved_at - created_at` avg |
| Auto-parse success rate | >90% of uploaded PDFs | `parse_jobs` completion rate |
| AI suggestion acceptance rate | >60% inserted as replies | Track "Insert as Reply" clicks |
| Email-to-comment match rate | >85% auto-matched | `email_queue` matched vs unmatched |
| Team adoption | >2 members per org within 30 days | `team_members` count per org |
| Notification engagement | >50% click-through | `notifications` read rate |

---

## Appendix A: Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Email provider | Resend | Best DX for Next.js/Vercel, generous free tier, React Email support |
| Rate limiting | @upstash/ratelimit + Vercel KV | Serverless-native, no new infrastructure |
| Real-time updates | Polling (30s) initially → Supabase Realtime later | Simpler to ship; real-time is a Q3 optimization |
| Background jobs | Sync in API routes initially → Supabase Edge Functions if needed | Avoid premature infra complexity |
| State management | Server components + useState + custom hooks | No need for Redux/Zustand at current scale |
| Charts | Recharts (already available) | Already in deps, good shadcn integration |

## Appendix B: Environment Variables to Add

```bash
# Email sending (Q2)
RESEND_API_KEY=re_...

# Rate limiting (Q2)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Notification from address
NOTIFICATION_FROM_EMAIL=notifications@entitleflow.com
```

---

*This plan was produced by a three-panel architecture review committee (Backend, Frontend, Security/Ops) with full codebase analysis. All recommendations are grounded in the existing codebase at `/PermitPilot` as of March 21, 2026.*
