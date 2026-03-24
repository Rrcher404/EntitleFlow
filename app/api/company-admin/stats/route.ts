/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { NextResponse } from 'next/server';
import { verifyCompanyAdmin } from '@/lib/admin/company-auth';

export async function GET() {
  try {
    const { error, admin, serviceClient } = await verifyCompanyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    // Fetch all necessary data
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: totalProjects },
      { count: totalPermits },
      { data: organization },
      { data: licenseBreakdown },
      { data: recentActivity },
    ] = await Promise.all([
      serviceClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', admin.organization_id),
      
      serviceClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', admin.organization_id)
        .eq('is_active', true),
      
      serviceClient
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', admin.organization_id),
      
      serviceClient
        .from('permits')
        .select('*', { count: 'exact', head: true }),
      
      serviceClient
        .from('organizations')
        .select('storage_used_bytes, storage_limit_bytes')
        .eq('id', admin.organization_id)
        .single(),
      
      serviceClient
        .from('profiles')
        .select('license_type')
        .eq('organization_id', admin.organization_id),
      
      serviceClient
        .from('user_activity_tracking')
        .select('id, profile_id, action, resource_type, resource_name, created_at, profiles(full_name, email)')
        .eq('organization_id', admin.organization_id)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    // Calculate license breakdown
    const licenseCounts: Record<string, number> = {
      admin: 0,
      project_manager: 0,
      contributor: 0,
      guest_viewer: 0,
    };

    if (licenseBreakdown) {
      licenseBreakdown.forEach((user: any) => {
        const lt = user.license_type || 'contributor';
        licenseCounts[lt] = (licenseCounts[lt] || 0) + 1;
      });
    }

    // Format recent activity
    const formattedActivity = (recentActivity || []).map((activity: any) => ({
      id: activity.id,
      user_name: activity.profiles?.full_name,
      user_email: activity.profiles?.email,
      action: activity.action,
      resource_type: activity.resource_type,
      resource_name: activity.resource_name,
      created_at: activity.created_at,
    }));

    return NextResponse.json({
      total_users: totalUsers || 0,
      active_users: activeUsers || 0,
      total_projects: totalProjects || 0,
      total_permits: totalPermits || 0,
      storage_used_bytes: organization?.storage_used_bytes || 0,
      storage_limit_bytes: organization?.storage_limit_bytes || 10737418240,
      license_breakdown: licenseCounts,
      recent_activity: formattedActivity,
    });
  } catch (err) {
    console.error('Error fetching company admin stats:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
