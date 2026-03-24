/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/**
 * Server-side permission checking utilities for EntitleFlow
 * 
 * Provides permission checking functions for use in API routes and server components.
 * Uses the Supabase server client to fetch user permissions and role information.
 */

import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';
import type {
  PermissionAction,
  PermissionCheckResult,
  UserPermissionContext,
  LicenseType,
  UserRole,
} from './types';
import { DEFAULT_LICENSE_PERMISSIONS } from './constants';

// ============================================================================
// REQUEST-SCOPED CACHE FOR PERMISSION CONTEXT
// ============================================================================

let cachedPermissionContext: UserPermissionContext | null = null;

/**
 * Clear the cached permission context (called at start of each request)
 */
function clearPermissionCache() {
  cachedPermissionContext = null;
}

// ============================================================================
// MAIN PERMISSION CONTEXT RETRIEVAL
// ============================================================================

/**
 * Get the full permission context for the current user
 * Queries the profiles table for role, license_type, and is_super_admin
 * Merges default permissions with any user-specific overrides
 */
export async function getUserPermissionContext(): Promise<UserPermissionContext | null> {
  // Return cached context if available
  if (cachedPermissionContext) {
    return cachedPermissionContext;
  }

  try {
    const client = await createServerSupabaseClient();
    if (!client) {
      return null;
    }

    // Get current user
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return null;
    }

    // Get admin client for RLS-bypassing queries
    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return null;
    }

    // Fetch user profile with role and license info
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, organization_id, role, license_type, is_super_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    const licenseType = (profile.license_type as LicenseType) || 'guest_viewer';
    const role = (profile.role as UserRole) || 'viewer';
    const isSuperAdmin = profile.is_super_admin || false;

    // Start with default permissions for the license type
    let permissions = new Set<PermissionAction>(DEFAULT_LICENSE_PERMISSIONS[licenseType] || []);

    // If super admin, add all permissions
    if (isSuperAdmin) {
      const allPermissions: PermissionAction[] = [
        'project.create',
        'project.read',
        'project.update',
        'project.delete',
        'subproject.create',
        'subproject.read',
        'subproject.update',
        'subproject.delete',
        'permit.create',
        'permit.read',
        'permit.update',
        'permit.delete',
        'document.upload',
        'document.download',
        'document.delete',
        'document.read',
        'comment.create',
        'comment.read',
        'comment.update',
        'comment.delete',
        'comment.resolve',
        'team.invite',
        'team.remove',
        'team.update_role',
        'admin.access',
        'admin.manage_users',
        'admin.manage_settings',
        'admin.view_audit',
        'analytics.view',
        'analytics.export',
        'password.reset_others',
      ];
      permissions = new Set(allPermissions);
    }

    // Fetch any user-specific permission overrides
    const { data: overrides, error: overridesError } = await adminClient
      .from('user_permission_overrides')
      .select('permission_action, granted')
      .eq('user_id', user.id);

    if (!overridesError && overrides && overrides.length > 0) {
      for (const override of overrides) {
        if (override.granted) {
          permissions.add(override.permission_action as PermissionAction);
        } else {
          permissions.delete(override.permission_action as PermissionAction);
        }
      }
    }

    const context: UserPermissionContext = {
      userId: user.id,
      organizationId: profile.organization_id || '',
      role,
      licenseType,
      isSuperAdmin,
      permissions,
    };

    // Cache for this request
    cachedPermissionContext = context;
    return context;
  } catch (error) {
    console.error('Error fetching user permission context:', error);
    return null;
  }
}

// ============================================================================
// PERMISSION CHECKING FUNCTIONS
// ============================================================================

/**
 * Check if current user has a specific permission
 */
export async function checkPermission(permission: PermissionAction): Promise<PermissionCheckResult> {
  const context = await getUserPermissionContext();

  if (!context) {
    return {
      allowed: false,
      reason: 'User not authenticated',
    };
  }

  const hasPermission = context.permissions.has(permission);

  return {
    allowed: hasPermission,
    reason: hasPermission ? undefined : `Permission '${permission}' denied`,
  };
}

/**
 * Check if current user has ANY of the given permissions
 */
export async function checkAnyPermission(
  permissions: PermissionAction[]
): Promise<PermissionCheckResult> {
  const context = await getUserPermissionContext();

  if (!context) {
    return {
      allowed: false,
      reason: 'User not authenticated',
    };
  }

  const hasAny = permissions.some((p) => context.permissions.has(p));

  return {
    allowed: hasAny,
    reason: hasAny ? undefined : `None of the required permissions found`,
  };
}

/**
 * Check if current user has ALL of the given permissions
 */
export async function checkAllPermissions(
  permissions: PermissionAction[]
): Promise<PermissionCheckResult> {
  const context = await getUserPermissionContext();

  if (!context) {
    return {
      allowed: false,
      reason: 'User not authenticated',
    };
  }

  const hasAll = permissions.every((p) => context.permissions.has(p));

  return {
    allowed: hasAll,
    reason: hasAll ? undefined : `Missing required permissions`,
  };
}

// ============================================================================
// PERMISSION REQUIREMENT ENFORCEMENT
// ============================================================================

/**
 * Require a permission or return null (for use in API routes)
 * Throws an error if permission is denied
 */
export async function requirePermission(permission: PermissionAction): Promise<UserPermissionContext> {
  const context = await getUserPermissionContext();

  if (!context) {
    throw new Error('User not authenticated');
  }

  if (!context.permissions.has(permission)) {
    throw new Error(`Permission '${permission}' required but not granted`);
  }

  return context;
}

/**
 * Require all of the given permissions or throw an error
 */
export async function requireAllPermissions(
  permissions: PermissionAction[]
): Promise<UserPermissionContext> {
  const context = await getUserPermissionContext();

  if (!context) {
    throw new Error('User not authenticated');
  }

  const missing = permissions.filter((p) => !context.permissions.has(p));
  if (missing.length > 0) {
    throw new Error(`Missing required permissions: ${missing.join(', ')}`);
  }

  return context;
}

// ============================================================================
// FILE UPLOAD VALIDATION
// ============================================================================

/**
 * Check if file upload is allowed based on size and org quota
 */
export async function checkFileUploadAllowed(
  organizationId: string,
  fileSize: number
): Promise<{ allowed: boolean; reason?: string }> {
  const context = await getUserPermissionContext();

  if (!context) {
    return {
      allowed: false,
      reason: 'User not authenticated',
    };
  }

  // Check if user has document.upload permission
  if (!context.permissions.has('document.upload')) {
    return {
      allowed: false,
      reason: 'User does not have document upload permission',
    };
  }

  // Check file size limit (150MB)
  const MAX_FILE_SIZE = 157286400; // 150MB
  if (fileSize > MAX_FILE_SIZE) {
    return {
      allowed: false,
      reason: `File size exceeds maximum of 150MB`,
    };
  }

  // Check organization storage quota
  try {
    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return {
        allowed: false,
        reason: 'Unable to verify storage quota',
      };
    }

    const { data: org, error: orgError } = await adminClient
      .from('organizations')
      .select('storage_used_bytes, storage_limit_bytes')
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      return {
        allowed: false,
        reason: 'Unable to retrieve organization storage info',
      };
    }

    const storageLimitBytes = org.storage_limit_bytes || 10737418240; // 10GB default
    const storageUsedBytes = org.storage_used_bytes || 0;
    const storageAvailableBytes = storageLimitBytes - storageUsedBytes;

    if (fileSize > storageAvailableBytes) {
      return {
        allowed: false,
        reason: `Insufficient storage quota. ${storageAvailableBytes} bytes available`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking file upload allowance:', error);
    return {
      allowed: false,
      reason: 'Error verifying file upload eligibility',
    };
  }
}

// ============================================================================
// COMPANY ADMIN VERIFICATION
// ============================================================================

/**
 * Verify that the current user is a company admin (not super admin, but org admin)
 */
export async function verifyCompanyAdmin(): Promise<{
  error: string | null;
  admin: {
    id: string;
    full_name: string;
    email: string;
    organization_id: string;
    license_type: string;
  } | null;
  client: any;
}> {
  try {
    const client = await createServerSupabaseClient();
    if (!client) {
      return {
        error: 'Server not configured',
        admin: null,
        client: null,
      };
    }

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return {
        error: 'Not authenticated',
        admin: null,
        client: null,
      };
    }

    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return {
        error: 'Admin client not configured',
        admin: null,
        client: null,
      };
    }

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, full_name, email, organization_id, license_type, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        error: 'Profile not found',
        admin: null,
        client: null,
      };
    }

    // Check if user is admin or owner in their organization
    const isOrgAdmin = profile.role === 'owner' || profile.role === 'admin';
    if (!isOrgAdmin) {
      return {
        error: 'Not an organization admin',
        admin: null,
        client: null,
      };
    }

    return {
      error: null,
      admin: {
        id: profile.id,
        full_name: profile.full_name || '',
        email: profile.email || '',
        organization_id: profile.organization_id || '',
        license_type: profile.license_type || 'guest_viewer',
      },
      client: adminClient,
    };
  } catch (error) {
    console.error('Error verifying company admin:', error);
    return {
      error: 'Error verifying admin status',
      admin: null,
      client: null,
    };
  }
}
