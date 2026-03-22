'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FolderPlus, FileText, Upload, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
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

interface TeamMemberWorkload {
  id: string;
  name: string;
  assignedCount: number;
  overdueCount: number;
  resolvedCount: number;
}

export default function AppDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [kpis, setKpis] = useState<KPIData>({ projects: 0, permits: 0, pendingReviews: 0, documents: 0 });
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Deadline[]>([]);
  const [myTasksCount, setMyTasksCount] = useState(0);
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [teamWorkload, setTeamWorkload] = useState<TeamMemberWorkload[]>([]);
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

          // Fetch current user's assigned open comments (My Tasks)
          if (user.id) {
            const { count: myTasks } = await supabase
              .from('comments')
              .select('id', { count: 'exact', head: true })
              .eq('organization_id', orgId)
              .eq('assigned_to', user.id)
              .eq('is_resolved', false);
            setMyTasksCount(myTasks || 0);

            // Fetch overdue tasks (assigned to current user with overdue deadlines)
            const { data: myComments } = await supabase
              .from('comments')
              .select('id, permit_id')
              .eq('organization_id', orgId)
              .eq('assigned_to', user.id)
              .eq('is_resolved', false);

            if (myComments && myComments.length > 0) {
              const permitIds = (myComments as any[]).map(c => c.permit_id);
              const { count: overdue } = await supabase
                .from('deadlines')
                .select('id', { count: 'exact', head: true })
                .in('permit_id', permitIds)
                .lt('due_date', new Date().toISOString())
                .eq('status', 'upcoming');
              setOverdueTasksCount(overdue || 0);
            }
          }

          // Fetch team workload data
          try {
            const { data: commentsData } = await supabase
              .from('comments')
              .select('id, assigned_to, is_resolved, permit_id')
              .eq('organization_id', orgId);

            if (commentsData && commentsData.length > 0) {
              // Get all profiles in the organization
              const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('organization_id', orgId);

              const profiles = profilesData || [];
              const workloadMap: Record<string, TeamMemberWorkload> = {};

              // Initialize all team members
              profiles.forEach(profile => {
                workloadMap[profile.id] = {
                  id: profile.id,
                  name: profile.full_name || 'Unknown',
                  assignedCount: 0,
                  overdueCount: 0,
                  resolvedCount: 0,
                };
              });

              // Count comments by assignee
              commentsData.forEach(comment => {
                if (comment.assigned_to && workloadMap[comment.assigned_to]) {
                  if (comment.is_resolved) {
                    workloadMap[comment.assigned_to].resolvedCount++;
                  } else {
                    workloadMap[comment.assigned_to].assignedCount++;
                  }
                }
              });

              // Get overdue count per assignee (comments assigned to someone with overdue deadlines)
              const { data: overdueDeadlines } = await supabase
                .from('deadlines')
                .select('permit_id')
                .eq('organization_id', orgId)
                .lt('due_date', new Date().toISOString())
                .eq('status', 'upcoming');

              if (overdueDeadlines && overdueDeadlines.length > 0) {
                const overduePermitIds = overdueDeadlines.map(d => d.permit_id);
                commentsData.forEach(comment => {
                  if (
                    comment.assigned_to &&
                    workloadMap[comment.assigned_to] &&
                    !comment.is_resolved &&
                    overduePermitIds.includes(comment.permit_id)
                  ) {
                    workloadMap[comment.assigned_to].overdueCount++;
                  }
                });
              }

              // Convert map to array and sort by assigned count descending
              const workload = Object.values(workloadMap).sort(
                (a, b) => b.assignedCount - a.assignedCount
              );
              setTeamWorkload(workload);
            }
          } catch (error) {
            console.error('Error loading team workload:', error);
            setTeamWorkload([]);
          }
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

      {/* My Tasks and Overdue Tasks Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/app/tasks">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">My Tasks</h3>
                  <p className="text-xs text-muted-foreground mt-1">Assigned to you</p>
                </div>
                <CheckCircle className="h-5 w-5 text-primary" style={{ color: '#0f3c35' }} />
              </div>
              <div className="text-3xl font-bold text-foreground">{myTasksCount}</div>
            </div>
          </Card>
        </Link>

        <Card className="p-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Overdue Tasks</h3>
                <p className="text-xs text-muted-foreground mt-1">Past due</p>
              </div>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600">{overdueTasksCount}</div>
          </div>
        </Card>
      </div>

      {/* Team Workload Section */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Team Workload</h2>
            <p className="text-sm text-muted-foreground">Team member task distribution.</p>
          </div>

          {teamWorkload.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-foreground">Name</th>
                    <th className="text-right py-2 px-3 font-semibold text-foreground">Assigned</th>
                    <th className="text-right py-2 px-3 font-semibold text-foreground">Overdue</th>
                    <th className="text-right py-2 px-3 font-semibold text-foreground">Resolved</th>
                  </tr>
                </thead>
                <tbody>
                  {teamWorkload.map((member) => (
                    <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3 text-foreground font-medium">{member.name}</td>
                      <td className="py-3 px-3 text-right text-foreground font-semibold">
                        {member.assignedCount}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {member.overdueCount > 0 ? (
                          <span className="text-red-600 font-semibold">{member.overdueCount}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-green-600 font-semibold">{member.resolvedCount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No team members with assigned comments yet.</p>
          )}
        </div>
      </Card>

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
