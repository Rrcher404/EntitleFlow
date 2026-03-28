import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';

export async function GET(request: NextRequest) {
  try {
    const { error, admin, serviceClient } = await verifyAdmin();

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
      .from('license_change_requests')
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
        organizations!inner (id, name),
        requested_by_profile:profiles!requested_by (id, full_name, email),
        target_user:profiles!target_user_id (id, full_name, email)
      `);

    if (statusFilter) {
      query = query.eq('status', statusFilter as "cancelled" | "pending" | "approved" | "applied" | "rejected");
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
    const formattedRequests = (requests || []).map((req: Record<string, unknown>) => ({
      id: req.id,
      organization_id: req.organization_id,
      organization_name: (req.organizations as { name: string })?.name,
      requested_by_id: req.requested_by,
      requested_by_name: (req.requested_by_profile as { full_name: string })?.full_name,
      requested_by_email: (req.requested_by_profile as { email: string })?.email,
      target_user_id: req.target_user_id,
      target_user_name: (req.target_user as { full_name: string })?.full_name,
      target_user_email: (req.target_user as { email: string })?.email,
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
    console.error('Error fetching license requests:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { error, admin, serviceClient } = await verifyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    const body = await request.json();
    const { request_id, action, review_notes, invoice_reference } = body;

    if (!request_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: request_id, action' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Fetch the change request
    const { data: changeRequest, error: fetchError } = await serviceClient
      .from('license_change_requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (fetchError || !changeRequest) {
      return NextResponse.json(
        { error: 'License change request not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Update request status to 'approved'
      const { data: updatedRequest, error: updateError } = await serviceClient
        .from('license_change_requests')
        .update({
          status: 'approved',
          reviewed_by: admin.id,
          reviewed_at: new Date().toISOString(),
          review_notes,
          invoice_reference,
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

      // If request does NOT require prepayment, apply the license change immediately
      if (!changeRequest.requires_prepayment) {
        const { error: profileError } = await serviceClient
          .from('profiles')
          .update({
            license_type: changeRequest.requested_license_type,
          })
          .eq('id', changeRequest.target_user_id);

        if (profileError) {
          console.error('Error updating profile license type:', profileError);
          return NextResponse.json(
            { error: 'Failed to apply license change' },
            { status: 400 }
          );
        }

        // Update request status to 'applied' with applied_at timestamp
        const { error: applyError } = await serviceClient
          .from('license_change_requests')
          .update({
            status: 'applied',
            applied_at: new Date().toISOString(),
          })
          .eq('id', request_id);

        if (applyError) {
          console.error('Error marking request as applied:', applyError);
        }
      }

      // Log to admin_audit_log
      await serviceClient.from('admin_audit_log').insert({
        admin_id: admin.id,
        action: 'license_change_approved',
        target_type: 'license_change_request',
        target_id: request_id,
        details: {
          request_id,
          organization_id: changeRequest.organization_id,
          target_user_id: changeRequest.target_user_id,
          new_license_type: changeRequest.requested_license_type,
          requires_prepayment: changeRequest.requires_prepayment,
          review_notes,
          invoice_reference,
        },
      });

      return NextResponse.json(updatedRequest);
    }

    if (action === 'reject') {
      // Update request status to 'rejected'
      const { data: rejectedRequest, error: rejectError } = await serviceClient
        .from('license_change_requests')
        .update({
          status: 'rejected',
          reviewed_by: admin.id,
          reviewed_at: new Date().toISOString(),
          review_notes,
        })
        .eq('id', request_id)
        .select()
        .single();

      if (rejectError) {
        return NextResponse.json(
          { error: rejectError.message },
          { status: 400 }
        );
      }

      // Log to admin_audit_log
      await serviceClient.from('admin_audit_log').insert({
        admin_id: admin.id,
        action: 'license_change_rejected',
        target_type: 'license_change_request',
        target_id: request_id,
        details: {
          request_id,
          organization_id: changeRequest.organization_id,
          target_user_id: changeRequest.target_user_id,
          requested_license_type: changeRequest.requested_license_type,
          review_notes,
        },
      });

      return NextResponse.json(rejectedRequest);
    }
  } catch (err) {
    console.error('Error processing license change request:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
