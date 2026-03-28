# Company Admin Dashboard API - Quick Reference

## Base Path
`/api/company-admin`

## Authentication
All endpoints require:
- Valid Supabase auth session (via cookies)
- User role/license: `admin`, `owner`, or license_type=`admin`
- Same organization as request context

Returns 401 if not authenticated, 403 if not authorized.

---

## Endpoints Quick Lookup

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/stats` | Dashboard statistics |
| GET | `/users` | List users (filters: search, license_type, role) |
| PATCH | `/users` | Update user properties |
| GET | `/users/[id]` | User details + permissions + activity |
| POST | `/users/[id]/reset-password` | Send password reset email |
| GET | `/permissions` | Get all permissions (defaults + overrides) |
| POST | `/permissions` | Create/update permission override |
| GET | `/groups` | List all groups with members |
| POST | `/groups` | Create group |
| PATCH | `/groups` | Update group |
| DELETE | `/groups` | Delete group |
| POST | `/groups/members` | Add user to group |
| DELETE | `/groups/members` | Remove user from group |
| GET | `/security` | Get password reset config |
| PATCH | `/security` | Update password reset config |
| GET | `/storage` | Organization storage info |
| GET | `/audit` | Paginated audit log |
| GET | `/audit/export` | Export audit log (csv/xlsx/md) |

---

## Common Requests

### Get dashboard stats
```bash
curl -X GET https://yourapp.com/api/company-admin/stats
```

### List users with search
```bash
curl -X GET "https://yourapp.com/api/company-admin/users?search=john&license_type=admin"
```

### Update user license
```bash
curl -X PATCH https://yourapp.com/api/company-admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid",
    "license_type": "project_manager"
  }'
```

### Get user details
```bash
curl -X GET https://yourapp.com/api/company-admin/users/[id]
```

### Send password reset
```bash
curl -X POST https://yourapp.com/api/company-admin/users/[id]/reset-password
```

### Create group
```bash
curl -X POST https://yourapp.com/api/company-admin/groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Engineering",
    "description": "Eng team"
  }'
```

### Add user to group
```bash
curl -X POST https://yourapp.com/api/company-admin/groups/members \
  -H "Content-Type: application/json" \
  -d '{
    "group_id": "uuid",
    "profile_id": "uuid"
  }'
```

### Get security config
```bash
curl -X GET https://yourapp.com/api/company-admin/security
```

### Update security config
```bash
curl -X PATCH https://yourapp.com/api/company-admin/security \
  -H "Content-Type: application/json" \
  -d '{
    "reset_link_duration_hours": 24,
    "min_password_length": 10
  }'
```

### Get audit log
```bash
curl -X GET "https://yourapp.com/api/company-admin/audit?page=1&per_page=50"
```

### Export audit as CSV
```bash
curl -X GET "https://yourapp.com/api/company-admin/audit/export?format=csv&date_from=2024-01-01"
```

### Get storage info
```bash
curl -X GET https://yourapp.com/api/company-admin/storage
```

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Not Authenticated |
| 403 | Not Authorized (not company admin) |
| 404 | Not Found |
| 409 | Conflict (e.g., user already in group) |
| 500 | Server Error |

---

## Key Features

### Automatic Logging
Every mutation is logged to:
- `admin_audit_log` - What changed, by whom, when
- `user_activity_tracking` - Activity trail for admins

### Data Validation
- All user IDs verified to belong to same org
- Parent groups verified to belong to same org
- Request data validated before processing

### Type Safety
- Full TypeScript support
- No `any` types
- Proper error messages

### Permissions System
- Default permissions by license type
- User-specific permission overrides
- Granular permission control

### Group Hierarchies
- Support for parent-child group relationships
- Cascade delete for members
- Flexible organizational structures

---

## Database Schema

### Key Tables
- `profiles` - Users with license_type, role
- `organizations` - Org settings
- `admin_audit_log` - Admin actions
- `user_activity_tracking` - User actions
- `role_permissions` - Default permissions
- `user_permission_overrides` - Custom permissions
- `password_reset_config` - Password policies
- `company_groups` - Team grouping
- `company_group_members` - Memberships

---

## Error Response Examples

### Not Authenticated
```json
{ "error": "Not authenticated" }
```
Status: 401

### Not Authorized
```json
{ "error": "Not authorized - company admin required" }
```
Status: 403

### Validation Error
```json
{ "error": "user_id is required" }
```
Status: 400

### Not Found
```json
{ "error": "User not found in organization" }
```
Status: 404

### Server Error
```json
{ "error": "Internal server error" }
```
Status: 500

---

## Implementation Files

### Helper
- `/lib/admin/company-auth.ts`

### Routes
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
