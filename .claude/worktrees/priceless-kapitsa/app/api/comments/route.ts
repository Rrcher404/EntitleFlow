import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

type CommentInsert = Database['public']['Tables']['comments']['Insert'];
type Comment = Database['public']['Tables']['comments']['Row'];

/**
 * GET /api/comments
 * Retrieves comments for a specific permit with filtering and pagination
 * Query params: permit_id (required), category, is_resolved, assigned_to, page (default 1), limit (default 50), sort (default 'created_at'), order (default 'desc')
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Get user profile for organization_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 },
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const permitId = searchParams.get('permit_id');
    const category = searchParams.get('category');
    const isResolved = searchParams.get('is_resolved');
    const assignedTo = searchParams.get('assigned_to');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    // Validate required fields
    if (!permitId) {
      return NextResponse.json(
        { error: 'permit_id is required' },
        { status: 400 },
      );
    }

    // Verify permit belongs to user's organization
    const { data: permit, error: permitError } = await supabase
      .from('permits')
      .select('organization_id')
      .eq('id', permitId)
      .single();

    if (permitError || !permit || permit.organization_id !== profile.organization_id) {
      return NextResponse.json(
        { error: 'Permit not found or access denied' },
        { status: 404 },
      );
    }

    // Build query
    let query = supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('permit_id', permitId)
      .eq('organization_id', profile.organization_id)
      .is('parent_comment_id', null); // Only top-level comments

    // Apply filters
    if (category) {
      query = query.eq('category', category as any);
    }

    if (isResolved !== null && isResolved !== undefined) {
      query = query.eq('is_resolved', isResolved === 'true');
    }

    if (assignedTo) {
      // Note: You may need to add an 'assigned_to' column to comments table
      // For now, we'll comment this out
      // query = query.eq('assigned_to', assignedTo);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'updated_at', 'author_name', 'id'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const orderDir = order === 'asc' ? { ascending: true } : { ascending: false };

    query = query.order(sortField as any, orderDir);

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: comments, error: commentsError, count } = await query;

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 },
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: comments || [],
      meta: {
        total: count || 0,
        page,
        limit,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/comments
 * Creates a new comment on a permit
 * Body: { permit_id, body, category?, source?, parent_comment_id? }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Get user profile for organization_id and name
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, full_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { permit_id, body: commentBody, category, source, parent_comment_id } = body;

    // Validate required fields
    if (!permit_id || !commentBody) {
      return NextResponse.json(
        { error: 'permit_id and body are required' },
        { status: 400 },
      );
    }

    // Verify permit belongs to user's organization
    const { data: permit, error: permitError } = await supabase
      .from('permits')
      .select('organization_id')
      .eq('id', permit_id)
      .single();

    if (permitError || !permit || permit.organization_id !== profile.organization_id) {
      return NextResponse.json(
        { error: 'Permit not found or access denied' },
        { status: 404 },
      );
    }

    // Verify parent comment exists if provided
    if (parent_comment_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id, organization_id')
        .eq('id', parent_comment_id)
        .single();

      if (parentError || !parentComment || parentComment.organization_id !== profile.organization_id) {
        return NextResponse.json(
          { error: 'Parent comment not found or access denied' },
          { status: 404 },
        );
      }
    }

    // Use admin client for database writes
    const adminClient = getSupabaseAdminClient();

    // Prepare comment insert data
    const commentInsert: CommentInsert = {
      permit_id,
      body: commentBody,
      author_id: user.id,
      author_name: profile.full_name || 'Unknown',
      organization_id: profile.organization_id,
      category: category || null,
      source: source || null,
      parent_comment_id: parent_comment_id || null,
    };

    // Insert comment
    const { data: comment, error: insertError } = await (adminClient as any)
      .from('comments')
      .insert(commentInsert)
      .select()
      .single();

    if (insertError || !comment) {
      console.error('Error creating comment:', insertError);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 },
      );
    }

    // Log activity (non-fatal)
    try {
      await (adminClient as any)
        .from('activity_log')
        .insert({
          organization_id: profile.organization_id,
          permit_id,
          actor_id: user.id,
          action: 'comment_created',
          description: `Comment created by ${profile.full_name || 'Unknown'}`,
          metadata: {
            comment_id: comment.id,
            category,
          },
        });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    return NextResponse.json(
      { data: comment },
      { status: 201 },
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
