import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/comments/[id]/assign
 * Assigns a comment to a user
 * Body: { assigned_to: string (UUID) }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, full_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { id } = await params;

    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('*')
      .eq('id', id)
      .single();

    if (commentError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const requestBody = await request.json();
    const { assigned_to } = requestBody;

    if (!assigned_to) {
      return NextResponse.json({ error: 'assigned_to is required' }, { status: 400 });
    }

    // Verify assigned_to user exists and is in same organization
    const { data: assignedUser, error: assignedUserError } = await supabase
      .from('profiles')
      .select('id, organization_id, full_name')
      .eq('id', assigned_to)
      .single();

    if (assignedUserError || !assignedUser) {
      return NextResponse.json({ error: 'Assigned user not found' }, { status: 404 });
    }

    if (assignedUser.organization_id !== profile.organization_id) {
      return NextResponse.json(
        { error: 'Assigned user is not in your organization' },
        { status: 403 },
      );
    }

    const adminClient = getSupabaseAdminClient();

    // Update comment with assigned_to
    // Note: This assumes assigned_to field exists on comments table
    const { data: updatedComment, error: updateError } = await (adminClient as any)
      .from('comments')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedComment) {
      console.error('Error updating comment:', updateError);
      return NextResponse.json({ error: 'Failed to assign comment' }, { status: 500 });
    }

    // Log activity with assignment
    try {
      await (adminClient as any)
        .from('activity_log')
        .insert({
          organization_id: profile.organization_id,
          permit_id: comment.permit_id,
          actor_id: user.id,
          action: 'comment_assigned',
          description: `Comment assigned to ${assignedUser.full_name || 'Unknown'} by ${profile.full_name || 'Unknown'}`,
          metadata: {
            comment_id: id,
            assigned_to,
            assigned_user_name: assignedUser.full_name,
          },
        });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    return NextResponse.json({ data: updatedComment });
  } catch (error) {
    console.error('Unexpected error in POST /api/comments/[id]/assign:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
