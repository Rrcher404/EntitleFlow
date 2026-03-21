'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FolderPlus, FileText, Upload, ArrowRight } from 'lucide-react';
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
  const [displayName, setDisplayName] = useState<string>('');

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

        // Resolve display name: profile full_name → auth metadata → email prefix
        const firstName =
          profileData?.full_name?.split(' ')[0] ||
          (user.user_metadata?.full_name as string | undefined)?.split(' ')[0] ||
          user.email?.split('@')[0] ||
          '';
        setDisplayName(firstName);

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
          {displayName ? `Welcome back, ${displayName}!` : 'Welcome back!'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s your approval operations overview.</p>
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

      {/* Onboarding — only shows when the account has no data yet */}
      {kpis.projects === 0 && kpis.permits === 0 && kpis.documents === 0 && (
        <Card className="border-2 border-dashed border-primary/30 bg-accent/30 p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground font-display">
                Get started with EntitleFlow
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Set up your first project in three steps — it only takes a few minutes.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  step: 1,
                  icon: FolderPlus,
                  title: 'Create a project',
                  desc: 'Add the development site you\'re working on.',
                  href: '/app/projects',
                },
                {
                  step: 2,
                  icon: FileText,
                  title: 'Add a permit',
                  desc: 'Link a permit application to your project.',
                  href: '/app/permits',
                },
                {
                  step: 3,
                  icon: Upload,
                  title: 'Upload a document',
                  desc: 'Upload reviewer comments for AI analysis.',
                  href: '/app/documents',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.step} href={item.href} className="group">
                    <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/40">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {item.step}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                            {item.title}
                            <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                          </p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </Card>
      )}

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
