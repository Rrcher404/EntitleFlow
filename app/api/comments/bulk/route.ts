import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/comments/bulk
 * Performs bulk operations on multiple comments
 * Body: { comment_ids: string[], action: 'resolve' | 'assign' | 'unresolve', assigned_to?: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
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

    const requestBody = await request.json();
    const { comment_ids, action, assigned_to } = requestBody;

    if (!comment_ids || !Array.isArray(comment_ids) || comment_ids.length === 0) {
      return NextResponse.json({ error: 'comment_ids array is required' }, { status: 400 });
    }

    if (!action || !['resolve', 'assign', 'unresolve'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be one of: resolve, assign, unresolve' },
        { status: 400 },
      );
    }

    if (action === 'assign' && !assigned_to) {
      return NextResponse.json({ error: 'assigned_to is required for assign action' }, { status: 400 });
    }

    // Fetch all comments to verify ownership and get permit_ids
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id, organization_id, permit_id, author_id, is_resolved')
      .in('id', comment_ids);

    if (commentsError || !comments) {
      console.error('Error fetching comments:', commentsError);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    // Verify all comments belong to user's organization
    const invalidComments = comments.filter(c => c.organization_id !== profile.organization_id);
    if (invalidComments.length > 0) {
      return NextResponse.json(
        { error: 'Some comments do not belong to your organization' },
        { status: 403 },
      );
    }

    // If assigning, verify the assigned_to user exists and is in the same org
    if (action === 'assign') {
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
    }

    const adminClient = getSupabaseAdminClient();

    if (!adminClient) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
    }

    const updatedIds: string[] = [];
    const failedIds: string[] = [];

    // Process each comment based on action
    for (const comment of comments) {
      try {
        if (action === 'resolve') {
          await adminClient!
            .from('comments')
            .update({
              is_resolved: true,
              resolved_by: user.id,
              resolved_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', comment.id);

          updatedIds.push(comment.id);

          // Log activity
          try {
            await adminClient!
              .from('activity_log')
              .insert({
                organization_id: profile.organization_id,
                permit_id: comment.permit_id,
                actor_id: user.id,
                action: 'comment_resolved',
                description: `Comment resolved by ${profile.full_name || 'Unknown'} (bulk action)`,
                metadata: {
                  comment_id: comment.id,
                  bulk_operation: true,
                },
              });
          } catch (logError) {
            console.error('Failed to log activity:', logError);
          }
        } else if (action === 'unresolve') {
          await adminClient!
            .from('comments')
            .update({
              is_resolved: false,
              resolved_by: null,
              resolved_at: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', comment.id);

          updatedIds.push(comment.id);

          // Log activity
          try {
            await adminClient!
              .from('activity_log')
              .insert({
                organization_id: profile.organization_id,
                permit_id: comment.permit_id,
                actor_id: user.id,
                action: 'comment_resolved',
                description: `Comment unresolved by ${profile.full_name || 'Unknown'} (bulk action)`,
                metadata: {
                  comment_id: comment.id,
                  bulk_operation: true,
                },
              });
          } catch (logError) {
            console.error('Failed to log activity:', logError);
          }
        } else if (action === 'assign') {
          await adminClient!
            .from('comments')
            .update({
              updated_at: new Date().toISOString(),
            })
            .eq('id', comment.id);

          updatedIds.push(comment.id);

          // Log activity
          try {
            await adminClient!
              .from('activity_log')
              .insert({
                organization_id: profile.organization_id,
                permit_id: comment.permit_id,
                actor_id: user.id,
                action: 'comment_assigned',
                description: `Comment assigned by ${profile.full_name || 'Unknown'} (bulk action)`,
                metadata: {
                  comment_id: comment.id,
                  assigned_to,
                  bulk_operation: true,
                },
              });
          } catch (logError) {
            console.error('Failed to log activity:', logError);
          }
        }
      } catch (error) {
        console.error(`Failed to update comment ${comment.id}:`, error);
        failedIds.push(comment.id);
      }
    }

    return NextResponse.json({
      updated: updatedIds.length,
      failed: failedIds,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/comments/bulk:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
