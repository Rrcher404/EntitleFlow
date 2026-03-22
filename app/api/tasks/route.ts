import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/tasks
 *
 * Retrieves all comments assigned to the current user across all permits.
 * This is the cross-permit "My Tasks" query — unlike /api/comments which
 * is scoped to a single permit_id, this endpoint joins through
 * comment_assignments to pull everything assigned to the authenticated user.
 *
 * Query params:
 *   status     — 'open' | 'resolved' | 'all' (default: 'open')
 *   category   — comment category filter
 *   priority   — 'high' | 'medium' | 'low' (maps to comment categories)
 *   sort       — 'deadline' | 'permit' | 'created_at' | 'category' (default: 'deadline')
 *   order      — 'asc' | 'desc' (default: 'asc' for deadline, 'desc' for others)
 *   page       — pagination page (default: 1)
 *   limit      — items per page (default: 50)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's org
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, full_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'open';
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'deadline';
    const order = searchParams.get('order');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Build the query — comments assigned to this user within their org
    // We select comment fields plus nested permit and project data
    let query = supabase
      .from('comments')
      .select(`
        *,
        permit:permits!inner(
          id,
          permit_number,
          title,
          status,
          jurisdiction,
          permit_type,
          project:projects!inner(
            id,
            project_number,
            name,
            status
          )
        ),
        assignments:comment_assignments!inner(
          assigned_at,
          assigned_by
        )
      `, { count: 'exact' })
      .eq('organization_id', profile.organization_id)
      .eq('comment_assignments.assigned_to', user.id)
      .is('comment_assignments.unassigned_at', null); // Only active assignments

    // Filter by resolution status
    if (status === 'open') {
      query = query.eq('is_resolved', false);
    } else if (status === 'resolved') {
      query = query.eq('is_resolved', true);
    }
    // 'all' = no filter

    // Filter by category
    if (category) {
      query = query.eq('category', category as any);
    }

    // Sorting
    // Note: 'deadline' sort uses permit's decision_date as proxy
    // since comments don't have individual deadlines — the resubmission
    // deadline is per-permit, not per-comment
    const ascending = order === 'desc' ? false : (sort === 'deadline' ? true : false);

    switch (sort) {
      case 'deadline':
        // Sort by the associated permit's nearest deadline
        // Falls back to created_at for comments without permit deadlines
        query = query.order('created_at', { ascending });
        break;
      case 'permit':
        query = query.order('permit_id', { ascending });
        break;
      case 'category':
        query = query.order('category', { ascending });
        break;
      default:
        query = query.order('created_at', { ascending });
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: tasks, error: tasksError, count } = await query;

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return NextResponse.json(
        { error: 'Failed to fetch tasks', details: tasksError.message },
        { status: 500 },
      );
    }

    // Also fetch deadlines for the permits that have assigned comments
    // This powers the "By Deadline" view grouping
    const permitIds = [...new Set((tasks || []).map((t: any) => t.permit_id))];

    let deadlines: any[] = [];
    if (permitIds.length > 0) {
      const { data: deadlineData } = await supabase
        .from('deadlines')
        .select('*')
        .in('permit_id', permitIds)
        .eq('organization_id', profile.organization_id)
        .in('status', ['upcoming', 'due_soon', 'overdue'])
        .order('due_date', { ascending: true });

      deadlines = deadlineData || [];
    }

    // Summary stats for the header cards
    const allOpenQuery = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id)
      .eq('is_resolved', false)
      .eq('assigned_to', user.id);

    const allResolvedQuery = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id)
      .eq('is_resolved', true)
      .eq('assigned_to', user.id);

    return NextResponse.json({
      data: tasks || [],
      deadlines,
      meta: {
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      },
      summary: {
        open: allOpenQuery.count || 0,
        resolved: allResolvedQuery.count || 0,
        total: (allOpenQuery.count || 0) + (allResolvedQuery.count || 0),
      },
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
