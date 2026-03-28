import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';

export async function GET() {
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

    // Get organizations with member count (profiles), project count, permit count
    const { data: orgs, error: queryError } = await serviceClient
      .from('organizations')
      .select(
        `
        id,
        name,
        slug,
        company_type,
        created_at,
        updated_at,
        profiles(id),
        projects(id),
        permits(id)
      `
      )
      .order('created_at', { ascending: false });

    if (queryError) {
      return NextResponse.json(
        { data: null, error: queryError.message },
        { status: 400 }
      );
    }

    // Transform data to include counts
    const enrichedOrgs = (orgs || []).map((org: Record<string, unknown>) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      company_type: org.company_type,
      created_at: org.created_at,
      updated_at: org.updated_at,
      member_count: (org.profiles as unknown[])?.length || 0,
      project_count: (org.projects as unknown[])?.length || 0,
      permit_count: (org.permits as unknown[])?.length || 0,
    }));

    return NextResponse.json(enrichedOrgs);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { data: null, error: message },
      { status: 500 }
    );
  }
}
