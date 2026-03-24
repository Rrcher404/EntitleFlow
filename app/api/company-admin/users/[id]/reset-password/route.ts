/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { verifyCompanyAdmin } from '@/lib/admin/company-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, admin, serviceClient } = await verifyCompanyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    const userId = params.id;

    // Verify user exists and belongs to organization
    const { data: user, error: userError } = await serviceClient
      .from('profiles')
      .select('email, full_name, organization_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.organization_id !== admin.organization_id) {
      return NextResponse.json(
        { error: 'User not in organization' },
        { status: 403 }
      );
    }

    // Generate password reset link using Supabase admin API
    try {
      const { data: link, error: linkError } = await serviceClient.auth.admin.generateLink({
        type: 'recovery',
        email: user.email,
      });

      if (linkError) {
        throw new Error(`Failed to generate reset link: ${linkError.message}`);
      }

      // Log the action
      await serviceClient.from('admin_audit_log').insert({
        admin_id: admin.id,
        organization_id: admin.organization_id,
        action: 'password_reset_initiated',
        target_type: 'user',
        target_id: userId,
        details: { user_email: user.email },
      });

      // Log to activity tracking
      await serviceClient.from('user_activity_tracking').insert({
        profile_id: admin.id,
        organization_id: admin.organization_id,
        action: 'password_reset_requested_by_admin',
        resource_type: 'user',
        resource_id: userId,
        resource_name: user.full_name,
        metadata: { email: user.email },
      });

      return NextResponse.json({
        success: true,
        message: `Password reset link sent to ${user.email}`,
        reset_link: link?.properties?.action_link || undefined,
      });
    } catch (authErr) {
      console.error('Error generating reset link:', authErr);
      return NextResponse.json(
        { error: 'Failed to generate password reset link' },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('Error resetting password:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
