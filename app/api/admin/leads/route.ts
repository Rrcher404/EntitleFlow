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

    const status = request.nextUrl.searchParams.get('status');
    const intent = request.nextUrl.searchParams.get('intent');

    let query = serviceClient
      .from('marketing_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (intent) {
      query = query.eq('intent', intent);
    }

    const { data: leads, error: queryError } = await query;

    if (queryError) {
      return NextResponse.json(
        { data: null, error: queryError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(leads || []);
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
    const { id, status, note } = body;

    if (!id || !status) {
      return NextResponse.json(
        { data: null, error: 'Missing required fields: id, status' },
        { status: 400 }
      );
    }

    // Update lead status
    const { data: updatedLead, error: updateError } = await serviceClient
      .from('marketing_leads')
      .update({ status, note, updated_at: new Date().toISOString() })
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
      action: 'update_lead_status',
      target_type: 'marketing_leads',
      target_id: id,
      details: { status, note },
    });

    return NextResponse.json({
      data: updatedLead,
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
