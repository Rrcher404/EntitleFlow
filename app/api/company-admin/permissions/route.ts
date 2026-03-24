/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { verifyCompanyAdmin } from '@/lib/admin/company-auth';

export async function GET(request: NextRequest) {
  try {
    const { error, admin, serviceClient } = await verifyCompanyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    const licenseType = request.nextUrl.searchParams.get('license_type');

    // Get default permissions by license type
    let defaultQuery = serviceClient
      .from('role_permissions')
      .select('license_type, permission');

    if (licenseType) {
      defaultQuery = defaultQuery.eq('license_type', licenseType);
    }

    const [
      { data: defaultPermissions },
      { data: userOverrides },
    ] = await Promise.all([
      defaultQuery,
      serviceClient
        .from('user_permission_overrides')
        .select('profile_id, permission, granted, created_at, profiles(full_name, email)')
        .eq('organization_id', admin.organization_id),
    ]);

    return NextResponse.json({
      default_permissions: defaultPermissions || [],
      user_overrides: userOverrides || [],
    });
  } catch (err) {
    console.error('Error fetching permissions:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, admin, serviceClient } = await verifyCompanyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    const body = await request.json();
    const { profile_id, permission, granted } = body;

    if (!profile_id || !permission || granted === undefined) {
      return NextResponse.json(
        { error: 'profile_id, permission, and granted are required' },
        { status: 400 }
      );
    }

    // Verify user belongs to organization
    const { data: user } = await serviceClient
      .from('profiles')
      .select('organization_id')
      .eq('id', profile_id)
      .single();

    if (!user || user.organization_id !== admin.organization_id) {
      return NextResponse.json(
        { error: 'User not found in organization' },
        { status: 404 }
      );
    }

    // Upsert permission override
    const { data: override, error: overrideError } = await serviceClient
      .from('user_permission_overrides')
      .upsert({
        profile_id,
        organization_id: admin.organization_id,
        permission,
        granted,
        granted_by: admin.id,
      })
      .select()
      .single();

    if (overrideError) {
      return NextResponse.json(
        { error: overrideError.message },
        { status: 400 }
      );
    }

    // Log the action
    await serviceClient.from('admin_audit_log').insert({
      admin_id: admin.id,
      organization_id: admin.organization_id,
      action: 'permission_override_updated',
      target_type: 'user_permission',
      target_id: profile_id,
      details: { permission, granted },
    });

    // Log to activity tracking
    await serviceClient.from('user_activity_tracking').insert({
      profile_id: admin.id,
      organization_id: admin.organization_id,
      action: 'permission_override_updated',
      resource_type: 'user_permission',
      resource_id: profile_id,
      metadata: { permission, granted },
    });

    return NextResponse.json(override);
  } catch (err) {
    console.error('Error updating permission:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
