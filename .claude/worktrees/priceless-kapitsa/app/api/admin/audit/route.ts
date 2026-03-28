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

    const { data: auditLog, error: queryError } = await serviceClient
      .from('admin_audit_log')
      .select(
        `
        id,
        admin_id,
        action,
        target_type,
        target_id,
        details,
        created_at,
        profiles!admin_audit_log_admin_id_fkey(full_name, email)
      `
      )
      .order('created_at', { ascending: false })
      .limit(50);

    if (queryError) {
      return NextResponse.json(
        { data: null, error: queryError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: auditLog || [],
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
