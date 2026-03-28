import { NextResponse, NextRequest } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';

export async function GET(request: NextRequest) {
  try {
    const { error, serviceClient } = await verifyAdmin();
    if (error) {
      return NextResponse.json({ data: null, error }, { status: 401 });
    }

    if (!serviceClient) {
      return NextResponse.json(
        { data: null, error: 'Service client not initialized' },
        { status: 500 }
      );
    }

    const search = request.nextUrl.searchParams.get('search');

    let query = serviceClient
      .from('profiles')
      .select(
        `
        id,
        full_name,
        email,
        created_at,
        updated_at,
        is_super_admin,
        organization_members(organization_id),
        organizations!organization_members(id, name)
      `
      )
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data: users, error: queryError } = await query;

    if (queryError) {
      return NextResponse.json(
        { data: null, error: queryError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: users || [],
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { data: null, error: message },
      { status: 500 }
    );
  }
}
