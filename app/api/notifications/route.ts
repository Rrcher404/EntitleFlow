import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unread = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('recipient_id', user.id);

    if (unread) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const { data: unreadCount } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('recipient_id', user.id)
      .eq('is_read', false);

    return NextResponse.json({
      data: notifications || [],
      unread_count: unreadCount?.[0] ? unreadCount.length : 0,
      meta: {
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const { notification_ids, mark_all_read } = body;

    const adminClient = getSupabaseAdminClient();
    let updatedCount = 0;

    if (mark_all_read) {
      const { count, error } = await adminClient!
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      updatedCount = count || 0;
    } else if (notification_ids && Array.isArray(notification_ids) && notification_ids.length > 0) {
      const { count, error } = await adminClient!
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('recipient_id', user.id)
        .in('id', notification_ids);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      updatedCount = count || 0;
    } else {
      return NextResponse.json(
        { error: 'Either notification_ids array or mark_all_read flag is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
