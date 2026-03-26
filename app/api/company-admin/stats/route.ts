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
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', admin.organization_id),
      
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
    const licenseCounts: Record<string, number> = {};
    const licenseColors: Record<string, string> = {
      admin: '#ef4444',
      project_manager: '#f59e0b',
      contributor: '#3b82f6',
      guest_viewer: '#6b7280',
    };

    if (licenseBreakdown) {
      licenseBreakdown.forEach((user: { license_type: string | null }) => {
        const lt = user.license_type || 'contributor';
        licenseCounts[lt] = (licenseCounts[lt] || 0) + 1;
      });
    }

    // Convert to array format for frontend
    const licenseDistribution = Object.entries(licenseCounts).map(([name, count]) => ({
      name: name.replace(/_/g, ' '),
      count,
      color: licenseColors[name] || '#9ca3af',
    }));

    // Format recent activity
    const formattedActivity = (recentActivity || []).map((activity: {
      id: string;
      profiles: { full_name: string | null; email: string } | null;
      action: string;
      resource_type: string | null;
      resource_name: string | null;
      created_at: string | null;
    }) => ({
      id: activity.id,
      timestamp: activity.created_at,
      user: activity.profiles?.full_name || activity.profiles?.email || 'Unknown',
      action: activity.action,
    }));

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalProjects: totalProjects || 0,
      storageUsed: organization?.storage_used_bytes || 0,
      storageTotal: organization?.storage_limit_bytes || 10737418240,
      licenseDistribution,
      recentActivity: formattedActivity,
    });
  } catch (err) {
    console.error('Error fetching company admin stats:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
