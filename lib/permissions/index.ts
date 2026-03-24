/**
 * Permission system exports for EntitleFlow
 * 
 * Re-exports all types, constants, and utilities from the permissions system
 * for convenient access throughout the application.
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  LicenseType,
  UserRole,
  PermissionAction,
  LicenseDefinition,
  UserPermissionContext,
  PermissionCheckResult,
} from './types';

export {
  LICENSE_LABELS,
  LICENSE_COLORS,
  LICENSE_FEATURES,
} from './types';

// ============================================================================
// CONSTANT EXPORTS
// ============================================================================

export {
  DEFAULT_LICENSE_PERMISSIONS,
  FILE_LIMITS,
  PERMISSION_DESCRIPTIONS,
  PERMISSION_CACHE_TTL_SECONDS,
} from './constants';

// ============================================================================
// SERVER-SIDE FUNCTION EXPORTS
// ============================================================================

export {
  getUserPermissionContext,
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  requirePermission,
  requireAllPermissions,
  checkFileUploadAllowed,
  verifyCompanyAdmin,
} from './server';

// ============================================================================
// CLIENT-SIDE HOOK EXPORTS
// ============================================================================

export {
  usePermissions,
  useHasPermission,
  useHasPermissions,
  useLicenseType,
} from './client';
