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

    const { data: config, error: queryError } = await serviceClient
      .from('platform_config')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      return NextResponse.json(
        { data: null, error: queryError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: config || [],
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

export async function PUT(request: NextRequest) {
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
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { data: null, error: 'Missing required fields: key, value' },
        { status: 400 }
      );
    }

    // Upsert config value
    const { data: updatedConfig, error: upsertError } = await serviceClient
      .from('platform_config')
      .upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )
      .select()
      .single();

    if (upsertError) {
      return NextResponse.json(
        { data: null, error: upsertError.message },
        { status: 400 }
      );
    }

    // Log to admin audit log
    await serviceClient.from('admin_audit_log').insert({
      admin_id: admin.id,
      action: 'update_config',
      target_type: 'platform_config',
      target_id: key,
      details: { key, value },
    });

    return NextResponse.json({
      data: updatedConfig,
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
