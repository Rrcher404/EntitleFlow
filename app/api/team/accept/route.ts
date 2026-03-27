import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';
import { checkSeatAvailability } from '@/lib/team/seat-check';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const { data: invitation, error: lookupError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .single();

    if (lookupError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invitation has already been used' },
        { status: 400 }
      );
    }

    const now = new Date();
    if (invitation.expires_at && new Date(invitation.expires_at) < now) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    const userEmail = user.email?.toLowerCase();
    const invitationEmail = invitation.email?.toLowerCase();

    if (userEmail !== invitationEmail) {
      return NextResponse.json(
        { error: 'Email does not match invitation' },
        { status: 403 }
      );
    }

    // Check seat availability before accepting
    const seatCheck = await checkSeatAvailability(supabase, invitation.organization_id);
    if (!seatCheck.allowed) {
      return NextResponse.json(
        { error: 'Organization has reached its seat limit.' },
        { status: 403 }
      );
    }

    const adminClient = getSupabaseAdminClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, organization_id')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.organization_id) {
      const { error: updateProfileError } = await (adminClient as any)
        .from('profiles')
        .update({
          organization_id: invitation.organization_id,
          role: invitation.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateProfileError) {
        return NextResponse.json(
          { error: updateProfileError.message },
          { status: 400 }
        );
      }
    } else if (profile.organization_id !== invitation.organization_id) {
      return NextResponse.json(
        { error: 'User already belongs to another organization' },
        { status: 403 }
      );
    }

    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('organization_id', invitation.organization_id)
      .single();

    if (!existingMember) {
      const { error: memberError } = await (adminClient as any)
        .from('team_members')
        .insert({
          user_id: user.id,
          organization_id: invitation.organization_id,
          role: invitation.role,
          joined_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        });

      if (memberError) {
        console.error('Error creating team member record:', memberError);
      }
    }

    const { error: updateInvitationError } = await (adminClient as any)
      .from('team_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    if (updateInvitationError) {
      return NextResponse.json(
        { error: updateInvitationError.message },
        { status: 400 }
      );
    }

    const { error: activityError } = await (adminClient as any)
      .from('activity_log')
      .insert({
        organization_id: invitation.organization_id,
        user_id: user.id,
        action: 'team_invitation_accepted',
        resource_type: 'team_invitation',
        resource_id: invitation.id,
        details: {
          user_email: user.email,
          role: invitation.role
        },
        created_at: new Date().toISOString()
      });

    if (activityError) {
      console.error('Error logging activity:', activityError);
    }

    return NextResponse.json({
      success: true,
      organization_id: invitation.organization_id,
      role: invitation.role
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
