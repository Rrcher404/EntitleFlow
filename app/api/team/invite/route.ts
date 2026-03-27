import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';
import { checkSeatAvailability } from '@/lib/team/seat-check';
import crypto from 'crypto';

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

    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('organization_id', callerProfile.organization_id)
      .eq('email', email)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'User already exists in organization' },
        { status: 409 }
      );
    }

    const { data: pendingInvitation } = await supabase
      .from('team_invitations')
      .select('id')
      .eq('organization_id', callerProfile.organization_id)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (pendingInvitation) {
      return NextResponse.json(
        { error: 'Pending invitation already exists for this email' },
        { status: 409 }
      );
    }

    // Check seat availability
    const seatCheck = await checkSeatAvailability(supabase, callerProfile.organization_id);
    if (!seatCheck.allowed) {
      const maxDisplay = seatCheck.max === -1 ? 'unlimited' : seatCheck.max;
      return NextResponse.json(
        {
          error: `Seat limit reached. Your plan allows ${maxDisplay} seats. Current: ${seatCheck.current} active + ${seatCheck.pending} pending invitations.`
        },
        { status: 403 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const adminClient = getSupabaseAdminClient();

    const { data: invitation, error: inviteError } = await (adminClient as any)
      .from('team_invitations')
      .insert({
        organization_id: callerProfile.organization_id,
        email,
        role,
        token,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (inviteError) {
      return NextResponse.json(
        { error: inviteError.message },
        { status: 400 }
      );
    }

    const { error: activityError } = await (adminClient as any)
      .from('activity_log')
      .insert({
        organization_id: callerProfile.organization_id,
        user_id: user.id,
        action: 'team_invitation_sent',
        resource_type: 'team_invitation',
        resource_id: invitation.id,
        details: {
          invited_email: email,
          invited_role: role
        },
        created_at: new Date().toISOString()
      });

    if (activityError) {
      console.error('Error logging activity:', activityError);
    }

    return NextResponse.json({
      success: true,
      invitation,
      token
    });
  } catch (error) {
    console.error('Error creating team invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
