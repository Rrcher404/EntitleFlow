/**
 * Permission system types for RBAC in EntitleFlow
 * 
 * Defines all permission-related types, enums, and interfaces used throughout
 * the application for fine-grained access control.
 */

// ============================================================================
// LICENSE TYPE DEFINITIONS
// ============================================================================

export type LicenseType = 'admin' | 'project_manager' | 'contributor' | 'guest_viewer';

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

// ============================================================================
// PERMISSION ACTION DEFINITIONS
// ============================================================================

export type PermissionAction =
  // Project permissions
  | 'project.create'
  | 'project.read'
  | 'project.update'
  | 'project.delete'
  // Subproject permissions
  | 'subproject.create'
  | 'subproject.read'
  | 'subproject.update'
  | 'subproject.delete'
  // Permit permissions
  | 'permit.create'
  | 'permit.read'
  | 'permit.update'
  | 'permit.delete'
  // Document permissions
  | 'document.upload'
  | 'document.download'
  | 'document.delete'
  | 'document.read'
  // Comment permissions
  | 'comment.create'
  | 'comment.read'
  | 'comment.update'
  | 'comment.delete'
  | 'comment.resolve'
  // Team management permissions
  | 'team.invite'
  | 'team.remove'
  | 'team.update_role'
  // Admin permissions
  | 'admin.access'
  | 'admin.manage_users'
  | 'admin.manage_settings'
  | 'admin.view_audit'
  // Analytics permissions
  | 'analytics.view'
  | 'analytics.export'
  // User management permissions
  | 'password.reset_others';

// ============================================================================
// LICENSE DEFINITION INTERFACE
// ============================================================================

export type LicenseDefinition = {
  license_type: LicenseType;
  display_name: string;
  description: string;
  max_projects: number | null;
  max_permits_per_project: number | null;
  can_upload: boolean;
  can_download: boolean;
  can_delete_files: boolean;
  can_create_projects: boolean;
  can_create_subprojects: boolean;
  can_manage_team: boolean;
  can_access_admin_panel: boolean;
  can_export_data: boolean;
  can_reset_passwords: boolean;
  price_monthly_cents: number;
  price_annual_cents: number;
};

// ============================================================================
// USER PERMISSION CONTEXT
// ============================================================================

export type UserPermissionContext = {
  userId: string;
  organizationId: string;
  role: UserRole;
  licenseType: LicenseType;
  isSuperAdmin: boolean;
  permissions: Set<PermissionAction>;
};

// ============================================================================
// PERMISSION CHECK RESULT
// ============================================================================

export type PermissionCheckResult = {
  allowed: boolean;
  reason?: string;
};

// ============================================================================
// DISPLAY LABEL AND COLOR MAPPINGS
// ============================================================================

export const LICENSE_LABELS: Record<LicenseType, string> = {
  admin: 'Administrator',
  project_manager: 'Project Manager',
  contributor: 'Contributor',
  guest_viewer: 'Guest Viewer',
};

export const LICENSE_COLORS: Record<LicenseType, { bg: string; text: string }> = {
  admin: { bg: 'bg-purple-100', text: 'text-purple-800' },
  project_manager: { bg: 'bg-blue-100', text: 'text-blue-800' },
  contributor: { bg: 'bg-green-100', text: 'text-green-800' },
  guest_viewer: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

export const LICENSE_FEATURES: Record<LicenseType, string[]> = {
  admin: [
    'Full admin access',
    'User management',
    'Settings management',
    'Audit logs',
    'Unlimited projects',
    'Unlimited permits',
    'File upload/download',
    'Analytics export',
    'Team management',
  ],
  project_manager: [
    'Create & manage projects',
    'Create permits',
    'Manage subprojects',
    'Upload & download files',
    'View analytics',
    'Manage team members',
    'Resolve comments',
    'Export data',
  ],
  contributor: [
    'Create & edit content',
    'Upload files',
    'Download files',
    'Create comments',
    'View projects & permits',
    'Read analytics',
  ],
  guest_viewer: [
    'Read-only access',
    'View projects',
    'View permits',
    'Download files',
    'View comments',
  ],
};
