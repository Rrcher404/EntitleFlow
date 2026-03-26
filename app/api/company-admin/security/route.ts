import { NextRequest, NextResponse } from 'next/server';
import { verifyCompanyAdmin } from '@/lib/admin/company-auth';

export async function GET(request: NextRequest) {
  try {
    const { error, admin, serviceClient } = await verifyCompanyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    // Get or create password reset config
    let { data: config, error: configError } = await serviceClient
      .from('password_reset_config')
      .select('*')
      .eq('organization_id', admin.organization_id)
      .single();

    // If not found, create default config
    if (configError && configError.code === 'PGRST116') {
      const { data: newConfig } = await serviceClient
        .from('password_reset_config')
        .insert({
          organization_id: admin.organization_id,
          reset_link_duration_hours: 24,
          min_password_length: 8,
          require_uppercase: true,
          require_number: true,
          require_special_char: false,
        })
        .select()
        .single();
      config = newConfig;
    } else if (configError) {
      return NextResponse.json(
        { error: configError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      resetLinkDuration: config?.reset_link_duration_hours || 24,
      forceResetSchedule: config?.force_reset_schedule_days || null,
      minPasswordLength: config?.min_password_length || 8,
      requireUppercase: config?.require_uppercase || true,
      requireNumber: config?.require_number || true,
      requireSpecialChar: config?.require_special_char || false,
    });
  } catch (err) {
    console.error('Error fetching security config:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { error, admin, serviceClient } = await verifyCompanyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    const body = await request.json();
    const {
      reset_link_duration_hours,
      force_reset_schedule_days,
      min_password_length,
      require_uppercase,
      require_number,
      require_special_char,
    } = body;

    // Get existing config
    let { data: config } = await serviceClient
      .from('password_reset_config')
      .select('id')
      .eq('organization_id', admin.organization_id)
      .single();

    // Create if not exists
    if (!config) {
      const { data: newConfig } = await serviceClient
        .from('password_reset_config')
        .insert({
          organization_id: admin.organization_id,
        })
        .select()
        .single();
      config = newConfig;
    }

    // Build update data
    const updateData: Record<string, any> = {};
    if (reset_link_duration_hours !== undefined) updateData.reset_link_duration_hours = reset_link_duration_hours;
    if (force_reset_schedule_days !== undefined) updateData.force_reset_schedule_days = force_reset_schedule_days;
    if (min_password_length !== undefined) updateData.min_password_length = min_password_length;
    if (require_uppercase !== undefined) updateData.require_uppercase = require_uppercase;
    if (require_number !== undefined) updateData.require_number = require_number;
    if (require_special_char !== undefined) updateData.require_special_char = require_special_char;

    const { data: updatedConfig, error: updateError } = await serviceClient
      .from('password_reset_config')
      .update(updateData)
      .eq('organization_id', admin.organization_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    // Log the action
    await serviceClient.from('admin_audit_log').insert({
      admin_id: admin.id,
      organization_id: admin.organization_id,
      action: 'security_config_updated',
      target_type: 'security_config',
      target_id: admin.organization_id,
      details: updateData,
    });

    // Log to activity tracking
    await serviceClient.from('user_activity_tracking').insert({
      profile_id: admin.id,
      organization_id: admin.organization_id,
      action: 'security_config_updated',
      resource_type: 'security_config',
      metadata: updateData,
    });

    return NextResponse.json({
      resetLinkDuration: updatedConfig?.reset_link_duration_hours || 24,
      forceResetSchedule: updatedConfig?.force_reset_schedule_days || null,
      minPasswordLength: updatedConfig?.min_password_length || 8,
      requireUppercase: updatedConfig?.require_uppercase || true,
      requireNumber: updatedConfig?.require_number || true,
      requireSpecialChar: updatedConfig?.require_special_char || false,
    });
  } catch (err) {
    console.error('Error updating security config:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
