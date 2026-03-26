import { NextResponse, NextRequest } from 'next/server';
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

    const { data: flags, error: queryError } = await serviceClient
      .from('feature_flags')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      return NextResponse.json(
        { data: null, error: queryError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(flags || []);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { data: null, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { error, admin, serviceClient } = await verifyAdmin();
    if (error) {
      return NextResponse.json({ data: null, error }, { status: 401 });
    }

    if (!serviceClient || !admin) {
      return NextResponse.json(
        { data: null, error: 'Service client not initialized' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { id, enabled } = body;

    if (!id || enabled === undefined) {
      return NextResponse.json(
        { data: null, error: 'Missing required fields: id, enabled' },
        { status: 400 }
      );
    }

    // Update flag
    const { data: updatedFlag, error: updateError } = await serviceClient
      .from('feature_flags')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { data: null, error: updateError.message },
        { status: 400 }
      );
    }

    // Log to admin audit log
    await serviceClient.from('admin_audit_log').insert({
      admin_id: admin.id,
      action: 'toggle_feature_flag',
      target_type: 'feature_flags',
      target_id: id,
      details: { enabled },
    });

    return NextResponse.json({
      data: updatedFlag,
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
