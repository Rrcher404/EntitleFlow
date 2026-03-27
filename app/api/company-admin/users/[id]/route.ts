import { NextRequest, NextResponse } from 'next/server';
import { verifyCompanyAdmin } from '@/lib/admin/company-auth';
import type { Database } from '@/lib/database.types';
import { notifyLicenseChangeRequest } from '@/lib/email/notify';

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
    const { license_type, request_notes } = body;

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

    // Get the organization's active contract to determine billing terms
    const { data: contract } = await (serviceClient
      .from('organization_contracts' as any)
      .select('billing_term, requires_prepayment_for_changes')
      .eq('organization_id', admin.organization_id)
      .eq('is_active', true)
      .single() as any) as { data: any; error: any };

    const billingTerm = contract?.billing_term || 'monthly';
    const requiresPrepayment = contract?.requires_prepayment_for_changes || false;

    // Create a license_change_request instead of directly updating
    const { data: changeRequest, error: createError } = await (serviceClient
      .from('license_change_requests' as any)
      .insert({
        organization_id: admin.organization_id,
        requested_by: admin.id,
        target_user_id: userId,
        current_license_type: targetUser.license_type || 'contributor',
        requested_license_type: license_type,
        status: 'pending',
        billing_term: billingTerm,
        requires_prepayment: requiresPrepayment,
        request_notes,
      })
      .select()
      .single() as any) as { data: any; error: any };

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }

    // Log the request to activity_log
    await serviceClient.from('activity_log').insert({
      organization_id: admin.organization_id,
      action: 'status_changed' as any,
      description: `License change requested for ${targetUser.full_name || 'Unknown'}: ${targetUser.license_type || 'contributor'} → ${license_type}`,
      metadata: {
        type: 'license_change_requested',
        current_license_type: targetUser.license_type || 'contributor',
        requested_license_type: license_type,
        request_id: changeRequest?.id,
        billing_term: billingTerm,
        requires_prepayment: requiresPrepayment,
      },
    } as any);

    // Fetch org name for the email notification
    const { data: org } = await serviceClient
      .from('organizations')
      .select('name')
      .eq('id', admin.organization_id)
      .single();

    // Fire-and-forget email to Licenses@entitleflow.com
    notifyLicenseChangeRequest({
      requestId: changeRequest?.id || 'unknown',
      organizationName: org?.name || 'Unknown Organization',
      organizationId: admin.organization_id,
      requestedByName: admin.full_name || 'Company Admin',
      requestedByEmail: admin.email || '',
      targetUserName: targetUser.full_name || 'Unknown',
      targetUserEmail: targetUser.email || '',
      currentLicense: targetUser.license_type || 'contributor',
      requestedLicense: license_type,
      billingTerm,
      requiresPrepayment,
      requestNotes: request_notes,
    }).catch((err) => console.error('[license-request] Email notification failed:', err));

    return NextResponse.json(changeRequest);
  } catch (err) {
    console.error('Error creating license change request:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
