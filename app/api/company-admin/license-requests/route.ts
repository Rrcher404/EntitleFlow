import { NextRequest, NextResponse } from 'next/server';
import { verifyCompanyAdmin } from '@/lib/admin/company-auth';
import type { Database } from '@/lib/database.types';

export async function GET(request: NextRequest) {
  try {
    const { error, admin, serviceClient } = await verifyCompanyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    // Get status filter from query params
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');

    let query = serviceClient
      .from('license_change_requests' as any)
      .select(`
        id,
        organization_id,
        requested_by,
        target_user_id,
        current_license_type,
        requested_license_type,
        status,
        reviewed_by,
        reviewed_at,
        review_notes,
        billing_term,
        invoice_reference,
        requires_prepayment,
        payment_received,
        applied_at,
        request_notes,
        created_at,
        updated_at,
        target_user:profiles!target_user_id (id, full_name, email)
      `)
      .eq('organization_id', admin.organization_id);

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data: requests, error: queryError } = await query.order('created_at', {
      ascending: false,
    });

    if (queryError) {
      return NextResponse.json(
        { error: queryError.message },
        { status: 400 }
      );
    }

    // Format response with joined data
    const formattedRequests = (requests || []).map((req: any) => ({
      id: req.id,
      organization_id: req.organization_id,
      requested_by: req.requested_by,
      target_user_id: req.target_user_id,
      target_user_name: req.target_user?.full_name,
      target_user_email: req.target_user?.email,
      current_license_type: req.current_license_type,
      requested_license_type: req.requested_license_type,
      status: req.status,
      reviewed_by: req.reviewed_by,
      reviewed_at: req.reviewed_at,
      review_notes: req.review_notes,
      billing_term: req.billing_term,
      invoice_reference: req.invoice_reference,
      requires_prepayment: req.requires_prepayment,
      payment_received: req.payment_received,
      applied_at: req.applied_at,
      request_notes: req.request_notes,
      created_at: req.created_at,
      updated_at: req.updated_at,
    }));

    return NextResponse.json({
      count: formattedRequests.length,
      data: formattedRequests,
    });
  } catch (err) {
    console.error('Error fetching organization license requests:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { error, admin, serviceClient } = await verifyCompanyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    const body = await request.json();
    const { request_id } = body;

    if (!request_id) {
      return NextResponse.json(
        { error: 'Missing required field: request_id' },
        { status: 400 }
      );
    }

    // Fetch the change request to verify it belongs to this organization and is pending
    const { data: changeRequest, error: fetchError } = await (serviceClient
      .from('license_change_requests' as any)
      .select('*')
      .eq('id', request_id)
      .eq('organization_id', admin.organization_id)
      .single() as any) as { data: any; error: any };

    if (fetchError || !changeRequest) {
      return NextResponse.json(
        { error: 'License change request not found in your organization' },
        { status: 404 }
      );
    }

    // Can only cancel pending requests
    if (changeRequest.status !== 'pending') {
      return NextResponse.json(
        {
          error: `Cannot cancel a request with status "${changeRequest.status}". Only pending requests can be cancelled.`,
        },
        { status: 400 }
      );
    }

    // Update request status to 'cancelled'
    const { data: cancelledRequest, error: updateError } = await serviceClient
      .from('license_change_requests' as any)
      .update({
        status: 'cancelled',
      })
      .eq('id', request_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    // Log the cancellation to activity_log
    const { data: targetUser } = await serviceClient
      .from('profiles')
      .select('full_name')
      .eq('id', changeRequest.target_user_id)
      .single();

    await serviceClient.from('activity_log').insert({
      organization_id: admin.organization_id,
      action: 'status_changed' as any,
      description: `License change request cancelled for ${targetUser?.full_name || 'Unknown'} (${changeRequest.current_license_type} → ${changeRequest.requested_license_type})`,
      metadata: {
        type: 'license_change_cancelled',
        request_id,
        target_user_id: changeRequest.target_user_id,
        original_license_type: changeRequest.current_license_type,
        requested_license_type: changeRequest.requested_license_type,
      },
    } as any);

    return NextResponse.json(cancelledRequest);
  } catch (err) {
    console.error('Error cancelling license change request:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
