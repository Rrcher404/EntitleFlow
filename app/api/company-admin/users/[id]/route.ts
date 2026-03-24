/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { verifyCompanyAdmin } from '@/lib/admin/company-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, admin, serviceClient } = await verifyCompanyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    const userId = params.id;

    // Get user profile
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('organization_id', admin.organization_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's permissions (defaults + overrides)
    const [
      { data: defaultPermissions },
      { data: userOverrides },
      { data: recentActivity },
      { data: groupMemberships },
    ] = await Promise.all([
      // Get default permissions for user's license type
      serviceClient
        .from('role_permissions')
        .select('permission')
        .eq('license_type', profile.license_type || 'contributor'),
      
      // Get user-specific overrides
      serviceClient
        .from('user_permission_overrides')
        .select('permission, granted')
        .eq('profile_id', userId),
      
      // Get recent activity (last 50)
      serviceClient
        .from('user_activity_tracking')
        .select('*')
        .eq('profile_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
      
      // Get group memberships
      serviceClient
        .from('company_group_members')
        .select('group_id, company_groups(id, name)')
        .eq('profile_id', userId),
    ]);

    // Merge default and override permissions
    const permissionSet = new Set(defaultPermissions?.map(p => p.permission) || []);
    
    if (userOverrides) {
      userOverrides.forEach((override: any) => {
        if (override.granted) {
          permissionSet.add(override.permission);
        } else {
          permissionSet.delete(override.permission);
        }
      });
    }

    return NextResponse.json({
      profile,
      permissions: Array.from(permissionSet),
      recent_activity: recentActivity || [],
      group_memberships: groupMemberships || [],
    });
  } catch (err) {
    console.error('Error fetching user details:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
