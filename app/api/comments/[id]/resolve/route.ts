import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/comments/[id]/resolve
 * Marks a comment as resolved
 * Body: { resolution_note?: string }
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
    const { resolution_note } = requestBody;

    const adminClient = getSupabaseAdminClient();

    // Prepare metadata with resolution note if provided
    const metadata = {
      ...(comment.metadata as any),
      resolution_note: resolution_note || null,
    };

    const { data: updatedComment, error: updateError } = await (adminClient as any)
      .from('comments')
      .update({
        is_resolved: true,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
        metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedComment) {
      console.error('Error resolving comment:', updateError);
      return NextResponse.json({ error: 'Failed to resolve comment' }, { status: 500 });
    }

    // Notify the assigner (if someone else assigned this comment to the resolver)
    // This closes the feedback loop: "The comment you assigned has been resolved"
    if (comment.assigned_to === user.id && comment.assigned_to !== null) {
      try {
        // Find who assigned this comment
        const { data: assignment } = await (adminClient as any)
          .from('comment_assignments')
          .select('assigned_by')
          .eq('comment_id', id)
          .is('unassigned_at', null)
          .single();

        if (assignment?.assigned_by && assignment.assigned_by !== user.id) {
          const { data: permit } = await supabase
            .from('permits')
            .select('permit_number, title')
            .eq('id', comment.permit_id)
            .single();

          const permitLabel = permit
            ? `${permit.permit_number} — ${permit.title}`
            : 'a permit';

          await (adminClient as any)
            .from('notifications')
            .insert({
              recipient_id: assignment.assigned_by,
              organization_id: profile.organization_id,
              type: 'comment_resolved',
              title: 'Comment resolved',
              body: `${profile.full_name || 'A team member'} resolved a ${comment.category || 'general'} comment on ${permitLabel}`,
              action_url: `/app/permits/${comment.permit_id}?comment=${id}`,
              metadata: {
                comment_id: id,
                permit_id: comment.permit_id,
                resolved_by: user.id,
                resolved_by_name: profile.full_name,
                category: comment.category,
              },
            });
        }
      } catch (notifError) {
        console.error('Failed to create resolution notification:', notifError);
      }
    }

    // Log activity
    try {
      await (adminClient as any)
        .from('activity_log')
        .insert({
          organization_id: profile.organization_id,
          permit_id: comment.permit_id,
          actor_id: user.id,
          action: 'comment_resolved',
          description: `Comment resolved by ${profile.full_name || 'Unknown'}`,
          metadata: {
            comment_id: id,
            resolution_note: resolution_note || null,
          },
        });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    return NextResponse.json({ data: updatedComment });
  } catch (error) {
    console.error('Unexpected error in POST /api/comments/[id]/resolve:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
