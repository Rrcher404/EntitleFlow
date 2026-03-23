# Team Collaboration & Notification APIs - Implementation Summary

All Team Collaboration API routes, Notification API routes, and the Notification Bell component have been successfully created for EntitleFlow.

## Team Collaboration API Routes

### 1. GET /api/team/members
**File:** `/app/api/team/members/route.ts`

Lists all team members in the current user's organization.

**Authentication:** Required (user must be logged in)
**Returns:**
- `data`: Array of team member profiles with id, email, full_name, avatar_url, role, created_at, updated_at
- `organization_id`: The organization ID
**Error Cases:**
- 401: Not authenticated
- 403: User not part of an organization
- 400: Supabase query error

### 2. PATCH /api/team/members/[id]
**File:** `/app/api/team/members/[id]/route.ts`

Updates a team member's role. Only admins or owners can make changes.

**Request Body:**
```json
{ "role": "user_role" }
```

**Permissions Check:**
- Caller must be admin or owner
- Target member must be in same organization
- Cannot demote the last owner

**Returns:**
- `success`: true
- `data`: Updated member profile

**Error Cases:**
- 401: Not authenticated
- 403: Insufficient permissions or user not in organization
- 404: Member not found
- 400: Cannot demote last owner

**Activity Logging:** Logs `team_member_role_changed` event with old and new role

### 3. DELETE /api/team/members/[id]
**File:** `/app/api/team/members/[id]/route.ts`

Removes a team member from the organization.

**Permissions Check:**
- Caller must be admin or owner
- Cannot remove yourself if you're the last owner
- Target member must be in same organization

**Returns:**
- `success`: true
- `message`: "Team member removed successfully"

**Error Cases:**
- 401: Not authenticated
- 403: Insufficient permissions or user not in organization
- 404: Member not found
- 400: Cannot remove last owner

**Activity Logging:** Logs `team_member_removed` event with member role

### 4. POST /api/team/invite
**File:** `/app/api/team/invite/route.ts`

Sends an invitation to join the organization.

**Request Body:**
```json
{ 
  "email": "user@example.com", 
  "role": "user_role" 
}
```

**Permissions Check:**
- Caller must be admin or owner
- Email must not already exist in organization
- Cannot create duplicate pending invitations

**Returns:**
- `success`: true
- `invitation`: Created invitation record (without token in production)
- `token`: Invitation token (for email sending)

**Error Cases:**
- 401: Not authenticated
- 403: Insufficient permissions
- 409: User already exists or pending invitation exists
- 400: Missing required fields

**Generated Data:**
- Token: 32-byte hex random string
- Expires at: 7 days from creation

**Activity Logging:** Logs `team_invitation_sent` event with invited email and role

### 5. POST /api/team/accept
**File:** `/app/api/team/accept/route.ts`

Accepts a team invitation and adds the user to the organization.

**Request Body:**
```json
{ "token": "invitation_token" }
```

**Validation:**
- Token must exist and be pending
- Token must not be expired (7 days)
- User email must match invitation email
- User cannot belong to another organization

**Side Effects:**
- Updates user profile with organization_id and role
- Creates team_members record if needed
- Marks invitation as accepted

**Returns:**
- `success`: true
- `organization_id`: The organization they joined
- `role`: Their assigned role

**Error Cases:**
- 401: Not authenticated
- 404: Invalid or expired token
- 403: Email mismatch or already in another organization
- 400: Invitation already used

**Activity Logging:** Logs `team_invitation_accepted` event with user email and role

### 6. GET /api/team/invitations
**File:** `/app/api/team/invitations/route.ts`

Lists pending invitations for the organization.

**Permissions Check:**
- Caller must be admin or owner

**Returns:**
- `data`: Array of pending invitations with id, email, role, status, created_at, expires_at, accepted_at
- `count`: Number of pending invitations

**Error Cases:**
- 401: Not authenticated
- 403: Insufficient permissions
- 404: Profile not found

### 7. DELETE /api/team/invitations/[id]
**File:** `/app/api/team/invitations/[id]/route.ts`

Revokes a pending invitation.

**Permissions Check:**
- Caller must be admin or owner
- Invitation must belong to caller's organization

**Returns:**
- `success`: true
- `message`: "Invitation revoked successfully"

**Error Cases:**
- 401: Not authenticated
- 403: Insufficient permissions
- 404: Invitation not found

**Activity Logging:** Logs `team_invitation_revoked` event

## Notification API Routes

### 8. GET /api/notifications
**File:** `/app/api/notifications/route.ts`

Retrieves notifications for the current user with pagination.

**Query Parameters:**
- `unread` (boolean, optional): Filter only unread notifications
- `limit` (number, default: 20): Results per page
- `page` (number, default: 1): Page number

**Returns:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Notification title",
      "body": "Notification body",
      "action_url": "/path/to/action",
      "is_read": false,
      "created_at": "2026-03-21T...",
      "read_at": null
    }
  ],
  "unread_count": 5,
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

**Error Cases:**
- 401: Not authenticated
- 400: Invalid query parameters

### 9. PATCH /api/notifications
**File:** `/app/api/notifications/route.ts`

Marks notifications as read.

**Request Body (Option A - Mark specific):**
```json
{ "notification_ids": ["id1", "id2", "id3"] }
```

**Request Body (Option B - Mark all):**
```json
{ "mark_all_read": true }
```

**Returns:**
- `success`: true
- `updated`: Number of notifications updated

**Error Cases:**
- 401: Not authenticated
- 400: Invalid request body

### 10. GET /api/notifications/preferences
**File:** `/app/api/notifications/preferences/route.ts`

Retrieves the current user's notification preferences.

**Returns:**
```json
{
  "data": {
    "profile_id": "uuid",
    "preferences": {
      "comment_on_project": {
        "in_app": true,
        "email": true,
        "email_digest": true
      },
      "team_member_added": {
        "in_app": true,
        "email": false,
        "email_digest": true
      }
    }
  }
}
```

If no preferences exist, returns default preferences with all channels enabled.

**Error Cases:**
- 401: Not authenticated
- 400: Database error

### 11. PUT /api/notifications/preferences
**File:** `/app/api/notifications/preferences/route.ts`

Updates notification preferences for a specific notification type.

**Request Body:**
```json
{
  "notification_type": "comment_on_project",
  "in_app": true,
  "email": true,
  "email_digest": false
}
```

**Behavior:**
- Upserts into notification_preferences table
- Only specified fields are updated (others preserved)
- Creates new record if doesn't exist

**Returns:**
- `success`: true
- `data`: Updated preference record

**Error Cases:**
- 401: Not authenticated
- 400: Missing notification_type or database error

## Notification Bell Component

**File:** `/components/app/notification-bell.tsx`

A React client component that displays a bell icon with notification badge and dropdown.

### Features

**Visual Elements:**
- Bell icon from lucide-react
- Red badge showing unread count (hidden if 0)
- Count displays as "99+" if greater than 99
- Brand colors: `#FDFBF7` background, `#E8E0D0` borders

**Dropdown Panel:**
- Shows up to 10 most recent notifications
- Each notification displays:
  - Title (bold, truncated)
  - Body (2-line truncated, 100 chars max)
  - Relative time ("2m ago", "3h ago", etc.)
  - Blue dot indicator for unread items
- Unread notifications highlighted with light blue background (`#EBF3FF`)

**Interactions:**
- Click bell to toggle dropdown
- Click notification to mark as read and navigate to action_url
- "Mark all read" button marks all notifications as read (visible when unread_count > 0)
- "View all notifications" link navigates to /app/notifications
- Click outside dropdown closes it

**Auto-refresh:**
- Fetches notifications on component mount
- Polls every 30 seconds for new notifications
- Uses cleanup to prevent memory leaks

**Styling:**
- Responsive dropdown with max-height and scroll
- Smooth hover transitions
- Shadow and border for elevation
- Uses Tailwind CSS classes

### Props
None - component manages its own state

### Dependencies
- `lucide-react`: Icon library
- `next/navigation`: Router for navigation
- `next/link`: Link component
- `@/lib/supabase/client`: Supabase client
- React hooks: useState, useEffect, useRef

### API Integration
- GET `/api/notifications?limit=10&unread=false`: Fetch notifications
- PATCH `/api/notifications`: Mark as read (single or all)

## Database Requirements

The implementation assumes the following Supabase tables exist:

**profiles**
- id (uuid, primary key)
- email (text)
- full_name (text)
- avatar_url (text)
- organization_id (uuid, foreign key)
- role (text) - user_role enum: 'user', 'admin', 'owner'
- created_at (timestamp)
- updated_at (timestamp)

**team_members**
- id (uuid, primary key)
- user_id (uuid)
- organization_id (uuid)
- role (text)
- joined_at (timestamp)
- created_at (timestamp)

**team_invitations**
- id (uuid, primary key)
- organization_id (uuid)
- email (text)
- role (text)
- token (text)
- status (text) - 'pending', 'accepted', 'revoked'
- expires_at (timestamp)
- accepted_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)

**notifications**
- id (uuid, primary key)
- recipient_id (uuid)
- title (text)
- body (text)
- action_url (text)
- is_read (boolean)
- created_at (timestamp)
- read_at (timestamp)

**notification_preferences**
- id (uuid, primary key)
- profile_id (uuid)
- notification_type (text)
- in_app (boolean, default: true)
- email (boolean, default: true)
- email_digest (boolean, default: true)
- created_at (timestamp)
- updated_at (timestamp)

**activity_logs** (optional, for audit trail)
- id (uuid, primary key)
- organization_id (uuid)
- user_id (uuid)
- action (text)
- resource_type (text)
- resource_id (uuid)
- details (jsonb)
- created_at (timestamp)

## Authentication & Authorization Pattern

All routes follow the standard pattern:

1. **Auth Check:** Get authenticated user from session
2. **Profile Lookup:** Get user's profile with organization_id and role
3. **Permission Verification:** Check if caller's role (admin/owner) allows the action
4. **Organization Check:** Verify target resource belongs to caller's organization
5. **Action:** Perform the requested operation
6. **Activity Log:** Log the action for audit trail (if table exists)
7. **Response:** Return success with updated data

## Error Handling

All routes include:
- Proper HTTP status codes (401, 403, 404, 400, 409)
- Descriptive error messages
- Try-catch blocks for unexpected errors
- Console logging for debugging
- Safe null checks

## Notes for Implementation

1. The `getSupabaseAdminClient()` is used for write operations (insert/update/delete) to bypass RLS if configured
2. The invitation token should be included in an email link to the user
3. Activity logs are created for audit trail but are not required for core functionality
4. Notification preferences use sensible defaults if none exist
5. The notification bell component uses client-side polling (30 second intervals) - consider upgrading to Supabase Realtime subscriptions for real-time updates
6. All dates are in ISO 8601 format in the database
7. Role management uses a 'user_role' enum type (user, admin, owner)
8. All components follow Next.js 16+ async/await patterns and server/client component patterns
