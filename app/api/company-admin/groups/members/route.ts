import { NextRequest, NextResponse } from 'next/server';
import { verifyCompanyAdmin } from '@/lib/admin/company-auth';

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
    const { group_id, profile_id } = body;

    if (!group_id || !profile_id) {
      return NextResponse.json(
        { error: 'group_id and profile_id are required' },
        { status: 400 }
      );
    }

    // Verify group belongs to organization
    const { data: group } = await serviceClient
      .from('company_groups')
      .select('organization_id')
      .eq('id', group_id)
      .single();

    if (!group || group.organization_id !== admin.organization_id) {
      return NextResponse.json(
        { error: 'Group not found in organization' },
        { status: 404 }
      );
    }

    // Verify user belongs to organization
    const { data: user } = await serviceClient
      .from('profiles')
      .select('organization_id, full_name')
      .eq('id', profile_id)
      .single();

    if (!user || user.organization_id !== admin.organization_id) {
      return NextResponse.json(
        { error: 'User not found in organization' },
        { status: 404 }
      );
    }

    // Add member to group
    const { data: member, error: memberError } = await serviceClient
      .from('company_group_members')
      .insert({
        group_id,
        profile_id,
      })
      .select()
      .single();

    if (memberError) {
      if (memberError.message.includes('duplicate')) {
        return NextResponse.json(
          { error: 'User already in group' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: memberError.message },
        { status: 400 }
      );
    }

    // Log the action
    await serviceClient.from('admin_audit_log').insert({
      admin_id: admin.id,
      organization_id: admin.organization_id,
      action: 'group_member_added',
      target_type: 'group_member',
      target_id: member.id,
      details: { group_id, profile_id },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    console.error('Error adding group member:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { error, admin, serviceClient } = await verifyCompanyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    const body = await request.json();
    const { group_id, profile_id } = body;

    if (!group_id || !profile_id) {
      return NextResponse.json(
        { error: 'group_id and profile_id are required' },
        { status: 400 }
      );
    }

    // Verify group belongs to organization
    const { data: group } = await serviceClient
      .from('company_groups')
      .select('organization_id')
      .eq('id', group_id)
      .single();

    if (!group || group.organization_id !== admin.organization_id) {
      return NextResponse.json(
        { error: 'Group not found in organization' },
        { status: 404 }
      );
    }

    // Delete membership
    const { error: deleteError } = await serviceClient
      .from('company_group_members')
      .delete()
      .eq('group_id', group_id)
      .eq('profile_id', profile_id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      );
    }

    // Log the action
    await serviceClient.from('admin_audit_log').insert({
      admin_id: admin.id,
      organization_id: admin.organization_id,
      action: 'group_member_removed',
      target_type: 'group_member',
      details: { group_id, profile_id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error removing group member:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
