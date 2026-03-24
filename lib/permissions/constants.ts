/**
 * Permission system constants for EntitleFlow
 * 
 * Defines default permission sets for each license type,
 * file limits, and other configuration constants.
 */

import type { PermissionAction, LicenseType } from './types';

// ============================================================================
// DEFAULT PERMISSION SETS BY LICENSE TYPE
// ============================================================================

export const DEFAULT_LICENSE_PERMISSIONS: Record<LicenseType, PermissionAction[]> = {
  admin: [
    // Project permissions
    'project.create',
    'project.read',
    'project.update',
    'project.delete',
    // Subproject permissions
    'subproject.create',
    'subproject.read',
    'subproject.update',
    'subproject.delete',
    // Permit permissions
    'permit.create',
    'permit.read',
    'permit.update',
    'permit.delete',
    // Document permissions
    'document.upload',
    'document.download',
    'document.delete',
    'document.read',
    // Comment permissions
    'comment.create',
    'comment.read',
    'comment.update',
    'comment.delete',
    'comment.resolve',
    // Team management permissions
    'team.invite',
    'team.remove',
    'team.update_role',
    // Admin permissions
    'admin.access',
    'admin.manage_users',
    'admin.manage_settings',
    'admin.view_audit',
    // Analytics permissions
    'analytics.view',
    'analytics.export',
    // User management permissions
    'password.reset_others',
  ],
  project_manager: [
    // Project permissions
    'project.create',
    'project.read',
    'project.update',
    // Subproject permissions
    'subproject.create',
    'subproject.read',
    'subproject.update',
    // Permit permissions
    'permit.create',
    'permit.read',
    'permit.update',
    // Document permissions
    'document.upload',
    'document.download',
    'document.read',
    // Comment permissions
    'comment.create',
    'comment.read',
    'comment.update',
    'comment.resolve',
    // Team management permissions
    'team.invite',
    'team.remove',
    // Analytics permissions
    'analytics.view',
    'analytics.export',
  ],
  contributor: [
    // Project permissions
    'project.read',
    'project.update',
    // Subproject permissions
    'subproject.read',
    'subproject.update',
    // Permit permissions
    'permit.read',
    'permit.update',
    // Document permissions
    'document.upload',
    'document.download',
    'document.read',
    // Comment permissions
    'comment.create',
    'comment.read',
    'comment.update',
    // Analytics permissions
    'analytics.view',
  ],
  guest_viewer: [
    // Project permissions (read-only)
    'project.read',
    // Subproject permissions (read-only)
    'subproject.read',
    // Permit permissions (read-only)
    'permit.read',
    // Document permissions (read-only)
    'document.download',
    'document.read',
    // Comment permissions (read-only)
    'comment.read',
    // Analytics permissions (read-only)
    'analytics.view',
  ],
};

// ============================================================================
// FILE UPLOAD LIMITS AND CONFIGURATION
// ============================================================================

export const FILE_LIMITS = {
  MAX_FILE_SIZE_BYTES: 157286400, // 150MB
  DEFAULT_ORG_STORAGE_BYTES: 10737418240, // 10GB
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/tiff',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed',
  ] as const,
};

// ============================================================================
// PERMISSION DESCRIPTIONS
// ============================================================================

export const PERMISSION_DESCRIPTIONS: Record<PermissionAction, string> = {
  // Project permissions
  'project.create': 'Create new projects',
  'project.read': 'View projects',
  'project.update': 'Edit projects',
  'project.delete': 'Delete projects',
  // Subproject permissions
  'subproject.create': 'Create subprojects',
  'subproject.read': 'View subprojects',
  'subproject.update': 'Edit subprojects',
  'subproject.delete': 'Delete subprojects',
  // Permit permissions
  'permit.create': 'Create permits',
  'permit.read': 'View permits',
  'permit.update': 'Edit permits',
  'permit.delete': 'Delete permits',
  // Document permissions
  'document.upload': 'Upload documents',
  'document.download': 'Download documents',
  'document.delete': 'Delete documents',
  'document.read': 'View documents',
  // Comment permissions
  'comment.create': 'Create comments',
  'comment.read': 'View comments',
  'comment.update': 'Edit comments',
  'comment.delete': 'Delete comments',
  'comment.resolve': 'Resolve comments',
  // Team management permissions
  'team.invite': 'Invite team members',
  'team.remove': 'Remove team members',
  'team.update_role': 'Update member roles',
  // Admin permissions
  'admin.access': 'Access admin panel',
  'admin.manage_users': 'Manage users',
  'admin.manage_settings': 'Manage settings',
  'admin.view_audit': 'View audit logs',
  // Analytics permissions
  'analytics.view': 'View analytics',
  'analytics.export': 'Export analytics',
  // User management permissions
  'password.reset_others': 'Reset other users passwords',
};

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

export const PERMISSION_CACHE_TTL_SECONDS = 300; // 5 minutes
