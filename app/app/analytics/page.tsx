'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  FolderOpen,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import type { Project, Permit, Comment, ActivityLogEntry } from '@/lib/types/index';
import {
  type ProjectStatus,
  type PermitStatus,
  type PermitType,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  PERMIT_STATUS_LABELS,
  PERMIT_STATUS_COLORS,
  PERMIT_TYPE_LABELS,
} from '@/lib/types/index';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AnalyticsData {
  projectsByStatus: Record<string, number>;
  permitsByStatus: Record<string, number>;
  permitsByType: Record<string, number>;
  totalComments: number;
  resolvedComments: number;
  unresolvedComments: number;
  avgReviewDays: number;
  activityLast7Days: number;
  activityLast30Days: number;
}

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    projectsByStatus: {},
    permitsByStatus: {},
    permitsByType: {},
    totalComments: 0,
    resolvedComments: 0,
    unresolvedComments: 0,
    avgReviewDays: 0,
    activityLast7Days: 0,
    activityLast30Days: 0,
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadAnalytics();
  }, [supabase]);

  const loadAnalytics = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

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

        // Fetch all data in parallel
        const [projectsRes, permitsRes, commentsRes, activityRes] = await Promise.all([
          supabase
            .from('projects')
            .select('status')
            .eq('organization_id', orgId),
          supabase
            .from('permits')
            .select('status, permit_type, submitted_at, decision_date')
            .eq('organization_id', orgId),
          supabase
            .from('comments')
            .select('id, is_resolved')
            .eq('organization_id', orgId),
          supabase
            .from('activity_log')
            .select('created_at')
            .eq('organization_id', orgId),
        ]);

        // Process project data
        const projectsByStatus: Record<string, number> = {};
        (projectsRes.data || []).forEach(project => {
          const s = project.status ?? 'draft';
          projectsByStatus[s] = (projectsByStatus[s] || 0) + 1;
        });

        // Process permit data
        const permitsByStatus: Record<string, number> = {};
        const permitsByType: Record<string, number> = {};
        let avgReviewDays = 0;
        let approvedCount = 0;

        const permits = permitsRes.data || [];
        permits.forEach(permit => {
          const ps = permit.status ?? 'draft';
          permitsByStatus[ps] = (permitsByStatus[ps] || 0) + 1;
          permitsByType[permit.permit_type] = (permitsByType[permit.permit_type] || 0) + 1;

          // Calculate average review days for approved permits
          if (permit.status === 'approved' && permit.submitted_at && permit.decision_date) {
            const submitted = new Date(permit.submitted_at).getTime();
            const approved = new Date(permit.decision_date).getTime();
            const days = Math.round((approved - submitted) / (1000 * 60 * 60 * 24));
            avgReviewDays += days;
            approvedCount++;
          }
        });

        if (approvedCount > 0) {
          avgReviewDays = Math.round(avgReviewDays / approvedCount);
        }

        // Process comment data
        const comments = commentsRes.data || [];
        const totalComments = comments.length;
        const resolvedComments = comments.filter(c => c.is_resolved).length;
        const unresolvedComments = totalComments - resolvedComments;

        // Process activity data
        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const activityLast7Days = (activityRes.data || []).filter(
          a => a.created_at && new Date(a.created_at) >= last7Days
        ).length;

        const activityLast30Days = (activityRes.data || []).filter(
          a => a.created_at && new Date(a.created_at) >= last30Days
        ).length;

        setAnalytics({
          projectsByStatus,
          permitsByStatus,
          permitsByType,
          totalComments,
          resolvedComments,
          unresolvedComments,
          avgReviewDays,
          activityLast7Days,
          activityLast30Days,
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Organization metrics and insights.</p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Projects',
      value: Object.values(analytics.projectsByStatus).reduce((a, b) => a + b, 0),
      icon: FolderOpen,
    },
    {
      label: 'Active Permits',
      value: (analytics.permitsByStatus['submitted'] || 0) + (analytics.permitsByStatus['under_review'] || 0),
      icon: TrendingUp,
    },
    {
      label: 'Pending Reviews',
      value: analytics.permitsByStatus['revision_requested'] || 0,
      icon: Clock,
    },
    {
      label: 'Avg Review Days',
      value: analytics.avgReviewDays,
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Organization metrics and insights at a glance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={idx}
              className="p-6"
              style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: '#E8E0D0' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: '#1B3B2D' }} />
                  </div>
                </div>
                <p className="text-3xl font-semibold tracking-tight" style={{ color: '#1B3B2D' }}>
                  {kpi.value}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Projects by Status */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Projects by Status</h2>
            <p className="text-sm text-muted-foreground">Current project distribution.</p>
          </div>

          {Object.keys(analytics.projectsByStatus).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analytics.projectsByStatus).map(([status, count]) => {
                const colors = PROJECT_STATUS_COLORS[status as ProjectStatus];
                const label = PROJECT_STATUS_LABELS[status as ProjectStatus];
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                      >
                        {label}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(count / Object.values(analytics.projectsByStatus).reduce((a, b) => a + b, 0)) * 100}%`,
                            backgroundColor: '#1B3B2D',
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground ml-4">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          )}
        </div>
      </Card>

      {/* Permits by Status */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Permits by Status</h2>
            <p className="text-sm text-muted-foreground">Current permit workflow stages.</p>
          </div>

          {Object.keys(analytics.permitsByStatus).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analytics.permitsByStatus).map(([status, count]) => {
                const colors = PERMIT_STATUS_COLORS[status as PermitStatus];
                const label = PERMIT_STATUS_LABELS[status as PermitStatus];
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                      >
                        {label}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(count / Object.values(analytics.permitsByStatus).reduce((a, b) => a + b, 0)) * 100}%`,
                            backgroundColor: '#D4A937',
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground ml-4">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No permits yet.</p>
          )}
        </div>
      </Card>

      {/* Permits by Type */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Permits by Type</h2>
            <p className="text-sm text-muted-foreground">Breakdown of permit applications.</p>
          </div>

          {Object.keys(analytics.permitsByType).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(analytics.permitsByType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => {
                  const label = PERMIT_TYPE_LABELS[type as PermitType] || type;
                  const total = Object.values(analytics.permitsByType).reduce((a, b) => a + b, 0);
                  return (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{label}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${(count / total) * 100}%`,
                              backgroundColor: '#1B3B2D',
                            }}
                          />
                        </div>
                        <span className="font-semibold text-foreground w-8 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No permits yet.</p>
          )}
        </div>
      </Card>

      {/* Comment Resolution */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Comment Resolution</h2>
            <p className="text-sm text-muted-foreground">Feedback and issue tracking.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#E8E0D0' }}>
              <p className="text-2xl font-semibold" style={{ color: '#1B3B2D' }}>
                {analytics.totalComments}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total Comments</p>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#E8E0D0' }}>
              <p className="text-2xl font-semibold text-green-600">
                {analytics.resolvedComments}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Resolved</p>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#E8E0D0' }}>
              <p className="text-2xl font-semibold text-amber-600">
                {analytics.unresolvedComments}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Unresolved</p>
            </div>
          </div>

          {analytics.totalComments > 0 && (
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-foreground">Resolution Rate</span>
                  <span className="font-semibold">
                    {Math.round((analytics.resolvedComments / analytics.totalComments) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(analytics.resolvedComments / analytics.totalComments) * 100}%`,
                      backgroundColor: '#1B3B2D',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Recent Activity</h2>
            <p className="text-sm text-muted-foreground">Organization activity over time.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" style={{ color: '#1B3B2D' }} />
                <p className="text-sm font-medium text-foreground">Last 7 Days</p>
              </div>
              <p className="text-3xl font-semibold" style={{ color: '#1B3B2D' }}>
                {analytics.activityLast7Days}
              </p>
              <p className="text-xs text-muted-foreground mt-1">actions</p>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" style={{ color: '#D4A937' }} />
                <p className="text-sm font-medium text-foreground">Last 30 Days</p>
              </div>
              <p className="text-3xl font-semibold" style={{ color: '#D4A937' }}>
                {analytics.activityLast30Days}
              </p>
              <p className="text-xs text-muted-foreground mt-1">actions</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
