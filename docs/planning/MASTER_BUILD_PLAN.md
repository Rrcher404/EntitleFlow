# EntitleFlow Master Build Plan
## First Customer Onboarding — 7 Working Day Sprint

**Document Version:** 1.0  
**Last Updated:** 2026-03-21  
**Target Launch:** 2026-03-30 (EOD)  
**Current Completion:** ~85%

---

## 1. Executive Summary

### Platform Overview
EntitleFlow is a Next.js 16 + Supabase + GCP land entitlement operations platform designed to streamline permit workflows, document management, and team collaboration. The platform leverages AI (Gemini + MiMo-v2-Pro) for intelligent comment extraction, resubmittal planning, and automated response generation.

### Current State
The core infrastructure is production-ready:
- **Database:** 17 tables fully migrated and RLS policies in place
- **APIs:** All CRUD endpoints for comments, documents, teams, notifications built
- **AI Layer:** 6 specialized agents + FlowE chat assistant (Gemini backbone + OpenRouter enhancement)
- **Frontend:** Core pages deployed (dashboard, projects, permits, documents)
- **Deployment:** Live on Vercel with GitHub integration
- **Authentication:** Supabase + middleware fully functional

### Critical Gaps Blocking Customer Onboarding
1. **My Tasks Page** — No user-centric task view for assigned comments
2. **Notification Triggers** — System exists but not wired to actions (comment_assigned, comment_resolved, etc.)
3. **Resubmittal UI** — API exists, but no frontend to view/edit/export plans and response letters
4. **Parse Job Feedback** — Users don't see document AI parsing progress after upload
5. **Comment Threading Polish** — AI response styling inconsistent, email-source badges missing
6. **Response Tracking Dashboard** — No visibility into project resolution progress
7. **Settings Pages** — No team or notification preference management UI
8. **Test Fixtures & Automation** — No test data or automated test suite for QA

### Success Criteria for First Customer Readiness
- ✓ Core user workflow: upload → parse → assign → comment → resolve → export fully functional
- ✓ All notification triggers firing correctly
- ✓ Resubmittal packages generated and exportable
- ✓ Settings pages complete (team, profile, notifications)
- ✓ Dashboard shows actionable team workload data
- ✓ No regressions on existing features
- ✓ Customer onboarding checklist documented and testable
- ✓ Test fixtures available for demo/QA

---

## 2. Sprint Timeline (7 Working Days)

### Day 1-2: Core Workflow Completion (Mon-Tue)

#### 2.1 Build "My Tasks" Page (`/app/app/tasks`)

**Objective:** Deliver a user-centric view of all comments assigned to the current user, grouped by permit, with filtering and quick actions.

**Files to Create:**
```
/app/app/tasks/page.tsx                  (Main page, 800 LOC)
/app/components/TasksPageContent.tsx     (Page logic, 600 LOC)
/app/components/TaskCard.tsx              (Individual task display, 200 LOC)
/app/components/TaskFilters.tsx           (Status, priority, deadline filters, 250 LOC)
```

**Files to Modify:**
```
/app/layout.tsx                           (Add "My Tasks" nav link)
/app/components/SidebarNav.tsx           (Update active route highlight)
```

**API Endpoints Consumed:**
```
GET /api/comments/assigned?user_id={id}&status={status}&permit_id={permit_id}&sort={field}
GET /api/permits/{permit_id}              (For task context)
PATCH /api/comments/{id}/status          (Mark as resolved/in_progress)
POST /api/comments/{id}/assign           (Reassign task)
DELETE /api/comments/{id}                (Optional cleanup)
```

**Database Queries:**
```sql
-- Fetch assigned comments with permit context
SELECT 
  c.id, c.content, c.status, c.priority, c.deadline,
  c.ai_response, c.created_at, c.assigned_to,
  p.id as permit_id, p.title as permit_title, p.project_id,
  u.email as created_by
FROM comments c
JOIN documents d ON c.document_id = d.id
JOIN permits p ON d.permit_id = p.id
JOIN users u ON c.created_by = u.id
WHERE c.assigned_to = $1
ORDER BY c.deadline ASC, c.priority DESC
LIMIT 100;
```

**Component Structure:**
```
TasksPageContent
  ├─ TaskFilters (status, priority, deadline range, permit filter)
  ├─ TaskGrouping (by permit with expand/collapse)
  │  └─ TaskCard (individual comment card)
  │     ├─ Comment preview (first 200 chars)
  │     ├─ Quick action buttons (mark resolved, reassign, view document)
  │     ├─ Metadata (deadline, priority, created_by)
  │     └─ AI response preview (if exists)
```

**Acceptance Criteria:**
- [ ] User sees all comments assigned to them, grouped by permit
- [ ] Filtering by status (open, in_progress, resolved) works
- [ ] Filtering by priority (low, medium, high, critical) works
- [ ] Filtering by deadline range (overdue, this week, this month, upcoming) works
- [ ] Clicking "View Document" navigates to permit detail with comment highlighted
- [ ] Clicking "Mark Resolved" updates comment status and removes from list
- [ ] Reassign dropdown works with team members
- [ ] Page shows empty state when no assigned tasks
- [ ] Load time under 1.5 seconds for 50 tasks

**Key Decisions:**
- Group by permit (not document) for clearer context
- Show last updated date, not creation date (more relevant for status)
- "Overdue" comments highlighted in red
- Quick actions in card footer, no modal required

---

#### 2.2 Wire Notification Triggers

**Objective:** Connect the comment lifecycle to notification creation, ensuring users receive real-time updates on assignment, resolution, and parsing.

**Files to Create:**
```
/app/lib/notifications/triggers.ts       (Trigger dispatcher, 400 LOC)
/app/lib/notifications/templates.ts      (Message templates, 200 LOC)
```

**Files to Modify:**
```
/app/api/comments/route.ts               (Add POST trigger for comment_created, ai_response_generated)
/app/api/comments/[id]/route.ts          (Add PATCH trigger for status change, assignment)
/app/api/documents/[id]/parse/route.ts   (Add parse start/complete triggers)
/app/api/webhooks/document-ai.ts         (Add parse_complete notification)
```

**Notification Triggers to Wire:**

| Trigger | Event | Recipients | Template |
|---------|-------|-----------|----------|
| `comment_assigned` | Comment assigned to user | Assigned user | "You've been assigned to comment: {permit_title} / {comment_preview}" |
| `comment_resolved` | Comment marked resolved | Original creator, assignee | "Comment resolved on {permit_title}" |
| `ai_parse_complete` | Document AI finishes parsing | Document uploader | "{doc_name}: {X} comments extracted" |
| `ai_response_generated` | AI generates response to comment | Assigned user | "AI response ready: {permit_title}" |
| `deadline_approaching` | 24h before deadline | Assigned user | "Deadline in 24h: {permit_title}" |
| `team_member_invited` | User invited to team | Invited user | "{inviter} invited you to {team_name}" |

**Implementation Pattern:**
```typescript
// /app/lib/notifications/triggers.ts

export async function triggerNotification(
  event: NotificationEvent,
  payload: any
) {
  const { recipient_id, title, message, metadata } = buildNotificationData(event, payload);
  
  // Create DB record
  const { data: notification } = await supabase
    .from('notifications')
    .insert({
      user_id: recipient_id,
      title,
      message,
      type: event,
      metadata,
      read: false,
    });
  
  // Send email (async)
  sendEmailNotification(recipient_id, title, message);
  
  // Fire Realtime broadcast (future: for real-time UI updates)
  broadcastNotification(recipient_id, notification);
}

// Called from comment assignment
export async function handleCommentAssigned(commentId: string, assignedTo: string) {
  const comment = await fetchCommentWithContext(commentId);
  
  await triggerNotification('comment_assigned', {
    recipient_id: assignedTo,
    comment_id: commentId,
    permit_title: comment.permit.title,
    comment_preview: comment.content.substring(0, 100),
  });
}
```

**Database Changes (if needed):**
```sql
-- Add notification_type enum if missing
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS triggered_by VARCHAR(50);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON notifications(user_id, read, created_at DESC);
```

**Email Notification Service:**
All emails sent via existing SendGrid integration in `/app/lib/email.ts`:
```typescript
import { sendEmail } from '@/lib/email';

await sendEmail({
  to: userEmail,
  subject: `${title} — EntitleFlow`,
  template: 'notification',
  data: {
    message,
    action_url: metadataUrl,
    action_text: 'View in EntitleFlow',
  },
});
```

**Acceptance Criteria:**
- [ ] When comment is assigned, notification created in DB within 100ms
- [ ] Email sent to assigned user within 5 seconds
- [ ] When comment marked resolved, notification sent to original creator
- [ ] When document finishes parsing, notification shows count of extracted comments
- [ ] Duplicate notifications never sent (idempotency check)
- [ ] Email contains direct link to relevant page (permit detail, task, etc.)
- [ ] Unread count updates correctly in sidebar

---

#### 2.3 Wire Parse Job Status Feedback

**Objective:** Users can see real-time parsing progress after uploading a document, with status updates as Document AI processes the document.

**Files to Create:**
```
/app/components/DocumentParsingStatus.tsx     (Polling component, 250 LOC)
/app/api/documents/[id]/parse-status/route.ts (Status endpoint, 150 LOC)
```

**Files to Modify:**
```
/app/app/app/permits/[id]/page.tsx           (Embed DocumentParsingStatus in documents list)
/app/api/documents/route.ts                  (Add parse_jobs trigger on upload)
```

**API Endpoint to Create:**
```typescript
// GET /api/documents/[id]/parse-status
// Returns: { status: 'queued'|'processing'|'complete'|'error', 
//           progress: 0-100, comments_found: number, error_message?: string }

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { data: document } = await supabase
    .from('documents')
    .select('*, parse_jobs(*)')
    .eq('id', params.id)
    .single();
  
  if (!document.parse_jobs || document.parse_jobs.length === 0) {
    return NextResponse.json({ status: 'not_started', progress: 0 });
  }
  
  const latestJob = document.parse_jobs[0];
  return NextResponse.json({
    status: latestJob.status,
    progress: latestJob.progress_percent || 0,
    comments_found: latestJob.comments_extracted || 0,
    error_message: latestJob.error_message,
    started_at: latestJob.created_at,
    completed_at: latestJob.completed_at,
  });
}
```

**DocumentParsingStatus Component:**
```typescript
// /app/components/DocumentParsingStatus.tsx

'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

export function DocumentParsingStatus({ documentId }: { documentId: string }) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/documents/${documentId}/parse-status`);
      const data = await res.json();
      setStatus(data);
      setLoading(false);
      
      // Stop polling when complete or error
      if (data.status === 'complete' || data.status === 'error') {
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds
    
    return () => clearInterval(interval);
  }, [documentId]);
  
  if (loading) return <div>Loading...</div>;
  if (status.status === 'not_started') return null;
  
  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <div className="flex items-center gap-2 mb-2">
        {status.status === 'processing' && <Loader className="animate-spin" />}
        {status.status === 'complete' && <CheckCircle className="text-green-600" />}
        {status.status === 'error' && <AlertCircle className="text-red-600" />}
        <span className="font-semibold capitalize">{status.status}</span>
      </div>
      
      {status.status === 'processing' && (
        <>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${status.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">{status.progress}% complete</p>
        </>
      )}
      
      {status.status === 'complete' && (
        <p className="text-sm text-green-700">
          ✓ Extracted {status.comments_found} comments
        </p>
      )}
      
      {status.status === 'error' && (
        <p className="text-sm text-red-700">{status.error_message}</p>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Status component appears on permit detail after upload
- [ ] Shows "Queued", "Processing (X%)", "Complete (Y comments)", or "Error"
- [ ] Progress bar updates every 2 seconds
- [ ] Polling stops when status is complete or error
- [ ] Clicking into document shows final comment count
- [ ] Works for simultaneous uploads (no interference)

---

### Day 3-4: Resubmittal & Response Package (Wed-Thu)

#### 2.4 Build Resubmittal Plan UI

**Objective:** Surface the AI-generated resubmittal plan on the permit detail page, allowing users to view, edit, and export the plan.

**Files to Create:**
```
/app/components/ResubmittalPlanPanel.tsx     (Full panel with edit, 500 LOC)
/app/components/ResubmittalActionItem.tsx    (Action item card, 150 LOC)
/app/components/ExportResubmittalButton.tsx  (Export dropdown, 200 LOC)
```

**Files to Modify:**
```
/app/app/app/permits/[id]/page.tsx          (Add ResubmittalPlanPanel to layout)
/app/api/permits/[id]/resubmittal/route.ts  (New endpoint: GET to fetch/regenerate)
```

**API Endpoint (Consume Existing):**
```
POST /api/ai/resubmittal-plan
Body: { permit_id: string }
Response: { 
  plan: {
    items: [{ id, title, description, priority, status, deadline, assigned_to }],
    summary: string,
    timeline: string,
  }
}
```

**ResubmittalPlanPanel Component:**
```typescript
// /app/components/ResubmittalPlanPanel.tsx

'use client';

import { useState } from 'react';
import { FileText, Plus, Trash2, Download } from 'lucide-react';
import { ExportResubmittalButton } from './ExportResubmittalButton';

export function ResubmittalPlanPanel({ permitId, initialPlan }: any) {
  const [plan, setPlan] = useState(initialPlan);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleRegenerate = async () => {
    setLoading(true);
    const res = await fetch(`/api/ai/resubmittal-plan`, {
      method: 'POST',
      body: JSON.stringify({ permit_id: permitId }),
    });
    const { plan: newPlan } = await res.json();
    setPlan(newPlan);
    setLoading(false);
  };
  
  const handleAddItem = () => {
    setPlan({
      ...plan,
      items: [
        ...plan.items,
        {
          id: `new_${Date.now()}`,
          title: 'New Action',
          description: '',
          priority: 'medium',
          status: 'pending',
          deadline: null,
          assigned_to: null,
        },
      ],
    });
    setEditing(true);
  };
  
  const handleDeleteItem = (itemId: string) => {
    setPlan({
      ...plan,
      items: plan.items.filter((i: any) => i.id !== itemId),
    });
  };
  
  const handleUpdateItem = (itemId: string, updates: any) => {
    setPlan({
      ...plan,
      items: plan.items.map((i: any) => 
        i.id === itemId ? { ...i, ...updates } : i
      ),
    });
  };
  
  if (!plan) return null;
  
  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText />
          Resubmittal Plan
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Regenerating...' : 'Regenerate'}
          </button>
          <ExportResubmittalButton plan={plan} />
        </div>
      </div>
      
      <p className="text-gray-700 mb-4">{plan.summary}</p>
      <p className="text-sm text-gray-600 mb-6 border-l-4 border-blue-300 pl-3">
        Timeline: {plan.timeline}
      </p>
      
      <div className="space-y-3">
        {plan.items.map((item: any) => (
          <ResubmittalActionItem
            key={item.id}
            item={item}
            editing={editing}
            onUpdate={(updates) => handleUpdateItem(item.id, updates)}
            onDelete={() => handleDeleteItem(item.id)}
          />
        ))}
      </div>
      
      {editing && (
        <button
          onClick={handleAddItem}
          className="mt-4 px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center gap-2"
        >
          <Plus size={16} /> Add Action Item
        </button>
      )}
      
      <div className="mt-4 flex gap-2">
        {editing && (
          <>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </>
        )}
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Edit Plan
          </button>
        )}
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Resubmittal plan displays on permit detail page
- [ ] Shows summary, timeline, and all action items
- [ ] "Regenerate" button calls AI and updates plan
- [ ] "Edit Plan" mode allows adding, editing, deleting items
- [ ] Export button generates DOCX and PDF
- [ ] Changes persist to database (optional for first cut)
- [ ] Shows empty state if no plan generated yet

---

#### 2.5 Build Response Letter Viewer & Editor

**Objective:** Display AI-generated response letter with editing and export capabilities.

**Files to Create:**
```
/app/components/ResponseLetterPanel.tsx      (Full panel, 600 LOC)
/app/components/ResponseLetterEditor.tsx     (Draft edit mode, 300 LOC)
/app/api/permits/[id]/response-letter/route.ts (GET/PATCH endpoint, 200 LOC)
```

**Files to Modify:**
```
/app/app/app/permits/[id]/page.tsx          (Add ResponseLetterPanel to layout)
```

**API Endpoints:**
```typescript
// GET /api/permits/[id]/response-letter
// Returns: { letter: string, generated_at, status: 'draft'|'approved'|'sent' }

// PATCH /api/permits/[id]/response-letter
// Body: { letter: string, status?: 'draft'|'approved'|'sent' }
// Returns: { success: boolean, letter: string }

// POST /api/permits/[id]/response-letter/export
// Query: ?format=docx|pdf
// Returns: File download
```

**ResponseLetterPanel Component:**
```typescript
// /app/components/ResponseLetterPanel.tsx

'use client';

import { useState } from 'react';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { ResponseLetterEditor } from './ResponseLetterEditor';

export function ResponseLetterPanel({ permitId, initialLetter }: any) {
  const [letter, setLetter] = useState(initialLetter);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'draft' | 'approved' | 'sent'>(
    initialLetter?.status || 'draft'
  );
  
  const handleRegenerate = async () => {
    setLoading(true);
    const res = await fetch(`/api/ai/response-letter`, {
      method: 'POST',
      body: JSON.stringify({ permit_id: permitId }),
    });
    const { letter: newLetter } = await res.json();
    setLetter(newLetter);
    setStatus('draft');
    setEditing(false);
    setLoading(false);
  };
  
  const handleSave = async (updatedLetter: string) => {
    setLoading(true);
    const res = await fetch(`/api/permits/${permitId}/response-letter`, {
      method: 'PATCH',
      body: JSON.stringify({ letter: updatedLetter, status }),
    });
    const { letter: saved } = await res.json();
    setLetter(saved);
    setEditing(false);
    setLoading(false);
  };
  
  const handleExport = async (format: 'docx' | 'pdf') => {
    const res = await fetch(
      `/api/permits/${permitId}/response-letter/export?format=${format}`
    );
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-letter.${format === 'docx' ? 'docx' : 'pdf'}`;
    a.click();
  };
  
  if (!letter) {
    return (
      <div className="border rounded-lg p-6 bg-gray-50 text-center">
        <FileText className="mx-auto mb-2 text-gray-400" size={32} />
        <p className="text-gray-600 mb-4">No response letter generated yet</p>
        <button
          onClick={handleRegenerate}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Response Letter'}
        </button>
      </div>
    );
  }
  
  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText />
          Response Letter
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            {loading ? 'Regenerating...' : 'Regenerate'}
          </button>
          <button
            onClick={() => handleExport('docx')}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <Download size={16} /> DOCX
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <Download size={16} /> PDF
          </button>
        </div>
      </div>
      
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-gray-600">Status:</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="px-3 py-1 border rounded"
        >
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="sent">Sent</option>
        </select>
      </div>
      
      {editing ? (
        <ResponseLetterEditor
          letter={letter}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
          loading={loading}
        />
      ) : (
        <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap font-serif mb-4">
          {letter}
        </div>
      )}
      
      {!editing && (
        <button
          onClick={() => setEditing(true)}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Edit Letter
        </button>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Response letter displays on permit detail page
- [ ] "Regenerate" button re-runs AI and updates letter
- [ ] "Edit Letter" mode allows inline editing
- [ ] Export to DOCX produces formatted document
- [ ] Export to PDF produces printable output
- [ ] Status dropdown changes draft/approved/sent state
- [ ] Changes persist to database
- [ ] Shows empty state with generate button if no letter yet

---

#### 2.6 Add Inline "Generate AI Response" Button to Comments

**Objective:** Allow users to generate AI responses to individual comments directly from the comment thread UI.

**Files to Modify:**
```
/app/components/CommentCard.tsx              (Add button, styling)
/app/api/comments/[id]/ai-response/route.ts  (New POST endpoint)
```

**New Endpoint:**
```typescript
// POST /api/comments/[id]/ai-response
// Returns: { response: string, comment_id: string }

// Implementation calls Vertex AI with comment context
```

**UI Addition to CommentCard:**
```typescript
// In /app/components/CommentCard.tsx, add button to comment actions

<button
  onClick={handleGenerateAIResponse}
  disabled={loading}
  className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 disabled:opacity-50 flex items-center gap-1"
>
  {loading ? (
    <>
      <Loader size={14} className="animate-spin" />
      Generating...
    </>
  ) : (
    <>
      <Wand2 size={14} />
      Generate Response
    </>
  )}
</button>
```

**Acceptance Criteria:**
- [ ] Button appears in comment card action bar
- [ ] Clicking generates response via AI
- [ ] Response appears below comment with "AI Generated" badge
- [ ] Shows loading state while generating
- [ ] Handles errors gracefully

---

### Day 5: Team & Settings Pages (Fri)

#### 2.7 Build Settings Page (`/app/app/settings`)

**Objective:** Create user profile and notification preference management pages.

**Files to Create:**
```
/app/app/settings/page.tsx                      (Settings home, 400 LOC)
/app/app/settings/profile/page.tsx              (Profile edit, 300 LOC)
/app/app/settings/notifications/page.tsx        (Notification preferences, 400 LOC)
/app/app/settings/team/page.tsx                 (Team management, 500 LOC)
/app/components/SettingsSideNav.tsx             (Sub-navigation, 150 LOC)
```

**Files to Modify:**
```
/app/layout.tsx                                 (Add /settings route to nav)
/app/components/SidebarNav.tsx                  (Add settings link)
```

**API Endpoints to Consume:**
```
GET /api/users/profile                          (Current user profile)
PATCH /api/users/profile                        (Update name, email, avatar)
GET /api/users/notifications/preferences        (Notification settings)
PATCH /api/users/notifications/preferences      (Update preferences)
GET /api/teams/{team_id}/members                (Team members list)
POST /api/teams/{team_id}/invite                (Invite team member)
PATCH /api/teams/{team_id}/members/{user_id}    (Update role)
DELETE /api/teams/{team_id}/members/{user_id}   (Remove member)
```

**SettingsSideNav Component:**
```typescript
// /app/components/SettingsSideNav.tsx

export function SettingsSideNav() {
  const currentPath = usePathname();
  
  const sections = [
    { label: 'Account', href: '/app/settings', icon: <User /> },
    { label: 'Profile', href: '/app/settings/profile', icon: <UserEdit /> },
    { label: 'Notifications', href: '/app/settings/notifications', icon: <Bell /> },
    { label: 'Team', href: '/app/settings/team', icon: <Users /> },
  ];
  
  return (
    <nav className="w-48 border-r">
      {sections.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className={`flex items-center gap-2 px-4 py-3 ${
            currentPath === section.href 
              ? 'bg-blue-50 border-l-4 border-blue-600' 
              : 'hover:bg-gray-50'
          }`}
        >
          {section.icon}
          {section.label}
        </Link>
      ))}
    </nav>
  );
}
```

**Settings Profile Page:**
```typescript
// /app/app/settings/profile/page.tsx

'use client';

import { useState, useEffect } from 'react';

export default function ProfileSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  useEffect(() => {
    fetch('/api/users/profile')
      .then(r => r.json())
      .then(setProfile);
  }, []);
  
  const handleUpdate = async () => {
    setLoading(true);
    const res = await fetch('/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(profile),
    });
    const updated = await res.json();
    setProfile(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setLoading(false);
  };
  
  if (!profile) return <div>Loading...</div>;
  
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      
      {saved && <div className="p-3 bg-green-50 border border-green-300 rounded mb-4">✓ Saved</div>}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={profile.full_name || ''}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={profile.email || ''}
            disabled
            className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Avatar URL</label>
          <input
            type="url"
            value={profile.avatar_url || ''}
            onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
        
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
```

**Settings Notifications Page:**
```typescript
// /app/app/settings/notifications/page.tsx

'use client';

import { useState, useEffect } from 'react';

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetch('/api/users/notifications/preferences')
      .then(r => r.json())
      .then(setPrefs);
  }, []);
  
  const handleUpdate = async () => {
    setLoading(true);
    const res = await fetch('/api/users/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify(prefs),
    });
    const updated = await res.json();
    setPrefs(updated);
    setLoading(false);
  };
  
  if (!prefs) return <div>Loading...</div>;
  
  const notificationTypes = [
    { id: 'comment_assigned', label: 'Comment Assigned to Me' },
    { id: 'comment_resolved', label: 'Comment Resolved' },
    { id: 'ai_response_generated', label: 'AI Response Generated' },
    { id: 'deadline_approaching', label: 'Deadline Approaching' },
    { id: 'team_member_invited', label: 'Team Member Invited' },
    { id: 'parse_complete', label: 'Document Parsing Complete' },
  ];
  
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Notification Preferences</h1>
      
      <div className="space-y-3">
        {notificationTypes.map((type) => (
          <label key={type.id} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50">
            <input
              type="checkbox"
              checked={prefs[type.id] !== false}
              onChange={(e) => setPrefs({ ...prefs, [type.id]: e.target.checked })}
              className="w-5 h-5"
            />
            <span>{type.label}</span>
          </label>
        ))}
      </div>
      
      <div className="mt-6">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={prefs.email_digest !== false}
            onChange={(e) => setPrefs({ ...prefs, email_digest: e.target.checked })}
            className="w-5 h-5"
          />
          <span>Receive daily email digest</span>
        </label>
      </div>
      
      <button
        onClick={handleUpdate}
        disabled={loading}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}
```

**Settings Team Page:**
```typescript
// /app/app/settings/team/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';

export default function TeamSettings() {
  const [teamId, setTeamId] = useState<string>('');
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Get team from user context (stored in localStorage or context)
    const team = JSON.parse(localStorage.getItem('currentTeam') || '{}');
    setTeamId(team.id);
    
    if (team.id) {
      fetch(`/api/teams/${team.id}/members`)
        .then(r => r.json())
        .then(setMembers);
    }
  }, []);
  
  const handleInvite = async () => {
    if (!inviteEmail) return;
    
    setLoading(true);
    const res = await fetch(`/api/teams/${teamId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email: inviteEmail, role: 'member' }),
    });
    
    if (res.ok) {
      const { member } = await res.json();
      setMembers([...members, member]);
      setInviteEmail('');
    }
    setLoading(false);
  };
  
  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the team?')) return;
    
    const res = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
    });
    
    if (res.ok) {
      setMembers(members.filter(m => m.user_id !== memberId));
    }
  };
  
  const handleChangeRole = async (memberId: string, newRole: string) => {
    const res = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole }),
    });
    
    if (res.ok) {
      setMembers(members.map(m => 
        m.user_id === memberId ? { ...m, role: newRole } : m
      ));
    }
  };
  
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Users /> Team Members
      </h1>
      
      <div className="border rounded-lg p-4 mb-6 bg-gray-50">
        <h2 className="font-semibold mb-3">Invite New Member</h2>
        <div className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@example.com"
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={handleInvite}
            disabled={loading || !inviteEmail}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus size={16} />
            Invite
          </button>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.user_id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{member.full_name || 'Unknown'}</td>
                <td className="px-4 py-2">{member.email}</td>
                <td className="px-4 py-2">
                  <select
                    value={member.role}
                    onChange={(e) => handleChangeRole(member.user_id, e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => handleRemoveMember(member.user_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="text-sm text-gray-600 mt-4">
        {members.length} member{members.length !== 1 ? 's' : ''} in this team
      </p>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] /app/settings page loads with navigation sidebar
- [ ] Profile page displays user info and allows editing
- [ ] Notifications page shows toggle for each notification type
- [ ] Team page displays all team members with role selector
- [ ] Invite modal works with email input
- [ ] Role changes persist to database
- [ ] Member removal requires confirmation
- [ ] All changes show success feedback

---

### Day 6: Polish & Integration (Mon)

#### 2.8 Comment Thread UI Refinements

**Objective:** Enhance the comment display with email-sourced badges, better AI response styling, and improved visual hierarchy.

**Files to Modify:**
```
/app/components/CommentThread.tsx        (Main thread component)
/app/components/CommentCard.tsx           (Individual comment card)
/app/components/AIResponsePanel.tsx       (AI response styling)
```

**Enhancements:**

1. **Email-Sourced Badge:**
```typescript
// Add to CommentCard

{comment.source === 'email' && (
  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
    From Email
  </span>
)}
```

2. **AI Response Panel Styling:**
```typescript
// /app/components/AIResponsePanel.tsx

<div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded mt-3">
  <div className="flex items-center gap-2 mb-2">
    <SparklesIcon className="text-purple-600" size={16} />
    <span className="font-semibold text-purple-900">AI Response</span>
    {response.confidence && (
      <span className="text-xs text-purple-700">
        Confidence: {Math.round(response.confidence * 100)}%
      </span>
    )}
  </div>
  <p className="text-gray-800 leading-relaxed">{response.content}</p>
  <div className="mt-3 flex gap-2 text-xs">
    <button className="px-2 py-1 bg-purple-200 text-purple-700 rounded hover:bg-purple-300">
      Approve
    </button>
    <button className="px-2 py-1 bg-purple-200 text-purple-700 rounded hover:bg-purple-300">
      Edit & Post
    </button>
    <button className="px-2 py-1 bg-purple-200 text-purple-700 rounded hover:bg-purple-300">
      Regenerate
    </button>
  </div>
</div>
```

3. **Improved Visual Hierarchy:**
- Increase font size for comment content (body, 16px)
- Emphasize assignee name (bold, larger)
- Reduce metadata text size (12px, lighter gray)
- Add subtle background color to card (white on gray background)
- Use rounded corners (8px) for all interactive elements

**Acceptance Criteria:**
- [ ] Email-sourced comments show blue "From Email" badge
- [ ] AI responses display in purple panel with sparkles icon
- [ ] AI response panel has Approve/Edit/Regenerate buttons
- [ ] Comment cards have improved visual hierarchy
- [ ] Spacing and typography match design system

---

#### 2.9 Response Tracking Dashboard

**Objective:** Add a progress indicator to the permit detail page showing resolution status across all comments.

**Files to Create:**
```
/app/components/PermitProgressBar.tsx     (Progress visualization, 200 LOC)
```

**Files to Modify:**
```
/app/app/app/permits/[id]/page.tsx       (Add progress bar to top)
```

**PermitProgressBar Component:**
```typescript
// /app/components/PermitProgressBar.tsx

export function PermitProgressBar({ permitId, comments }: any) {
  const total = comments.length;
  const resolved = comments.filter(c => c.status === 'resolved').length;
  const inProgress = comments.filter(c => c.status === 'in_progress').length;
  const open = comments.filter(c => c.status === 'open').length;
  
  const percentResolved = Math.round((resolved / total) * 100);
  
  return (
    <div className="border rounded-lg p-4 bg-white mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Resolution Progress</h3>
        <span className="text-2xl font-bold text-blue-600">{percentResolved}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-green-500 h-3 rounded-full transition-all"
          style={{ width: `${percentResolved}%` }}
        />
      </div>
      
      <div className="mt-3 flex gap-4 text-sm">
        <div>
          <span className="text-gray-600">Resolved</span>
          <span className="ml-2 font-semibold text-green-600">{resolved}</span>
        </div>
        <div>
          <span className="text-gray-600">In Progress</span>
          <span className="ml-2 font-semibold text-blue-600">{inProgress}</span>
        </div>
        <div>
          <span className="text-gray-600">Open</span>
          <span className="ml-2 font-semibold text-red-600">{open}</span>
        </div>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Progress bar displays on permit detail page
- [ ] Shows percentage of resolved comments
- [ ] Breakdown by status shown below bar
- [ ] Updates in real-time as comments change status
- [ ] Color-coded: green (resolved), blue (in progress), red (open)

---

#### 2.10 Dashboard Updates

**Objective:** Link dashboard to My Tasks page and show team workload overview.

**Files to Modify:**
```
/app/app/app/dashboard/page.tsx          (Add team workload section)
```

**New Section on Dashboard:**
```typescript
// Add to dashboard page

<section className="grid grid-cols-3 gap-4 mb-6">
  <div className="border rounded-lg p-4 bg-white">
    <p className="text-sm text-gray-600 mb-1">My Assigned Tasks</p>
    <p className="text-3xl font-bold text-blue-600">{assignedCount}</p>
    <Link href="/app/tasks" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
      View My Tasks →
    </Link>
  </div>
  
  <div className="border rounded-lg p-4 bg-white">
    <p className="text-sm text-gray-600 mb-1">Team Overdue</p>
    <p className="text-3xl font-bold text-red-600">{overdueCount}</p>
  </div>
  
  <div className="border rounded-lg p-4 bg-white">
    <p className="text-sm text-gray-600 mb-1">Team In Progress</p>
    <p className="text-3xl font-bold text-yellow-600">{inProgressCount}</p>
  </div>
</section>

// Team member workload table
<section className="border rounded-lg p-4 bg-white">
  <h2 className="font-bold mb-4">Team Workload</h2>
  <table className="w-full text-sm">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-2 py-2 text-left">Member</th>
        <th className="px-2 py-2 text-center">Assigned</th>
        <th className="px-2 py-2 text-center">Overdue</th>
        <th className="px-2 py-2 text-center">Resolved</th>
      </tr>
    </thead>
    <tbody>
      {teamMembers.map((member) => (
        <tr key={member.id} className="border-t hover:bg-gray-50">
          <td className="px-2 py-2">{member.name}</td>
          <td className="px-2 py-2 text-center">{member.assigned}</td>
          <td className="px-2 py-2 text-center text-red-600 font-semibold">{member.overdue}</td>
          <td className="px-2 py-2 text-center text-green-600">{member.resolved}</td>
        </tr>
      ))}
    </tbody>
  </table>
</section>
```

**Acceptance Criteria:**
- [ ] Dashboard shows "My Assigned Tasks" card with link
- [ ] Team workload table displays all members
- [ ] Overdue tasks highlighted in red
- [ ] Numbers update as comments are resolved

---

#### 2.11 FlowE Chat Conversation Persistence

**Objective:** Save and load chat histories so users can continue conversations across sessions.

**Files to Modify:**
```
/app/components/FlowEChat.tsx             (Add persistence logic)
/app/api/conversations/route.ts           (New endpoints)
```

**New API Endpoints:**
```typescript
// POST /api/conversations
// Body: { title: string, initial_message: string }
// Returns: { conversation_id: string }

// GET /api/conversations
// Returns: [{ id, title, created_at, updated_at, message_count }]

// GET /api/conversations/[id]/messages
// Returns: [{ id, content, role, created_at, tokens_used }]

// POST /api/conversations/[id]/messages
// Body: { content: string, role: 'user'|'assistant' }
// Returns: { message_id: string, response: string, tokens_used: number }
```

**FlowEChat Component Update:**
```typescript
// Add to /app/components/FlowEChat.tsx

const [conversationId, setConversationId] = useState<string | null>(null);
const [conversations, setConversations] = useState<any[]>([]);
const [messages, setMessages] = useState<any[]>([]);

useEffect(() => {
  // Load conversation list on mount
  fetch('/api/conversations')
    .then(r => r.json())
    .then(setConversations);
}, []);

const handleNewConversation = async (title: string) => {
  const res = await fetch('/api/conversations', {
    method: 'POST',
    body: JSON.stringify({ title, initial_message: '' }),
  });
  const { conversation_id } = await res.json();
  setConversationId(conversation_id);
  setMessages([]);
};

const handleLoadConversation = async (id: string) => {
  const res = await fetch(`/api/conversations/${id}/messages`);
  const msgs = await res.json();
  setConversationId(id);
  setMessages(msgs);
};

const handleSendMessage = async (content: string) => {
  // Create conversation if new
  if (!conversationId) {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ title: content.substring(0, 50), initial_message: '' }),
    });
    const { conversation_id } = await res.json();
    setConversationId(conversation_id);
  }
  
  // Send message
  const res = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, role: 'user' }),
  });
  const { response, message_id } = await res.json();
  
  // Add both messages to state
  setMessages([
    ...messages,
    { id: message_id, content, role: 'user', created_at: new Date() },
    { id: `response_${Date.now()}`, content: response, role: 'assistant', created_at: new Date() },
  ]);
};
```

**Acceptance Criteria:**
- [ ] Chat conversations save automatically on send
- [ ] "New Conversation" button starts fresh
- [ ] Sidebar shows list of past conversations
- [ ] Clicking past conversation loads message history
- [ ] Conversation titles auto-generated from first message

---

### Day 7: QA, Testing & Deployment (Tue)

#### 2.12 Full End-to-End Testing

**Objective:** Verify critical user workflows and edge cases before customer handoff.

**Test Fixtures File:**
```
/tests/fixtures/test-data.json

{
  "teams": [
    {
      "id": "team_demo_001",
      "name": "Demo Team",
      "created_at": "2026-03-21T00:00:00Z"
    }
  ],
  "users": [
    {
      "id": "user_john_001",
      "email": "john@example.com",
      "password": "DemoPass123!",
      "full_name": "John Reviewer",
      "team_id": "team_demo_001"
    },
    {
      "id": "user_jane_001",
      "email": "jane@example.com",
      "password": "DemoPass123!",
      "full_name": "Jane Manager",
      "team_id": "team_demo_001"
    }
  ],
  "projects": [
    {
      "id": "proj_test_001",
      "name": "Demo Zoning Variance",
      "status": "active",
      "team_id": "team_demo_001"
    }
  ],
  "permits": [
    {
      "id": "permit_test_001",
      "project_id": "proj_test_001",
      "title": "Zoning Variance Application",
      "status": "in_review"
    }
  ],
  "documents": [
    {
      "id": "doc_test_001",
      "permit_id": "permit_test_001",
      "file_name": "zoning_application_draft.pdf",
      "gcs_path": "gs://entitleflow-demo/documents/zoning_application_draft.pdf",
      "status": "parsed"
    }
  ],
  "comments": [
    {
      "id": "comment_test_001",
      "document_id": "doc_test_001",
      "content": "Clarify setback requirements for corner lot",
      "status": "open",
      "priority": "high",
      "assigned_to": "user_john_001",
      "created_by": "user_jane_001"
    },
    {
      "id": "comment_test_002",
      "document_id": "doc_test_001",
      "content": "Need height exception justification",
      "status": "open",
      "priority": "medium",
      "assigned_to": "user_john_001",
      "created_by": "user_jane_001"
    }
  ]
}
```

**Critical Path Test Checklist:**

```markdown
## End-to-End Test: Document Upload → Parse → Assign → Resolve → Export

### Pre-test Setup
- [ ] Seed test data from /tests/fixtures/test-data.json
- [ ] Clear all test notifications
- [ ] Log in as jane@example.com (Manager)

### Step 1: Navigate to Permit Detail
- [ ] Go to /app/app/permits/permit_test_001
- [ ] Verify title "Zoning Variance Application" displays
- [ ] Verify 1 document listed: "zoning_application_draft.pdf"
- [ ] Verify 2 comments already present (from fixtures)

### Step 2: My Tasks Page
- [ ] Navigate to /app/app/tasks
- [ ] Log out, log in as john@example.com (Reviewer)
- [ ] Verify "My Tasks" page shows 2 assigned comments
- [ ] Verify both are from "Zoning Variance Application" permit
- [ ] Verify priorities show correctly (high, medium)

### Step 3: Notification Triggers
- [ ] Go back to john's browser, check notifications
- [ ] Should see 2 comment assignment notifications
- [ ] Check email (test@mailinator.com) for assignment emails
- [ ] Verify email contains comment preview and link to permit

### Step 4: Comment Resolution
- [ ] On task card, click "Mark Resolved" on first comment
- [ ] Verify comment removed from My Tasks page
- [ ] Switch to jane's browser, check notification (resolved)
- [ ] Go to permit detail, verify comment status shows "resolved"

### Step 5: AI Response Generation
- [ ] On second open comment, click "Generate Response"
- [ ] Verify loading state appears
- [ ] Wait 2-3 seconds for AI response
- [ ] Verify response appears in purple panel
- [ ] Verify "Approve", "Edit & Post", "Regenerate" buttons present

### Step 6: Resubmittal Package
- [ ] Scroll to "Resubmittal Plan" panel on permit detail
- [ ] Click "Regenerate" button
- [ ] Verify plan summary and timeline display
- [ ] Click "Edit Plan", add a new action item
- [ ] Verify item persists after save
- [ ] Click DOCX export, verify file downloads

### Step 7: Response Letter
- [ ] Scroll to "Response Letter" panel
- [ ] Click "Generate Response Letter"
- [ ] Wait for generation
- [ ] Verify letter displays with full text
- [ ] Click "Edit Letter", make a change
- [ ] Save changes
- [ ] Export to PDF, verify file downloads

### Step 8: Progress Tracking
- [ ] On permit detail, check progress bar
- [ ] Should show 50% complete (1 of 2 resolved)
- [ ] Mark second comment as resolved
- [ ] Progress bar should jump to 100%

### Step 9: Settings Pages
- [ ] Navigate to /app/app/settings/profile
- [ ] Update full name, save
- [ ] Navigate to /app/app/settings/notifications
- [ ] Toggle some notifications off, save
- [ ] Navigate to /app/app/settings/team
- [ ] Verify jane is listed as Admin
- [ ] Verify john is listed as Member

### Step 10: Dashboard
- [ ] Go to /app/app/dashboard
- [ ] Verify "My Assigned Tasks" shows 0 (all resolved)
- [ ] Click "View My Tasks" link
- [ ] Verify navigates to /app/app/tasks
- [ ] Check team workload table shows john with 0 assigned

### Step 11: FlowE Chat
- [ ] Open FlowE chat (bottom right)
- [ ] Send message: "How do I resolve comments faster?"
- [ ] Verify response appears
- [ ] Close and reopen chat
- [ ] Verify conversation history loads
- [ ] Verify can start new conversation

## Edge Cases

### Upload → Parse Job Status
- [ ] Upload large PDF (10+MB)
- [ ] Verify parsing status component shows queued
- [ ] Verify progress updates every 2 seconds
- [ ] Verify parsing complete notification fires

### Comment Assignment → Notification
- [ ] Assign comment to user not in team
- [ ] Verify system prevents (validation error)
- [ ] Assign to self
- [ ] Verify notification still sends

### Response Letter Export
- [ ] Export to DOCX with special characters
- [ ] Verify formatting preserved
- [ ] Export with images (if any)
- [ ] Verify layout intact

### Parse Errors
- [ ] Upload unsupported file type (e.g., .txt)
- [ ] Verify error message shows
- [ ] Verify notification includes error detail
- [ ] Verify document status shows "error"

## Performance Benchmarks

- [ ] My Tasks page loads <1.5s for 50 tasks
- [ ] Permit detail loads <2s
- [ ] Dashboard loads <1.5s
- [ ] AI response generation <3s (acceptable for user experience)
- [ ] Export DOCX <2s
```

**Automated QA Script (Chrome Agent):**
```javascript
// /tests/e2e/critical-path.js
// Run via: npx playwright test

import { test, expect } from '@playwright/test';

test('critical path: upload → assign → resolve → export', async ({ page }) => {
  // Setup: seed test data
  await seedTestData();
  
  // Login as jane (manager)
  await page.goto('http://localhost:3000/login');
  await page.fill('[name="email"]', 'jane@example.com');
  await page.fill('[name="password"]', 'DemoPass123!');
  await page.click('button:has-text("Sign In")');
  
  // Navigate to permit
  await page.goto('http://localhost:3000/app/permits/permit_test_001');
  await expect(page.locator('h1')).toContainText('Zoning Variance');
  
  // Switch to john, check My Tasks
  await page.context().addCookies([
    { name: 'session', value: 'john_session_token', domain: 'localhost', path: '/' }
  ]);
  await page.goto('http://localhost:3000/app/tasks');
  const taskCards = await page.locator('[data-testid="task-card"]').count();
  expect(taskCards).toBe(2);
  
  // Mark one resolved
  await page.click('[data-testid="task-resolve-btn"]:first-child');
  const updatedTaskCards = await page.locator('[data-testid="task-card"]').count();
  expect(updatedTaskCards).toBe(1);
  
  // Generate AI response
  await page.goto('http://localhost:3000/app/permits/permit_test_001');
  await page.click('button:has-text("Generate Response")');
  await page.waitForSelector('[data-testid="ai-response-panel"]', { timeout: 5000 });
  
  // Export response letter
  await page.click('button:has-text("Export DOCX")');
  const downloadPromise = page.waitForEvent('download');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('response-letter');
});
```

**Acceptance Criteria:**
- [ ] All critical path test items pass
- [ ] No console errors or unhandled exceptions
- [ ] All edge cases handled gracefully
- [ ] Performance benchmarks met
- [ ] Email notifications sent successfully
- [ ] All exports (DOCX/PDF) valid and readable

---

#### 2.13 Vercel Deployment Verification

**Objective:** Ensure production environment is configured correctly and all services are connected.

**Pre-deployment Checklist:**
```markdown
## Vercel Production Deployment Checklist

### Environment Variables Verified
- [ ] NEXT_PUBLIC_SUPABASE_URL set
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY set
- [ ] SUPABASE_SERVICE_ROLE_KEY set
- [ ] GCP_PROJECT_ID set
- [ ] GCP_SERVICE_ACCOUNT_JSON set
- [ ] OPENROUTER_API_KEY set with value "EntitleFlow" limit $30/week
- [ ] SENDGRID_API_KEY set
- [ ] JWT_SECRET set
- [ ] NEXTAUTH_SECRET set
- [ ] NEXTAUTH_URL set to https://entitleflow.com (or production domain)

### Vercel Build Verification
- [ ] Last build completed without errors
- [ ] All API routes bundled correctly
- [ ] Database migrations applied on startup (check logs)
- [ ] No missing dependencies in package-lock.json
- [ ] Build time under 5 minutes

### GitHub Integration
- [ ] Repository connected to Vercel
- [ ] Main branch set as production branch
- [ ] Auto-deploy on push enabled
- [ ] Preview deployments for pull requests enabled
- [ ] Deployment protection enabled (require approval)

### DNS & Domain
- [ ] entitleflow.com (or production domain) DNS pointed to Vercel
- [ ] SSL certificate provisioned and active
- [ ] www redirect configured
- [ ] Health check endpoint returns 200: GET /api/health

### Service Connections
- [ ] Supabase: Test query via API proxy
  ```bash
  curl https://entitleflow.com/api/health/supabase
  ```
- [ ] GCP: Document AI service accessible
  ```bash
  curl https://entitleflow.com/api/health/gcp
  ```
- [ ] OpenRouter: API key working
  ```bash
  curl https://entitleflow.com/api/health/openrouter
  ```
- [ ] SendGrid: Test email endpoint
  ```bash
  curl -X POST https://entitleflow.com/api/test/send-email \
    -d '{"to":"test@example.com"}' \
    -H "Content-Type: application/json"
  ```

### Monitoring & Observability
- [ ] Error tracking configured (Sentry or similar)
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured (UptimeRobot)
- [ ] Alert configured for production errors
- [ ] Logs accessible via Vercel console

### Database Backups
- [ ] Supabase automated backups enabled
- [ ] Backup retention set to 7+ days
- [ ] Point-in-time recovery available
- [ ] Test restore process (non-prod)

### Security
- [ ] CORS properly configured (only allow entitleflow.com)
- [ ] Rate limiting enabled on public endpoints
- [ ] RLS policies enforced in Supabase
- [ ] Secrets never logged
- [ ] SQL injection prevention verified

### Post-Deployment Smoke Tests (Run Immediately)
- [ ] Can access homepage: entitleflow.com
- [ ] Can login: entitleflow.com/login
- [ ] Can create new organization (test account)
- [ ] Can upload document (test PDF)
- [ ] Can view parsed comments
- [ ] Can generate AI responses
- [ ] Can export resubmittal plan (PDF/DOCX)
- [ ] Can send invite (test email)
- [ ] Dashboard loads without errors

### Rollback Plan
- [ ] Identify previous stable commit
- [ ] Document rollback procedure:
  1. Revert to previous commit
  2. Push to main branch
  3. Vercel auto-deploys rollback
  4. Verify health endpoints
  5. Test critical workflow
```

---

#### 2.14 Customer Onboarding Checklist

**Objective:** Create a step-by-step customer onboarding guide that can be shared with first customer.

**File to Create:**
```
/docs/CUSTOMER_ONBOARDING.md

# EntitleFlow Customer Onboarding Guide

## Welcome to EntitleFlow!

We're excited to have you using EntitleFlow for your land entitlement operations. This guide walks you through the key features and will have you productive in about 30 minutes.

## Pre-Onboarding (Admin)

Your EntitleFlow account has been created. You should have received:
- [ ] Welcome email with login link
- [ ] Temporary password (change on first login)
- [ ] This onboarding guide
- [ ] Support contact information

## Step 1: Login & Create Your Organization (5 min)

1. Go to entitleflow.com
2. Click "Sign Up" or use the login link from email
3. Enter your email and password
4. You'll be asked to create an organization name (e.g., "Acme Development Corp")
5. Save your organization — you're now the admin

**What you see:**
- Dashboard with project overview
- Navigation sidebar with main features
- Profile menu (top right)

## Step 2: Invite Your Team (5 min)

You're the organization admin, but you probably have colleagues who need access.

1. Go to Settings → Team
2. Click "Invite New Member"
3. Enter colleague's email address
4. Select their role:
   - **Admin**: Full access, can manage team
   - **Manager**: Can assign comments, generate responses
   - **Member**: Can view projects and add comments (basic access)
5. They'll receive an invite email; they need to accept to join

**Note:** You can change roles anytime from the Team settings page.

## Step 3: Create Your First Project (5 min)

1. Go to Projects (left sidebar)
2. Click "+ New Project"
3. Fill in:
   - **Project Name**: "Downtown Mixed-Use Development"
   - **Description**: "Zoning variance for mixed-use complex"
   - **Status**: "Active" (default)
4. Click "Create Project"

**You should see:**
- Project detail page with empty permits list
- Option to create permits

## Step 4: Add Your First Permit (5 min)

1. On the project detail, click "+ New Permit"
2. Fill in:
   - **Permit Title**: "Zoning Variance - Height Exception"
   - **Permit Type**: "Zoning Variance"
   - **Status**: "In Review"
3. Click "Create Permit"

**You should see:**
- Permit detail page with empty documents section
- Option to upload documents

## Step 5: Upload Your First Document (5 min)

1. On permit detail, click "+ Upload Document"
2. Select a PDF file from your computer (zoning application, staff report, etc.)
3. Document will upload to cloud storage
4. **Processing**: You'll see a status bar: "Queued → Processing (45%) → Complete (23 comments found)"

**What's happening in the background:**
- Document uploaded to secure Google Cloud Storage
- AI (Document AI) parses document for comments
- Comments auto-extracted (regulatory feedback, staff notes, etc.)
- Comments appear below in the Comments section

## Step 6: Manage Comments (10 min)

Once parsing completes, you'll see auto-extracted comments:

### View Comment Detail
1. Click on any comment card
2. You'll see:
   - Full comment text
   - Source (e.g., "From Email", "From Document")
   - Status (open, in_progress, resolved)
   - Who it's assigned to
   - Priority (low, medium, high, critical)
   - Deadline

### Assign a Comment
1. On comment card, click "Assign to..."
2. Select a team member
3. They'll receive notification immediately (email + in-app)
4. Comment appears on their "My Tasks" page

### Generate AI Response
1. On comment, click "Generate Response"
2. AI analyzes comment and suggests professional response
3. Response appears in purple panel
4. You can:
   - "Approve" — accepts response as-is
   - "Edit & Post" — edit before posting
   - "Regenerate" — try different response

### Mark as Resolved
1. Click "Mark Resolved"
2. Comment status changes to "resolved"
3. Original creator gets notification
4. Disappears from "My Tasks" for assigned person

## Step 7: Generate Resubmittal Plan (5 min)

After comments are reviewed and assigned:

1. On permit detail, scroll to "Resubmittal Plan" section
2. Click "Regenerate"
3. AI analyzes all comments and generates a resubmittal strategy
4. You'll see:
   - **Summary**: Overview of resubmittal approach
   - **Timeline**: Estimated completion date
   - **Action Items**: Individual tasks (e.g., "Revise site plan", "Provide justification letter")

### Edit the Plan
1. Click "Edit Plan"
2. Add/remove/edit action items
3. Assign items to team members
4. Click "Save Changes"

### Export the Plan
1. Click "DOCX" or "PDF" button
2. File downloads with formatted resubmittal plan
3. Share with applicant or consultants

## Step 8: Generate Response Letter (5 min)

A professional response letter to the permitting agency:

1. Scroll to "Response Letter" section
2. Click "Generate Response Letter"
3. AI drafts comprehensive response addressing all comments
4. You can:
   - **Edit Letter** — make changes to response
   - **Export DOCX** — download for Word editing
   - **Export PDF** — download for signing/filing
   - **Change Status**: Draft → Approved → Sent

## Step 9: Track Progress (2 min)

**On Permit Detail:**
- Resolution progress bar shows % of comments resolved
- Breakdown shows: Resolved, In Progress, Open

**On Dashboard:**
- "My Assigned Tasks" card links to your task list
- Team workload table shows who has what assigned
- Overdue items highlighted in red

**On Settings → Notifications:**
- Control which notifications you receive (email/in-app)
- Options: comment assigned, comment resolved, deadline approaching, etc.

## Step 10: Chat with FlowE (Bonus)

EntitleFlow includes FlowE, an AI assistant:

1. Click the chat icon (bottom right)
2. Ask questions like:
   - "How do I generate a resubmittal plan?"
   - "What comments are overdue?"
   - "What should I include in my response letter?"
3. FlowE provides context-aware guidance
4. Your conversation history is saved automatically

## Common Workflows

### "I just received feedback from the planning department"

1. Download the email attachment (staff report, RTC letter, etc.)
2. Go to the relevant permit
3. Click "+ Upload Document"
4. Document AI parses it automatically
5. Comments appear; assign to team
6. Your team resolves on their "My Tasks" page
7. Generate resubmittal plan when ready

### "My team member asked: what am I supposed to do?"

1. Direct them to: entitleflow.com/app/tasks
2. They'll see all comments assigned to them
3. They can:
   - View full comment and context (link to permit)
   - Assign to someone else if needed
   - Mark resolved when done
4. You'll see progress in real-time

### "I need to send an official response to the agency"

1. Go to permit detail
2. Ensure all comments are assigned and reviewed
3. Scroll to "Response Letter"
4. Click "Generate Response Letter"
5. Review/edit as needed
6. Click "Export DOCX" or "Export PDF"
7. Open in Word, sign digitally, file with agency

### "We're starting the resubmittal phase"

1. Resolve all initial feedback comments
2. Scroll to "Resubmittal Plan"
3. Click "Regenerate" (if plan already exists)
4. Review action items and timeline
5. Edit plan if needed
6. Export and share with consultant/applicant
7. Track completion as items are done
8. Link individual comments to action items (future feature)

## Tips & Tricks

- **Mobile**: Use "My Tasks" on phone to check assigned comments
- **Keyboard Shortcuts**: Ctrl+/ to see available shortcuts
- **Bulk Actions**: Select multiple comments to assign/resolve together
- **Email Integration**: Reply to comment notifications by email (coming soon)
- **API Access**: For automation (coming in Week 2)

## Need Help?

- **Questions**: Email support@entitleflow.com
- **Bug Report**: In-app feedback form or support@entitleflow.com
- **Schedule Demo**: reply@entitleflow.com with "I want a demo"

## What's Coming Next (Week 2+)

- Real-time collaboration (see changes instantly)
- Map view (visualize permit locations)
- Email reply-to (respond to comments via email)
- Advanced analytics (timesheet, bottleneck analysis)
- Mobile app
- Zapier/Make.com integration (automation)

---

**Congratulations!** You've completed EntitleFlow onboarding. You're ready to manage your first permit workflow. Happy permitting!
```

**Acceptance Criteria:**
- [ ] Onboarding guide covers all major features
- [ ] Step-by-step instructions are clear and testable
- [ ] Screenshots or video walkthrough added (optional)
- [ ] Common workflows documented
- [ ] Support contact information provided
- [ ] Customer can complete onboarding in <30 minutes
- [ ] No knowledge gaps or undefined terms

---

#### 2.15 Seed Demo Data for Walkthrough

**Objective:** Create a database snapshot with realistic demo data so customer walkthrough is smooth.

**File to Create:**
```
/scripts/seed-demo-data.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedDemoData() {
  console.log('Seeding demo data...');
  
  // 1. Create demo team
  const { data: team } = await supabase
    .from('teams')
    .insert({
      name: 'Acme Development Corp',
      slug: 'acme-demo',
    })
    .select()
    .single();
  
  console.log('✓ Created demo team:', team.id);
  
  // 2. Create demo users
  const { data: users } = await supabase
    .from('users')
    .insert([
      {
        email: 'admin@acme-demo.com',
        full_name: 'Sarah Admin',
        role: 'admin',
        team_id: team.id,
      },
      {
        email: 'reviewer@acme-demo.com',
        full_name: 'John Reviewer',
        role: 'member',
        team_id: team.id,
      },
      {
        email: 'manager@acme-demo.com',
        full_name: 'Jane Manager',
        role: 'manager',
        team_id: team.id,
      },
    ])
    .select();
  
  console.log('✓ Created demo users:', users.map(u => u.email));
  
  // 3. Create demo project
  const { data: project } = await supabase
    .from('projects')
    .insert({
      team_id: team.id,
      name: 'Downtown Mixed-Use Development',
      description: 'Zoning variance and conditional use permit for mixed-use complex',
      status: 'active',
    })
    .select()
    .single();
  
  console.log('✓ Created demo project:', project.id);
  
  // 4. Create demo permit
  const { data: permit } = await supabase
    .from('permits')
    .insert({
      project_id: project.id,
      title: 'Zoning Variance - Height Exception',
      permit_type: 'zoning_variance',
      status: 'in_review',
      description: 'Request for height exception to allow 120-foot maximum building height',
    })
    .select()
    .single();
  
  console.log('✓ Created demo permit:', permit.id);
  
  // 5. Create demo document
  const { data: document } = await supabase
    .from('documents')
    .insert({
      permit_id: permit.id,
      file_name: 'RTC_Letter_Planning_Department.pdf',
      gcs_path: 'gs://entitleflow-demo/documents/rtc.pdf',
      status: 'parsed',
      uploaded_by: users[0].id,
    })
    .select()
    .single();
  
  console.log('✓ Created demo document:', document.id);
  
  // 6. Create demo comments
  const comments = [
    {
      document_id: document.id,
      content: 'Please clarify the setback requirements for the corner lot. Refer to Section 2.5 of the municipal code.',
      priority: 'high',
      status: 'open',
      assigned_to: users[1].id,
      created_by: users[2].id,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    {
      document_id: document.id,
      content: 'Height exception justification is insufficient. Provide additional analysis showing why 120 feet is necessary for project viability.',
      priority: 'high',
      status: 'open',
      assigned_to: users[1].id,
      created_by: users[2].id,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
    {
      document_id: document.id,
      content: 'Provide shadow study analysis for surrounding properties.',
      priority: 'medium',
      status: 'open',
      assigned_to: users[2].id,
      created_by: users[2].id,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      document_id: document.id,
      content: 'Traffic impact analysis meets city requirements.',
      priority: 'low',
      status: 'resolved',
      assigned_to: users[1].id,
      created_by: users[2].id,
    },
  ];
  
  const { data: insertedComments } = await supabase
    .from('comments')
    .insert(comments)
    .select();
  
  console.log('✓ Created demo comments:', insertedComments.length);
  
  // 7. Create demo notifications
  await supabase
    .from('notifications')
    .insert([
      {
        user_id: users[1].id,
        type: 'comment_assigned',
        title: 'New comment assigned to you',
        message: 'John, you have been assigned 2 new comments on "Downtown Mixed-Use Development"',
        metadata: { permit_id: permit.id },
      },
    ]);
  
  console.log('✓ Created demo notifications');
  
  console.log('\n✅ Demo data seeded successfully!');
  console.log('\nDemo credentials:');
  console.log('Admin:    admin@acme-demo.com / DemoPass123!');
  console.log('Reviewer: reviewer@acme-demo.com / DemoPass123!');
  console.log('Manager:  manager@acme-demo.com / DemoPass123!');
}

seedDemoData().catch(console.error);
```

**Run Demo Seed:**
```bash
# Setup demo environment
npx ts-node scripts/seed-demo-data.ts

# Then customer can:
# 1. Log in as admin@acme-demo.com
# 2. See full permit workflow
# 3. Assign comments, resolve, export
# 4. No manual setup needed
```

**Acceptance Criteria:**
- [ ] Demo data script runs without errors
- [ ] Demo team/project/permit/document created
- [ ] Demo comments assigned to different users
- [ ] Demo notifications created
- [ ] Customer can log in and immediately see data
- [ ] Walkthrough uses demo data (no need to upload files)

---

## 3. Implementation Specifications

### Frontend Architecture Decisions

**State Management:**
- Use Next.js App Router with React Context for user/team state
- Supabase Realtime (future) for live updates
- SWR for data fetching and caching

**Component Organization:**
```
/app
  /components
    /ui              (Reusable: Button, Input, Modal, Toast)
    /forms           (Feature-specific: TaskFilters, CommentForm)
    /panels          (Page sections: ResubmittalPlanPanel, ResponseLetterPanel)
  /app               (Route handlers)
    /login
    /dashboard
    /tasks
    /permits/[id]
    /settings
  /api               (API routes)
    /comments
    /documents
    /permits
    /teams
    /users
    /ai
    /notifications
    /webhooks
  /lib               (Utilities)
    /supabase
    /gcp
    /notifications
    /email
```

**API Response Format:**
```typescript
// Success
{ success: true, data: {...}, message?: string }

// Error
{ success: false, error: string, details?: any }

// Pagination
{ success: true, data: [...], total: 100, limit: 20, offset: 0 }
```

### Database Queries Optimization

**Indexes Created (if missing):**
```sql
CREATE INDEX idx_comments_assigned_to ON comments(assigned_to, status, deadline);
CREATE INDEX idx_comments_document_id ON comments(document_id, status);
CREATE INDEX idx_documents_permit_id ON documents(permit_id, status);
CREATE INDEX idx_permits_project_id ON permits(project_id, status);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_parse_jobs_status ON parse_jobs(status, created_at DESC);
```

**Common Query Patterns:**
```sql
-- Fetch assigned tasks
SELECT c.*, u.email, p.title 
FROM comments c
JOIN users u ON c.created_by = u.id
JOIN documents d ON c.document_id = d.id
JOIN permits p ON d.permit_id = p.id
WHERE c.assigned_to = $1 AND c.status != 'resolved'
ORDER BY c.deadline ASC
LIMIT 100;

-- Count by status
SELECT status, COUNT(*) FROM comments 
WHERE permit_id = $1 GROUP BY status;

-- Team workload
SELECT 
  c.assigned_to,
  COUNT(*) as total_assigned,
  COUNT(CASE WHEN c.deadline < NOW() THEN 1 END) as overdue,
  COUNT(CASE WHEN c.status = 'resolved' THEN 1 END) as resolved
FROM comments c
WHERE c.team_id = $1 AND c.status != 'resolved'
GROUP BY c.assigned_to;
```

### Error Handling Strategy

**Client-Side:**
```typescript
// Toast notifications for user feedback
import { toast } from '@/lib/toast';

try {
  const res = await fetch('/api/comments/1', { method: 'PATCH' });
  if (!res.ok) {
    const error = await res.json();
    toast.error(error.message || 'Failed to update comment');
    return;
  }
  toast.success('Comment updated');
} catch (err) {
  console.error('Unexpected error:', err);
  toast.error('Network error. Please try again.');
}
```

**Server-Side:**
```typescript
// Consistent error responses
export async function PATCH(req: NextRequest, { params }: any) {
  try {
    // ... logic
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in PATCH /comments', error);
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 4. Subagent Review Committees

### Backend Review Panel
**Responsibilities:** API routes, database queries, RLS policies, error handling, performance

**Checklist per PR:**
- [ ] All API endpoints have authentication check (require JWT)
- [ ] All database queries include RLS policy verification
- [ ] No N+1 queries; use joins efficiently
- [ ] Error responses include helpful message and proper status code
- [ ] Sensitive data (passwords, API keys) never logged
- [ ] Rate limiting applied to public endpoints
- [ ] Database migrations checked for backwards compatibility
- [ ] Query performance verified (EXPLAIN ANALYZE for slow queries)

### Frontend Review Panel
**Responsibilities:** Component structure, state management, UX patterns, accessibility

**Checklist per PR:**
- [ ] Components split logically (no >500 LOC files)
- [ ] State management: use Context or server state (not Redux for simplicity)
- [ ] Loading states shown for all async operations
- [ ] Error states displayed with actionable messages
- [ ] Accessibility: ARIA labels, keyboard navigation, color contrast
- [ ] Responsive design tested on mobile (375px), tablet (768px), desktop
- [ ] Images optimized (use Next.js Image component)
- [ ] No hardcoded strings; use i18n (future: localization ready)

### Security Review Panel
**Responsibilities:** Auth flows, input validation, RLS enforcement, secret management

**Checklist per PR:**
- [ ] User can only access their own team's data (RLS enforced)
- [ ] User roles (admin/manager/member) checked before operations
- [ ] Form inputs validated server-side (not just client)
- [ ] SQL injection prevented (use parameterized queries)
- [ ] CSRF tokens used for state-changing requests (if applicable)
- [ ] Environment variables used for all secrets (never hardcoded)
- [ ] API keys rotated periodically (Vercel Secrets management)

### Deployment Review Panel
**Responsibilities:** Vercel build verification, environment variables, performance, DNS

**Checklist per Release:**
- [ ] Vercel build completes without warnings
- [ ] All environment variables set in production
- [ ] No breaking changes to database schema (migrations backwards compatible)
- [ ] Performance budget met: Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Error monitoring active (Sentry configured)
- [ ] Uptime monitoring active (UptimeRobot)
- [ ] Backup verified before production deployment
- [ ] Rollback procedure tested (can revert in <5 minutes)

---

## 5. Testing Strategy

### Manual QA Workflow

**Before Each Build:**
1. Run local test suite (if exists)
2. Test critical path manually (documented above)
3. Check for console errors (DevTools)
4. Test on mobile (iOS Safari, Android Chrome)

**Weekly Smoke Tests:**
- Login
- Create project
- Create permit
- Upload document
- Extract comments
- Assign comment
- Generate AI response
- Resolve comment
- Export resubmittal/response
- Check notifications

**Monthly Regression Tests:**
- Full dataset (100+ comments)
- Performance under load (concurrent uploads)
- Edge cases (large files, special characters, etc.)

### Chrome Agent-Assisted Testing

Use Claude Code's Chrome integration:
```
1. Open /app/tasks page
2. Verify task cards display correctly
3. Click first task "Mark Resolved"
4. Verify task removed from list
5. Check notification appears
6. Take screenshot for documentation
```

### Critical Path Test (Run Before Prod Release)

```
Upload → Parse → Assign → Resolve → Export

Timing targets:
- Upload: <5s
- Parse: 30-120s (depends on document size)
- Assignment notification: <5s
- Export DOCX: <2s
```

---

## 6. Deployment Checklist

**Pre-Deployment (48h before):**
- [ ] All features tested locally
- [ ] No console errors in DevTools
- [ ] Database migrations tested on staging
- [ ] Performance benchmarks met
- [ ] Email templates reviewed
- [ ] Documentation updated

**Deployment Day:**
- [ ] Vercel build completes successfully
- [ ] All environment variables verified
- [ ] Health check endpoints return 200
- [ ] Smoke tests pass (login, create, upload, export)
- [ ] Error monitoring active
- [ ] Alert channels configured

**Post-Deployment:**
- [ ] Monitor error logs for 1 hour
- [ ] Check email delivery (test send)
- [ ] Customer notification sent (if public launch)
- [ ] Rollback plan briefed with team

---

## 7. Customer Onboarding Checklist

**Before Handoff:**
- [ ] Customer account created
- [ ] SSO or password login works
- [ ] Organization created
- [ ] Demo data seeded
- [ ] Support contact provided
- [ ] Onboarding guide delivered (digital + PDF)

**Day 1 of Onboarding (Live Walkthrough):**
- [ ] 30-minute recorded call
- [ ] Show login and dashboard
- [ ] Create first project
- [ ] Create first permit
- [ ] Upload sample document (watch parsing)
- [ ] Extract comments, assign to team
- [ ] Generate AI response, response letter
- [ ] Answer questions, discuss roadmap

**Day 2+:**
- [ ] Customer tries workflow independently
- [ ] Async support via email
- [ ] Weekly check-ins (first month)
- [ ] Feedback collection (survey)

---

## 8. Post-Launch Roadmap (Week 2+)

### Week 2 (High Priority)
- [ ] Supabase Realtime subscriptions (live comment updates)
- [ ] Email reply-to routing (respond to comments via email)
- [ ] Bulk comment operations (assign multiple at once)
- [ ] Advanced comment filtering (saved filters)
- [ ] Mobile responsiveness audit & fixes

### Week 3-4
- [ ] Map view (visualize permit locations on map)
- [ ] Advanced analytics (timeline charts, bottleneck analysis)
- [ ] Zapier/Make.com integration (workflow automation)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Public API access (auth tokens for integrations)

### Week 5+
- [ ] Mobile app (iOS/Android)
- [ ] Document versioning (track changes)
- [ ] Audit logs (who did what when)
- [ ] Custom workflows (template system)
- [ ] Internationalization (Spanish, French, etc.)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    EntitleFlow                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend (Next.js 16)                                 │
│  ├─ Pages: /dashboard, /tasks, /permits, /settings     │
│  ├─ Components: TaskFilters, ResubmittalPlanPanel,     │
│  │            ResponseLetterPanel, CommentThread        │
│  └─ Libraries: TailwindCSS, Lucide Icons, SWR         │
│                                                         │
│  API Layer (Next.js API Routes)                        │
│  ├─ /api/comments (CRUD, assignment, resolution)       │
│  ├─ /api/documents (upload, parse status)              │
│  ├─ /api/permits (CRUD)                                │
│  ├─ /api/teams (members, roles, invites)               │
│  ├─ /api/ai (Vertex AI: resubmittal, response letters) │
│  ├─ /api/notifications (CRUD + preferences)            │
│  └─ /api/webhooks (Document AI parse results)          │
│                                                         │
│  Data Layer                                             │
│  ├─ Supabase PostgreSQL                                │
│  │  ├─ 17 tables (teams, users, projects, permits,     │
│  │  │             documents, comments, etc.)           │
│  │  ├─ RLS policies (row-level security)               │
│  │  └─ Migrations versioning                           │
│  │                                                     │
│  └─ GCP Services                                        │
│     ├─ Cloud Storage (GCS) — document storage          │
│     ├─ Document AI — comment extraction                │
│     ├─ Vertex AI — Gemini for AI responses             │
│     └─ Service Account — auth & permissions            │
│                                                         │
│  External Services                                      │
│  ├─ OpenRouter (MiMo-v2-Pro enhancement layer)         │
│  ├─ SendGrid (email notifications)                     │
│  ├─ Vercel (hosting & CI/CD)                           │
│  └─ GitHub (source control)                            │
│                                                         │
│  AI Agents (Gemini Backbone + MiMo Enhancement)       │
│  ├─ Comment Analyzer Agent (extract & classify)        │
│  ├─ Response Generator Agent (draft responses)         │
│  ├─ Resubmittal Planner Agent (strategic planning)     │
│  ├─ Risk Assessment Agent (identify blockers)          │
│  ├─ Deadline Tracker Agent (timeline management)       │
│  └─ FlowE Chat Assistant (user Q&A)                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Success Metrics

**For First Customer Onboarding:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to first workflow completion | <30 min | Customer walkthrough |
| Page load time (dashboard) | <1.5s | Lighthouse |
| AI response generation | <3s | End-to-end timing |
| Notification delivery | <5s | Email timestamp vs action |
| Document parse | <2min for 10MB PDF | Observed timing |
| Export time (DOCX/PDF) | <2s | User experience |
| Zero downtime deployments | 100% | Vercel logs |
| Customer satisfaction (NPS) | >50 | Post-launch survey |

---

## FAQ

**Q: How long does document parsing take?**
A: 30-120 seconds depending on file size and complexity. Large multi-page documents with tables may take longer.

**Q: Can I change a comment after resolving it?**
A: Yes, unresolve and edit. The system tracks change history (future feature).

**Q: What if AI response is not good?**
A: Click "Regenerate" to get a different response, or manually edit.

**Q: Can team members see each other's tasks?**
A: Managers and admins can see all tasks. Members see only their own.

**Q: How do I update my notification preferences?**
A: Go to Settings → Notifications. Toggle each notification type on/off.

**Q: Can I bulk assign comments?**
A: In first version, no. Assign one-by-one. Bulk operations coming Week 2.

**Q: Is there a dark mode?**
A: Not in first release. Coming Week 4+.

**Q: How do I export comments?**
A: Export resubmittal plan or response letter (both DOCX/PDF). Individual comment export coming later.

---

**End of Master Build Plan**

---

### Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-21 | Engineering | Initial master plan for first customer onboarding sprint |

**Next Review:** 2026-03-30 (post-launch retro)
