'use client';

/**
 * Client-side permission utilities for EntitleFlow
 * 
 * Provides React hooks for permission checking in client components.
 * Uses the Supabase browser client to fetch user permissions.
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  PermissionAction,
  LicenseType,
  UserRole,
} from './types';
import { DEFAULT_LICENSE_PERMISSIONS } from './constants';

// ============================================================================
// USE PERMISSIONS HOOK
// ============================================================================

/**
 * Hook to get permissions in client components
 * Fetches user profile and computes permissions client-side
 * 
 * @returns Object containing permissions set, license type, loading state, and helper functions
 */
export function usePermissions(): {
  permissions: Set<PermissionAction>;
  licenseType: LicenseType | null;
  role: UserRole | null;
  isSuperAdmin: boolean;
  loading: boolean;
  error: string | null;
  hasPermission: (p: PermissionAction) => boolean;
  hasAnyPermission: (ps: PermissionAction[]) => boolean;
  hasAllPermissions: (ps: PermissionAction[]) => boolean;
} {
  const [permissions, setPermissions] = useState<Set<PermissionAction>>(new Set());
  const [licenseType, setLicenseType] = useState<LicenseType | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError(null);

        const client = createClient();
        if (!client) {
          throw new Error('Supabase client not initialized');
        }

        // Get current user
        const {
          data: { user },
        } = await client.auth.getUser();

        if (!user) {
          if (isMounted) {
            setPermissions(new Set());
            setLicenseType(null);
            setRole(null);
            setIsSuperAdmin(false);
            setLoading(false);
          }
          return;
        }

        // Fetch user profile with role and license info
        // Note: This will be limited by RLS policies
        const { data: profile, error: profileError } = await client
          .from('profiles')
          .select('role, license_type, is_super_admin')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw new Error(`Failed to fetch profile: ${profileError.message}`);
        }

        if (!profile) {
          throw new Error('Profile not found');
        }

        const fetchedLicenseType = (profile.license_type as LicenseType) || 'guest_viewer';
        const fetchedRole = (profile.role as UserRole) || 'viewer';
        const fetchedIsSuperAdmin = profile.is_super_admin || false;

        // Start with default permissions for the license type
        let computedPermissions = new Set<PermissionAction>(
          DEFAULT_LICENSE_PERMISSIONS[fetchedLicenseType] || []
        );

        // If super admin, add all permissions
        if (fetchedIsSuperAdmin) {
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
          computedPermissions = new Set(allPermissions);
        }

        if (isMounted) {
          setPermissions(computedPermissions);
          setLicenseType(fetchedLicenseType);
          setRole(fetchedRole);
          setIsSuperAdmin(fetchedIsSuperAdmin);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching permissions';
        if (isMounted) {
          setError(errorMessage);
          setPermissions(new Set());
          setLicenseType(null);
          setRole(null);
          setIsSuperAdmin(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPermissions();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: PermissionAction): boolean => {
    return permissions.has(permission);
  };

  /**
   * Check if user has ANY of the given permissions
   */
  const hasAnyPermission = (perms: PermissionAction[]): boolean => {
    return perms.some((p) => permissions.has(p));
  };

  /**
   * Check if user has ALL of the given permissions
   */
  const hasAllPermissions = (perms: PermissionAction[]): boolean => {
    return perms.every((p) => permissions.has(p));
  };

  return {
    permissions,
    licenseType,
    role,
    isSuperAdmin,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}

// ============================================================================
// USE PERMISSION CHECK HOOK (Simple single permission check)
// ============================================================================

/**
 * Hook to check a single permission
 * Simpler alternative to usePermissions for single permission checks
 * 
 * @param permission - The permission to check
 * @returns Object with allowed boolean, loading state, and error
 */
export function useHasPermission(
  permission: PermissionAction
): {
  allowed: boolean;
  loading: boolean;
  error: string | null;
} {
  const { permissions, loading, error } = usePermissions();

  return {
    allowed: permissions.has(permission),
    loading,
    error,
  };
}

// ============================================================================
// USE MULTIPLE PERMISSIONS HOOK
// ============================================================================

/**
 * Hook to check multiple permissions with AND/OR logic
 * 
 * @param perms - Array of permissions to check
 * @param requireAll - If true, check that ALL permissions are present; if false, check ANY
 * @returns Object with allowed boolean, loading state, and error
 */
export function useHasPermissions(
  perms: PermissionAction[],
  requireAll: boolean = false
): {
  allowed: boolean;
  loading: boolean;
  error: string | null;
} {
  const { permissions, loading, error } = usePermissions();

  const allowed = requireAll
    ? perms.every((p) => permissions.has(p))
    : perms.some((p) => permissions.has(p));

  return {
    allowed,
    loading,
    error,
  };
}

// ============================================================================
// USE LICENSE TYPE HOOK
// ============================================================================

/**
 * Hook to get the current user's license type
 * 
 * @returns Object with license type, loading state, and error
 */
export function useLicenseType(): {
  licenseType: LicenseType | null;
  loading: boolean;
  error: string | null;
} {
  const { licenseType, loading, error } = usePermissions();

  return {
    licenseType,
    loading,
    error,
  };
}
