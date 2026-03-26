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

    const { data: announcements, error: queryError } = await serviceClient
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      return NextResponse.json(
        { data: null, error: queryError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(announcements || []);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { data: null, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { title, body: bodyText, type, starts_at, ends_at } = body;

    if (!title || !bodyText || !type) {
      return NextResponse.json(
        { data: null, error: 'Missing required fields: title, body, type' },
        { status: 400 }
      );
    }

    // Create announcement
    const { data: newAnnouncement, error: createError } = await serviceClient
      .from('announcements')
      .insert({
        title,
        body: bodyText,
        type,
        starts_at: starts_at || new Date().toISOString(),
        ends_at,
        active: true,
        created_by: admin.id,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { data: null, error: createError.message },
        { status: 400 }
      );
    }

    // Log to admin audit log
    await serviceClient.from('admin_audit_log').insert({
      admin_id: admin.id,
      action: 'create_announcement',
      target_type: 'announcements',
      target_id: newAnnouncement.id,
      details: { title, type, starts_at, ends_at },
    });

    return NextResponse.json({
      data: newAnnouncement,
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
    const { id, active, title, body: bodyText } = body;

    if (!id) {
      return NextResponse.json(
        { data: null, error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = { updated_at: new Date().toISOString() };
    if (active !== undefined) updateData.active = active;
    if (title !== undefined) updateData.title = title;
    if (bodyText !== undefined) updateData.body = bodyText;

    // Update announcement
    const { data: updatedAnnouncement, error: updateError } = await serviceClient
      .from('announcements')
      .update(updateData)
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
      action: 'update_announcement',
      target_type: 'announcements',
      target_id: id,
      details: updateData,
    });

    return NextResponse.json({
      data: updatedAnnouncement,
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
