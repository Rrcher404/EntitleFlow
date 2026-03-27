import { NextRequest, NextResponse } from 'next/server';
import { verifyCompanyAdmin } from '@/lib/admin/company-auth';
import type { Database } from '@/lib/database.types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, admin, serviceClient } = await verifyCompanyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    const { id } = await params;
    const userId = id;

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, admin, serviceClient } = await verifyCompanyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    const { id } = await params;
    const userId = id;
    const body = await request.json();
    const { license_type } = body;

    // Verify the target user belongs to the same organization
    const { data: targetUser, error: fetchError } = await serviceClient
      .from('profiles')
      .select('id, organization_id, full_name, email, license_type')
      .eq('id', userId)
      .eq('organization_id', admin.organization_id)
      .single();

    if (fetchError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found or does not belong to your organization' },
        { status: 404 }
      );
    }

    // Validate license_type if provided
    if (license_type !== undefined) {
      const validLicenseTypes: Database['public']['Enums']['license_type'][] = [
        'admin',
        'project_manager',
        'contributor',
        'guest_viewer',
      ];

      if (!validLicenseTypes.includes(license_type)) {
        return NextResponse.json(
          { error: 'Invalid license type' },
          { status: 400 }
        );
      }
    }

    // Update the user's license_type
    const { data: updatedUser, error: updateError } = await serviceClient
      .from('profiles')
      .update({ license_type })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    // Log the change to admin_audit_log
    await serviceClient.from('admin_audit_log').insert({
      admin_id: admin.id,
      organization_id: admin.organization_id,
      action: 'user_license_updated',
      target_type: 'user',
      target_id: userId,
      details: {
        old_license_type: targetUser.license_type,
        new_license_type: license_type,
        user_email: targetUser.email,
        user_name: targetUser.full_name,
      },
    });

    // Log to user_activity_tracking
    await serviceClient.from('user_activity_tracking').insert({
      profile_id: admin.id,
      organization_id: admin.organization_id,
      action: 'user_license_changed_by_admin',
      resource_type: 'user',
      resource_id: userId,
      resource_name: targetUser.full_name || 'Unknown',
      metadata: {
        old_license_type: targetUser.license_type,
        new_license_type: license_type,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error('Error updating user license:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
