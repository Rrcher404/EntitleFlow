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

    const search = request.nextUrl.searchParams.get('search');
    const licenseType = request.nextUrl.searchParams.get('license_type');
    const role = request.nextUrl.searchParams.get('role');

    let query = serviceClient
      .from('profiles')
      .select('id, email, full_name, role, license_type, is_active, last_seen_at, created_at')
      .eq('organization_id', admin.organization_id);

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    if (licenseType) {
      query = query.eq('license_type', licenseType);
    }

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error: usersError } = await query.order('created_at', { ascending: false });

    if (usersError) {
      return NextResponse.json(
        { error: usersError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: users || [],
      count: users?.length || 0,
    });
  } catch (err) {
    console.error('Error fetching company users:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { error, admin, serviceClient } = await verifyCompanyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    const body = await request.json();
    const { user_id, license_type, role, is_active } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Verify user belongs to same organization
    const { data: targetUser } = await serviceClient
      .from('profiles')
      .select('organization_id')
      .eq('id', user_id)
      .single();

    if (!targetUser || targetUser.organization_id !== admin.organization_id) {
      return NextResponse.json(
        { error: 'User not found in organization' },
        { status: 404 }
      );
    }

    // Update user
    const updateData: Record<string, any> = {};
    if (license_type !== undefined) updateData.license_type = license_type;
    if (role !== undefined) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: updatedUser, error: updateError } = await serviceClient
      .from('profiles')
      .update(updateData)
      .eq('id', user_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    // Log to admin_audit_log
    await serviceClient.from('admin_audit_log').insert({
      admin_id: admin.id,
      organization_id: admin.organization_id,
      action: 'user_updated',
      target_type: 'user',
      target_id: user_id,
      details: { changes: updateData },
    });

    // Log to user_activity_tracking
    await serviceClient.from('user_activity_tracking').insert({
      profile_id: admin.id,
      organization_id: admin.organization_id,
      action: 'user_updated_by_admin',
      resource_type: 'user',
      resource_id: user_id,
      resource_name: updatedUser?.full_name || 'Unknown',
      metadata: { changes: updateData },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
