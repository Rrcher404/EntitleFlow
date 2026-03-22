import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (profile.role !== 'admin' && profile.role !== 'owner') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { data: invitation } = await supabase
      .from('team_invitations')
      .select('id, organization_id')
      .eq('id', id)
      .single();

    if (!invitation || invitation.organization_id !== profile.organization_id) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const adminClient = getSupabaseAdminClient();
    const { error: updateError } = await (adminClient as any)
      .from('team_invitations')
      .update({
        status: 'revoked',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    const { error: activityError } = await (adminClient as any)
      .from('activity_log')
      .insert({
        organization_id: profile.organization_id,
        user_id: user.id,
        action: 'team_invitation_revoked',
        resource_type: 'team_invitation',
        resource_id: id,
        details: {},
        created_at: new Date().toISOString()
      });

    if (activityError) {
      console.error('Error logging activity:', activityError);
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
