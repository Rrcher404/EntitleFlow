import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

type CommentUpdate = Database['public']['Tables']['comments']['Update'];

/**
 * GET /api/comments/[id]
 * Retrieves a specific comment with its replies
 */
export async function GET(
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
      .select('organization_id')
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

    const { data: replies, error: repliesError } = await supabase
      .from('comments')
      .select('*')
      .eq('parent_comment_id', id)
      .order('created_at', { ascending: true });

    if (repliesError) {
      console.error('Error fetching replies:', repliesError);
      return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        ...comment,
        replies: replies || [],
      },
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/comments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/comments/[id]
 * Updates a comment
 * Body: { body?, category?, is_resolved?, assigned_to? }
 */
export async function PATCH(
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

    const updateBody = await request.json();
    const { body: commentBody, category, is_resolved, assigned_to } = updateBody;

    const adminClient = getSupabaseAdminClient();
    const updateData: CommentUpdate = {};

    if (commentBody !== undefined) {
      updateData.body = commentBody;
    }

    if (category !== undefined) {
      updateData.category = category;
    }

    if (is_resolved !== undefined) {
      updateData.is_resolved = is_resolved;

      if (is_resolved === true) {
        updateData.resolved_by = user.id;
        updateData.resolved_at = new Date().toISOString();
      } else {
        updateData.resolved_by = null;
        updateData.resolved_at = null;
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data: updatedComment, error: updateError } = await (adminClient as any)
      .from('comments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedComment) {
      console.error('Error updating comment:', updateError);
      return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
    }

    if (assigned_to !== undefined) {
      try {
        const { data: assignedUser, error: assignedUserError } = await supabase
          .from('profiles')
          .select('id, organization_id')
          .eq('id', assigned_to)
          .single();

        if (!assignedUserError && assignedUser && assignedUser.organization_id === profile.organization_id) {
          await (adminClient as any)
            .from('activity_log')
            .insert({
              organization_id: profile.organization_id,
              permit_id: comment.permit_id,
              actor_id: user.id,
              action: 'comment_assigned',
              description: `Comment assigned to ${assignedUser.id}`,
              metadata: {
                comment_id: id,
                assigned_to,
              },
            });
        }
      } catch (assignError) {
        console.error('Failed to handle comment assignment:', assignError);
      }
    }

    try {
      await (adminClient as any)
        .from('activity_log')
        .insert({
          organization_id: profile.organization_id,
          permit_id: comment.permit_id,
          actor_id: user.id,
          action: 'comment_updated',
          description: `Comment updated by ${profile.full_name || 'Unknown'}`,
          metadata: {
            comment_id: id,
            updated_fields: Object.keys(updateData),
          },
        });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    return NextResponse.json({ data: updatedComment });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/comments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/comments/[id]
 * Deletes a comment (only author or admin can delete)
 */
export async function DELETE(
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
      .select('organization_id, role')
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

    const isAuthor = comment.author_id === user.id;
    const isAdmin = profile.role === 'admin' || profile.role === 'owner';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Only the comment author or admin can delete this comment' },
        { status: 403 },
      );
    }

    const adminClient = getSupabaseAdminClient();

    const { error: deleteError } = await (adminClient as any)
      .from('comments')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }

    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      await (adminClient as any)
        .from('activity_log')
        .insert({
          organization_id: profile.organization_id,
          permit_id: comment.permit_id,
          actor_id: user.id,
          action: 'comment_deleted',
          description: `Comment deleted by ${userProfile?.full_name || 'Unknown'}`,
          metadata: {
            comment_id: id,
          },
        });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/comments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
