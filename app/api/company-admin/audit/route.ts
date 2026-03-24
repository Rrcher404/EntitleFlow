import { NextRequest, NextResponse } from 'next/server';
import { verifyCompanyAdmin } from '@/lib/admin/company-auth';

export async function GET(request: NextRequest) {
  try {
    const { error, admin, serviceClient } = await verifyCompanyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    // Get query params for filtering
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const per_page = parseInt(request.nextUrl.searchParams.get('per_page') || '50');
    const user_id = request.nextUrl.searchParams.get('user_id');
    const action = request.nextUrl.searchParams.get('action');
    const resource_type = request.nextUrl.searchParams.get('resource_type');
    const date_from = request.nextUrl.searchParams.get('date_from');
    const date_to = request.nextUrl.searchParams.get('date_to');

    const offset = (page - 1) * per_page;

    // Build query
    let query = serviceClient
      .from('admin_audit_log')
      .select('*', { count: 'exact' })
      .eq('organization_id', admin.organization_id);

    if (user_id) {
      query = query.eq('admin_id', user_id);
    }
    if (action) {
      query = query.eq('action', action);
    }
    if (resource_type) {
      query = query.eq('target_type', resource_type);
    }
    if (date_from) {
      query = query.gte('created_at', date_from);
    }
    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    const { data: logs, count, error: logsError } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1);

    if (logsError) {
      return NextResponse.json(
        { error: logsError.message },
        { status: 400 }
      );
    }

    const total_pages = Math.ceil((count || 0) / per_page);

    return NextResponse.json({
      data: logs || [],
      pagination: {
        total: count || 0,
        page,
        per_page,
        total_pages,
      },
    });
  } catch (err) {
    console.error('Error fetching audit log:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
