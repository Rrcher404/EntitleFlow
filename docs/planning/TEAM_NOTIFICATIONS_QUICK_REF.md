# Team Collaboration & Notifications - Quick Reference

## Created Files

### Team API Routes (6 files)
```
/app/api/team/members/route.ts              GET team members list
/app/api/team/members/[id]/route.ts         PATCH/DELETE single member
/app/api/team/invite/route.ts               POST to create invitation
/app/api/team/accept/route.ts               POST to accept invitation
/app/api/team/invitations/route.ts          GET pending invitations
/app/api/team/invitations/[id]/route.ts     DELETE to revoke invitation
```

### Notification API Routes (2 files)
```
/app/api/notifications/route.ts             GET/PATCH notifications
/app/api/notifications/preferences/route.ts GET/PUT preferences
```

### UI Component (1 file)
```
/components/app/notification-bell.tsx       Notification bell with dropdown
```

## API Endpoint Reference

### Team Management
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/team/members` | List team members | ✓ |
| PATCH | `/api/team/members/[id]` | Change member role | Admin+ |
| DELETE | `/api/team/members/[id]` | Remove member | Admin+ |
| POST | `/api/team/invite` | Send invitation | Admin+ |
| POST | `/api/team/accept` | Accept invitation | ✓ |
| GET | `/api/team/invitations` | List pending invites | Admin+ |
| DELETE | `/api/team/invitations/[id]` | Revoke invitation | Admin+ |

### Notifications
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/notifications` | List notifications | ✓ |
| PATCH | `/api/notifications` | Mark as read | ✓ |
| GET | `/api/notifications/preferences` | Get preferences | ✓ |
| PUT | `/api/notifications/preferences` | Update preferences | ✓ |

## Usage Examples

### Fetch Team Members
```typescript
const response = await fetch('/api/team/members');
const { data, organization_id } = await response.json();
```

### Send Team Invitation
```typescript
const response = await fetch('/api/team/invite', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    role: 'admin'
  })
});
const { invitation, token } = await response.json();
// Send token in email link
```

### Accept Invitation
```typescript
const response = await fetch('/api/team/accept', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'invitation_token_from_email'
  })
});
const { organization_id, role } = await response.json();
```

### Change Member Role
```typescript
const response = await fetch('/api/team/members/user-id', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    role: 'owner'
  })
});
const { data } = await response.json();
```

### Remove Member
```typescript
const response = await fetch('/api/team/members/user-id', {
  method: 'DELETE'
});
const { success, message } = await response.json();
```

### Get Notifications
```typescript
// Get unread only
const response = await fetch('/api/notifications?unread=true&limit=10&page=1');
const { data, unread_count, meta } = await response.json();

// Get all
const response = await fetch('/api/notifications?limit=20');
```

### Mark Notifications as Read
```typescript
// Mark specific notifications
const response = await fetch('/api/notifications', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    notification_ids: ['id1', 'id2', 'id3']
  })
});

// Mark all as read
const response = await fetch('/api/notifications', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mark_all_read: true
  })
});
```

### Get Notification Preferences
```typescript
const response = await fetch('/api/notifications/preferences');
const { data } = await response.json();
// Returns: { profile_id, preferences: { type: { in_app, email, email_digest } } }
```

### Update Notification Preferences
```typescript
const response = await fetch('/api/notifications/preferences', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    notification_type: 'comment_on_project',
    in_app: true,
    email: false,
    email_digest: true
  })
});
const { data } = await response.json();
```

## Using the Notification Bell Component

In a server component (e.g., topbar):

```typescript
import { NotificationBell } from '@/components/app/notification-bell';

export function TopBar() {
  return (
    <div className="flex items-center gap-4">
      {/* other content */}
      <NotificationBell />
    </div>
  );
}
```

The component is fully client-side and handles:
- Auto-fetching notifications every 30 seconds
- Displaying unread count badge
- Dropdown with recent notifications
- Marking individual notifications as read
- Marking all as read
- Navigation to action URLs
- Relative time display ("2m ago", "3h ago", etc.)

## Permission Levels

**user** - No special permissions, just team member

**admin** - Can:
- Invite users
- Remove members
- Change member roles
- View pending invitations
- Revoke invitations

**owner** - Can do everything admin can, plus:
- Cannot be demoted (last owner protection)
- Cannot be removed

## Key Implementation Details

1. **Token-based Invitations**: Uses 32-byte random hex tokens, valid for 7 days
2. **One Organization per User**: Users can only belong to one organization (enforced on accept)
3. **Last Owner Protection**: Cannot remove or demote the last owner
4. **Activity Logging**: All team changes are logged to activity_logs table (if it exists)
5. **Notification Polling**: Client-side 30-second polling (consider Realtime subscriptions for production)
6. **Default Preferences**: All channels enabled by default if no preferences exist
7. **Safe Error Handling**: All routes include try-catch and proper HTTP status codes

## Notes

- All timestamps are in ISO 8601 format
- Roles are defined as: 'user', 'admin', 'owner'
- The admin client is used for all write operations to bypass RLS if needed
- Profile lookups include organization_id and role for permission checks
- Invitation tokens should be sent via email (not implemented in these routes)
- The notification bell uses 30-second polling - upgrade to Realtime for better UX
