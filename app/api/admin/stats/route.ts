import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';

export async function GET() {
  try {
    const { error, serviceClient } = await verifyAdmin();
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    if (!serviceClient) {
      return NextResponse.json(
        { error: 'Service client not initialized' },
        { status: 500 }
      );
    }

    // Fetch statistics using service client (bypasses RLS)
    const [
      { count: totalUsers },
      { count: totalOrganizations },
      { count: totalPermits },
      { count: marketingLeads },
      { data: activityLogs },
      { data: recentSignups },
    ] = await Promise.all([
      serviceClient.from('profiles').select('*', { count: 'exact', head: true }),
      serviceClient.from('organizations').select('*', { count: 'exact', head: true }),
      serviceClient.from('permits').select('*', { count: 'exact', head: true }),
      serviceClient.from('marketing_leads').select('*', { count: 'exact', head: true }),
      serviceClient
        .from('activity_log')
        .select('id, actor_id, action, description, created_at, profiles!activity_log_actor_id_fkey(email)')
        .order('created_at', { ascending: false })
        .limit(10),
      serviceClient
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    // Get count of active projects
    const { count: activeProjects } = await serviceClient
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Format activity logs with user emails
    const formattedActivityLogs = (activityLogs || []).map((log: any) => ({
      id: log.id,
      actor_id: log.actor_id,
      action: log.action,
      description: log.description,
      created_at: log.created_at,
      user_email: log.profiles?.email,
    }));

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalOrganizations: totalOrganizations || 0,
        activeProjects: activeProjects || 0,
        totalPermits: totalPermits || 0,
        marketingLeads: marketingLeads || 0,
      },
      activityLogs: formattedActivityLogs,
      recentSignups: recentSignups || [],
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
