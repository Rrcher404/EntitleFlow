# Company Admin Dashboard API Routes - Summary

## Overview
These routes support the company-scoped admin panel accessible to organization admins (users with `license_type='admin'` or `role='owner'/'admin'`).

All routes use the `verifyCompanyAdmin()` helper from `/lib/admin/company-auth.ts` for authorization.

---

## 1. Authentication Helper
**File**: `/lib/admin/company-auth.ts`

Verifies user is a company admin by checking:
- `role = 'admin'` OR `role = 'owner'` OR `license_type = 'admin'`
- User belongs to the organization making the request

Returns: admin user info + service client for DB operations

---

## 2. Dashboard Statistics
**Endpoint**: `GET /api/company-admin/stats`

Returns organization-wide statistics:
```json
{
  "total_users": 15,
  "active_users": 12,
  "total_projects": 8,
  "total_permits": 23,
  "storage_used_bytes": 1234567890,
  "storage_limit_bytes": 10737418240,
  "license_breakdown": {
    "admin": 2,
    "project_manager": 5,
    "contributor": 6,
    "guest_viewer": 2
  },
  "recent_activity": [...]
}
```

---

## 3. User Management
**Endpoints**:
- `GET /api/company-admin/users` - List all org users with filtering
- `PATCH /api/company-admin/users` - Update user (license_type, role, is_active)
- `GET /api/company-admin/users/[id]` - Get user details with permissions and activity
- `POST /api/company-admin/users/[id]/reset-password` - Trigger password reset email

### Query Parameters (GET users):
- `?search=` - Search by email or name
- `?license_type=` - Filter by license type
- `?role=` - Filter by role

### Update User (PATCH):
```json
{
  "user_id": "uuid",
  "license_type": "project_manager",
  "role": "admin",
  "is_active": true
}
```

### User Details Response:
```json
{
  "profile": { ... },
  "permissions": ["project.create", "project.read", ...],
  "recent_activity": [...],
  "group_memberships": [...]
}
```

---

## 4. Permission Management
**Endpoints**:
- `GET /api/company-admin/permissions` - Get all permissions (defaults + overrides)
- `POST /api/company-admin/permissions` - Create/update user permission override

### Query Parameters (GET):
- `?license_type=` - Filter default permissions by license type

### Create Override (POST):
```json
{
  "profile_id": "uuid",
  "permission": "admin.manage_users",
  "granted": true
}
```

---

## 5. Company Groups
**Endpoints**:
- `GET /api/company-admin/groups` - Get all groups with members
- `POST /api/company-admin/groups` - Create new group
- `PATCH /api/company-admin/groups` - Update group
- `DELETE /api/company-admin/groups` - Delete group

### Create Group (POST):
```json
{
  "name": "Engineering Team",
  "description": "All engineering staff",
  "parent_group_id": "uuid" (optional)
}
```

### Update Group (PATCH):
```json
{
  "id": "uuid",
  "name": "Engineering Team",
  "description": "Updated description",
  "parent_group_id": "uuid" (optional)
}
```

### Delete Group (DELETE):
```json
{
  "id": "uuid"
}
```

---

## 6. Group Membership
**Endpoints**:
- `POST /api/company-admin/groups/members` - Add user to group
- `DELETE /api/company-admin/groups/members` - Remove user from group

### Add Member (POST):
```json
{
  "group_id": "uuid",
  "profile_id": "uuid"
}
```

### Remove Member (DELETE):
```json
{
  "group_id": "uuid",
  "profile_id": "uuid"
}
```

---

## 7. Security Configuration
**Endpoints**:
- `GET /api/company-admin/security` - Get password reset config
- `PATCH /api/company-admin/security` - Update password reset config

### Update Config (PATCH):
```json
{
  "reset_link_duration_hours": 24,
  "force_reset_schedule_days": 90,
  "min_password_length": 8,
  "require_uppercase": true,
  "require_number": true,
  "require_special_char": false
}
```

---

## 8. Storage Management
**Endpoint**: `GET /api/company-admin/storage`

Returns organization storage information:
```json
{
  "storage_used_bytes": 1234567890,
  "storage_limit_bytes": 10737418240,
  "max_file_size_bytes": 157286400,
  "storage_percentage": 12,
  "breakdown_by_project": [...],
  "breakdown_by_user": [...],
  "file_type_distribution": {...}
}
```

---

## 9. Audit Log
**Endpoint**: `GET /api/company-admin/audit`

Returns paginated audit log entries.

### Query Parameters:
- `?page=1` - Page number (default: 1)
- `?per_page=50` - Entries per page (default: 50)
- `?user_id=` - Filter by admin user
- `?action=` - Filter by action type
- `?resource_type=` - Filter by target type
- `?date_from=` - Filter from date (ISO 8601)
- `?date_to=` - Filter to date (ISO 8601)

### Response:
```json
{
  "data": [...],
  "pagination": {
    "total": 500,
    "page": 1,
    "per_page": 50,
    "total_pages": 10
  }
}
```

---

## 10. Audit Export
**Endpoint**: `GET /api/company-admin/audit/export`

Export audit log as downloadable file.

### Query Parameters:
- `?format=csv|xlsx|md` - Export format (default: csv)
- `?date_from=` - Filter from date
- `?date_to=` - Filter to date
- `?user_id=` - Filter by admin
- `?action=` - Filter by action

### Response:
Returns file download with appropriate Content-Type and Content-Disposition headers.

---

## Logging & Auditing

All mutations (POST, PATCH, DELETE) are automatically logged to:

1. **admin_audit_log** - Admin action audit trail
   - Tracks: who did what, to which resource, when
   - Used for compliance and security reviews

2. **user_activity_tracking** - User activity tracking
   - Tracks: all admin panel actions by admins
   - Includes resource context and metadata

---

## Error Handling

All routes follow consistent error response patterns:

### Authentication/Authorization Errors:
```json
{ "error": "Not authenticated" } // 401
{ "error": "Not authorized - company admin required" } // 403
```

### Validation Errors:
```json
{ "error": "user_id is required" } // 400
```

### Not Found Errors:
```json
{ "error": "User not found in organization" } // 404
```

### Server Errors:
```json
{ "error": "Internal server error" } // 500
```

---

## Database Tables Referenced

- `profiles` - User profiles with license_type, role, is_active
- `organizations` - Org settings including storage limits
- `admin_audit_log` - Admin action audit trail
- `user_activity_tracking` - User activity history
- `role_permissions` - Default permissions by license type
- `user_permission_overrides` - Custom permission grants/revokes
- `password_reset_config` - Org-specific password policies
- `company_groups` - Team/department grouping
- `company_group_members` - Group membership mappings

---

## File Locations

Helper:
- `/lib/admin/company-auth.ts`

Routes:
- `/app/api/company-admin/stats/route.ts`
- `/app/api/company-admin/users/route.ts`
- `/app/api/company-admin/users/[id]/route.ts`
- `/app/api/company-admin/users/[id]/reset-password/route.ts`
- `/app/api/company-admin/permissions/route.ts`
- `/app/api/company-admin/groups/route.ts`
- `/app/api/company-admin/groups/members/route.ts`
- `/app/api/company-admin/security/route.ts`
- `/app/api/company-admin/storage/route.ts`
- `/app/api/company-admin/audit/route.ts`
- `/app/api/company-admin/audit/export/route.ts`
