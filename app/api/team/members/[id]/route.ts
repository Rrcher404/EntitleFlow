import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!callerProfile) {
      return NextResponse.json(
        { error: 'Caller profile not found' },
        { status: 404 }
      );
    }

    if (callerProfile.role !== 'admin' && callerProfile.role !== 'owner') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id, organization_id, role')
      .eq('id', id)
      .single();

    if (!targetProfile || targetProfile.organization_id !== callerProfile.organization_id) {
      return NextResponse.json(
        { error: 'Target member not found in organization' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    if (role === 'owner' && targetProfile.role !== 'owner') {
      const { data: ownerCount } = await supabase
        .from('profiles')
        .select('id')
        .eq('organization_id', callerProfile.organization_id)
        .eq('role', 'owner');

      if (!ownerCount || ownerCount.length === 0) {
        return NextResponse.json(
          { error: 'Cannot demote the last owner' },
          { status: 400 }
        );
      }
    }

    const adminClient = getSupabaseAdminClient();
    const { error: updateError } = await (adminClient as any)
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', id)
      .single();

    const { error: activityError } = await (adminClient as any)
      .from('activity_logs')
      .insert({
        organization_id: callerProfile.organization_id,
        user_id: user.id,
        action: 'team_member_role_changed',
        resource_type: 'team_member',
        resource_id: id,
        details: {
          old_role: targetProfile.role,
          new_role: role,
          target_user_email: targetProfile.id
        },
        created_at: new Date().toISOString()
      });

    if (activityError) {
      console.error('Error logging activity:', activityError);
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.id === id) {
      return NextResponse.json(
        { error: 'Cannot remove yourself from the organization' },
        { status: 400 }
      );
    }

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!callerProfile) {
      return NextResponse.json(
        { error: 'Caller profile not found' },
        { status: 404 }
      );
    }

    if (callerProfile.role !== 'admin' && callerProfile.role !== 'owner') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id, organization_id, role')
      .eq('id', id)
      .single();

    if (!targetProfile || targetProfile.organization_id !== callerProfile.organization_id) {
      return NextResponse.json(
        { error: 'Target member not found in organization' },
        { status: 404 }
      );
    }

    if (targetProfile.role === 'owner') {
      const { data: ownerCount } = await supabase
        .from('profiles')
        .select('id')
        .eq('organization_id', callerProfile.organization_id)
        .eq('role', 'owner');

      if (ownerCount && ownerCount.length === 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last owner' },
          { status: 400 }
        );
      }
    }

    const adminClient = getSupabaseAdminClient();
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', id)
      .eq('organization_id', callerProfile.organization_id)
      .single();

    if (existingMember) {
      await (adminClient as any)
        .from('team_members')
        .delete()
        .eq('id', existingMember.id);
    }

    const { error: activityError } = await (adminClient as any)
      .from('activity_logs')
      .insert({
        organization_id: callerProfile.organization_id,
        user_id: user.id,
        action: 'team_member_removed',
        resource_type: 'team_member',
        resource_id: id,
        details: {
          member_role: targetProfile.role
        },
        created_at: new Date().toISOString()
      });

    if (activityError) {
      console.error('Error logging activity:', activityError);
    }

    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
