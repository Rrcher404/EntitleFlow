'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];
type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
type Deadline = Database['public']['Tables']['deadlines']['Row'];

interface KPIData {
  projects: number;
  permits: number;
  pendingReviews: number;
  documents: number;
}

export default function AppDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [kpis, setKpis] = useState<KPIData>({ projects: 0, permits: 0, pendingReviews: 0, documents: 0 });
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('Could not fetch user');

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        if (profileData) {
          const orgId = profileData.organization_id;

          // Fetch organization
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', orgId)
            .single();

          if (!orgError) setOrganization(orgData);

          // Fetch KPI data in parallel
          const [projectsRes, permitsRes, documentsRes] = await Promise.all([
            supabase
              .from('projects')
              .select('id', { count: 'exact', head: true })
              .eq('organization_id', orgId),
            supabase
              .from('permits')
              .select('id', { count: 'exact', head: true })
              .eq('organization_id', orgId),
            supabase
              .from('documents')
              .select('id', { count: 'exact', head: true })
              .eq('organization_id', orgId),
          ]);

          // Fetch permits under review for pending reviews count
          const { count: reviewCount } = await supabase
            .from('permits')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('status', 'under_review');

          setKpis({
            projects: projectsRes.count || 0,
            permits: permitsRes.count || 0,
            pendingReviews: reviewCount || 0,
            documents: documentsRes.count || 0,
          });

          // Fetch recent activity (last 10)
          const { data: activityData, error: activityError } = await supabase
            .from('activity_log')
            .select('*')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false })
            .limit(10);

          if (!activityError) setRecentActivity(activityData || []);

          // Fetch upcoming deadlines (next 5 by due_date)
          const { data: deadlineData, error: deadlineError } = await supabase
            .from('deadlines')
            .select('*')
            .eq('organization_id', orgId)
            .order('due_date', { ascending: true })
            .limit(5);

          if (!deadlineError) setUpcomingDeadlines(deadlineData || []);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [supabase]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatActivityAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back. Here's your approval operations overview.</p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's your approval operations overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Projects', value: kpis.projects },
          { label: 'Permits', value: kpis.permits },
          { label: 'Pending Reviews', value: kpis.pendingReviews },
          { label: 'Documents', value: kpis.documents },
        ].map((kpi, idx) => (
          <Card
            key={idx}
            className="p-6"
            style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
          >
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <p className="text-3xl font-semibold tracking-tight" style={{ color: '#1B3B2D' }}>
                {kpi.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity Section */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Recent Activity</h2>
            <p className="text-sm text-muted-foreground">Latest actions in your organization.</p>
          </div>

          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start justify-between border-b border-gray-200 pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {formatActivityAction(activity.action)}
                    </p>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {formatDate(activity.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          )}
        </div>
      </Card>

      {/* Upcoming Deadlines Section */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Upcoming Deadlines</h2>
            <p className="text-sm text-muted-foreground">Next deadlines coming up.</p>
          </div>

          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-start justify-between border-b border-gray-200 pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{deadline.title}</p>
                    {deadline.description && (
                      <p className="text-sm text-muted-foreground text-xs">{deadline.description}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium" style={{ color: '#D4A937' }}>
                      {formatDate(deadline.due_date)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {deadline.status || 'upcoming'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
