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

    // Get all groups with members
    const { data: groups, error: groupsError } = await serviceClient
      .from('company_groups')
      .select('id, name, description, parent_group_id, created_at, updated_at')
      .eq('organization_id', admin.organization_id)
      .order('created_at', { ascending: false });

    if (groupsError) {
      return NextResponse.json(
        { error: groupsError.message },
        { status: 400 }
      );
    }

    // Get members for each group
    const groupsWithMembers = await Promise.all(
      (groups || []).map(async (group: any) => {
        const { data: members } = await serviceClient
          .from('company_group_members')
          .select('profile_id, profiles(id, email, full_name)')
          .eq('group_id', group.id);

        return {
          ...group,
          members: members || [],
        };
      })
    );

    return NextResponse.json({
      data: groupsWithMembers,
      count: groupsWithMembers.length,
    });
  } catch (err) {
    console.error('Error fetching groups:', err);
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
    const { name, description, parent_group_id } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    // If parent_group_id is provided, verify it belongs to same org
    if (parent_group_id) {
      const { data: parentGroup } = await serviceClient
        .from('company_groups')
        .select('organization_id')
        .eq('id', parent_group_id)
        .single();

      if (!parentGroup || parentGroup.organization_id !== admin.organization_id) {
        return NextResponse.json(
          { error: 'Parent group not found in organization' },
          { status: 404 }
        );
      }
    }

    // Create group
    const { data: group, error: groupError } = await serviceClient
      .from('company_groups')
      .insert({
        organization_id: admin.organization_id,
        name,
        description: description || null,
        parent_group_id: parent_group_id || null,
      })
      .select()
      .single();

    if (groupError) {
      return NextResponse.json(
        { error: groupError.message },
        { status: 400 }
      );
    }

    // Log the action
    await serviceClient.from('admin_audit_log').insert({
      admin_id: admin.id,
      organization_id: admin.organization_id,
      action: 'group_created',
      target_type: 'group',
      target_id: group.id,
      details: { name, description },
    });

    // Log to activity tracking
    await serviceClient.from('user_activity_tracking').insert({
      profile_id: admin.id,
      organization_id: admin.organization_id,
      action: 'group_created',
      resource_type: 'group',
      resource_id: group.id,
      resource_name: name,
    });

    return NextResponse.json(group, { status: 201 });
  } catch (err) {
    console.error('Error creating group:', err);
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
    const { id, name, description, parent_group_id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    // Verify group belongs to organization
    const { data: group } = await serviceClient
      .from('company_groups')
      .select('organization_id')
      .eq('id', id)
      .single();

    if (!group || group.organization_id !== admin.organization_id) {
      return NextResponse.json(
        { error: 'Group not found in organization' },
        { status: 404 }
      );
    }

    // Verify parent group if provided
    if (parent_group_id) {
      const { data: parentGroup } = await serviceClient
        .from('company_groups')
        .select('organization_id')
        .eq('id', parent_group_id)
        .single();

      if (!parentGroup || parentGroup.organization_id !== admin.organization_id) {
        return NextResponse.json(
          { error: 'Parent group not found in organization' },
          { status: 404 }
        );
      }
    }

    // Update group
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (parent_group_id !== undefined) updateData.parent_group_id = parent_group_id;

    const { data: updatedGroup, error: updateError } = await serviceClient
      .from('company_groups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    // Log the action
    await serviceClient.from('admin_audit_log').insert({
      admin_id: admin.id,
      organization_id: admin.organization_id,
      action: 'group_updated',
      target_type: 'group',
      target_id: id,
      details: updateData,
    });

    return NextResponse.json(updatedGroup);
  } catch (err) {
    console.error('Error updating group:', err);
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
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    // Verify group belongs to organization
    const { data: group } = await serviceClient
      .from('company_groups')
      .select('organization_id, name')
      .eq('id', id)
      .single();

    if (!group || group.organization_id !== admin.organization_id) {
      return NextResponse.json(
        { error: 'Group not found in organization' },
        { status: 404 }
      );
    }

    // Delete group (cascade will handle members)
    const { error: deleteError } = await serviceClient
      .from('company_groups')
      .delete()
      .eq('id', id);

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
      action: 'group_deleted',
      target_type: 'group',
      target_id: id,
      details: { group_name: group.name },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting group:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
