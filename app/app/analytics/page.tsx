'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Activity,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  FolderOpen,
  MessageSquare,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { Comment, Project, Permit, ActivityLogEntry } from '@/lib/types/index';
import {
  type ProjectStatus,
  type PermitStatus,
  type PermitType,
  type CommentCategory,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  PERMIT_STATUS_LABELS,
  PERMIT_STATUS_COLORS,
  PERMIT_TYPE_LABELS,
  COMMENT_CATEGORY_LABELS,
} from '@/lib/types/index';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AnalyticsData {
  projectsByStatus: Record<string, number>;
  permitsByStatus: Record<string, number>;
  permitsByType: Record<string, number>;
  commentsByCategory: Record<string, { total: number; resolved: number }>;
  jurisdictionMetrics: Array<{ name: string; avgDays: number; permitCount: number }>;
  reviewerPatterns: Array<{ author: string; commentCount: number; topCategory: string }>;
  monthlyTrends: Array<{ month: string; count: number }>;
  totalComments: number;
  resolvedComments: number;
  activeProjects: number;
  activePermits: number;
  openComments: number;
  avgReviewDays: number;
  activityLast30Days: number;
  activityPrevious30Days: number;
}

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    projectsByStatus: {},
    permitsByStatus: {},
    permitsByType: {},
    commentsByCategory: {},
    jurisdictionMetrics: [],
    reviewerPatterns: [],
    monthlyTrends: [],
    totalComments: 0,
    resolvedComments: 0,
    activeProjects: 0,
    activePermits: 0,
    openComments: 0,
    avgReviewDays: 0,
    activityLast30Days: 0,
    activityPrevious30Days: 0,
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
        const [projectsRes, permitsRes, commentsRes, activityRes, jurisdictionsRes] = await Promise.all([
          supabase
            .from('projects')
            .select('status')
            .eq('organization_id', orgId),
          supabase
            .from('permits')
            .select('status, permit_type, submitted_at, decision_date, jurisdiction, author_name: profiles(full_name)')
            .eq('organization_id', orgId),
          supabase
            .from('comments')
            .select('id, is_resolved, category, author_name, permit_id')
            .eq('organization_id', orgId),
          supabase
            .from('activity_log')
            .select('created_at')
            .eq('organization_id', orgId),
          supabase
            .from('jurisdictions')
            .select('id, name, avg_review_days')
        ]);

        // Process project data
        const projectsByStatus: Record<string, number> = {};
        (projectsRes.data || []).forEach(project => {
          const s = project.status ?? 'draft';
          projectsByStatus[s] = (projectsByStatus[s] || 0) + 1;
        });
        const activeProjects = (projectsByStatus['active'] || 0) + (projectsByStatus['draft'] || 0);

        // Process permit data
        const permitsByStatus: Record<string, number> = {};
        const permitsByType: Record<string, number> = {};
        let avgReviewDays = 0;
        let approvedCount = 0;
        const monthlyData: Record<string, number> = {};

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

          // Track monthly submissions
          if (permit.submitted_at) {
            const monthKey = new Date(permit.submitted_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
            });
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
          }
        });

        if (approvedCount > 0) {
          avgReviewDays = Math.round(avgReviewDays / approvedCount);
        }

        // Get last 6 months for monthly trends
        const monthlyTrends: Array<{ month: string; count: number }> = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          monthlyTrends.push({
            month: monthKey,
            count: monthlyData[monthKey] || 0,
          });
        }

        const activePermits = (permitsByStatus['submitted'] || 0) + (permitsByStatus['under_review'] || 0);

        // Process comment data
        const comments = commentsRes.data || [];
        const totalComments = comments.length;
        const resolvedComments = comments.filter(c => c.is_resolved).length;
        const openComments = totalComments - resolvedComments;

        // Comments by category
        const commentsByCategory: Record<string, { total: number; resolved: number }> = {};
        comments.forEach(comment => {
          const category = comment.category ?? 'general';
          if (!commentsByCategory[category]) {
            commentsByCategory[category] = { total: 0, resolved: 0 };
          }
          commentsByCategory[category].total += 1;
          if (comment.is_resolved) {
            commentsByCategory[category].resolved += 1;
          }
        });

        // Reviewer patterns
        const reviewerData: Record<string, { comments: number; categories: Record<string, number> }> = {};
        comments.forEach(comment => {
          const author = comment.author_name ?? 'Unknown';
          if (!reviewerData[author]) {
            reviewerData[author] = { comments: 0, categories: {} };
          }
          reviewerData[author].comments += 1;
          const cat = comment.category ?? 'general';
          reviewerData[author].categories[cat] = (reviewerData[author].categories[cat] || 0) + 1;
        });

        const reviewerPatterns = Object.entries(reviewerData)
          .map(([author, data]) => {
            const topCategory = Object.entries(data.categories).sort(([, a], [, b]) => b - a)[0]?.[0] || 'general';
            return { author, commentCount: data.comments, topCategory };
          })
          .sort((a, b) => b.commentCount - a.commentCount)
          .slice(0, 10);

        // Jurisdiction metrics
        const jurisdictionMetrics: Array<{ name: string; avgDays: number; permitCount: number }> = [];
        const permitsByJurisdiction: Record<string, { count: number; days: number[] }> = {};

        permits.forEach(permit => {
          const j = permit.jurisdiction;
          if (!permitsByJurisdiction[j]) {
            permitsByJurisdiction[j] = { count: 0, days: [] };
          }
          permitsByJurisdiction[j].count += 1;

          if (permit.status === 'approved' && permit.submitted_at && permit.decision_date) {
            const submitted = new Date(permit.submitted_at).getTime();
            const approved = new Date(permit.decision_date).getTime();
            const days = Math.round((approved - submitted) / (1000 * 60 * 60 * 24));
            permitsByJurisdiction[j].days.push(days);
          }
        });

        Object.entries(permitsByJurisdiction).forEach(([jurisdiction, data]) => {
          const avgDays = data.days.length > 0
            ? Math.round(data.days.reduce((a, b) => a + b, 0) / data.days.length)
            : 0;
          jurisdictionMetrics.push({
            name: jurisdiction,
            avgDays,
            permitCount: data.count,
          });
        });
        jurisdictionMetrics.sort((a, b) => b.permitCount - a.permitCount);

        // Process activity data
        const activityNow = new Date();
        const last30Days = new Date(activityNow.getTime() - 30 * 24 * 60 * 60 * 1000);
        const last60Days = new Date(activityNow.getTime() - 60 * 24 * 60 * 60 * 1000);

        const activityLast30Days = (activityRes.data || []).filter(
          a => a.created_at && new Date(a.created_at) >= last30Days
        ).length;

        const activityPrevious30Days = (activityRes.data || []).filter(
          a => a.created_at && new Date(a.created_at) >= last60Days && new Date(a.created_at) < last30Days
        ).length;

        setAnalytics({
          projectsByStatus,
          permitsByStatus,
          permitsByType,
          commentsByCategory,
          jurisdictionMetrics,
          reviewerPatterns,
          monthlyTrends,
          totalComments,
          resolvedComments,
          activeProjects,
          activePermits,
          openComments,
          avgReviewDays,
          activityLast30Days,
          activityPrevious30Days,
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">
            Analytics
          </h1>
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

  const activityChange = analytics.activityPrevious30Days > 0
    ? Math.round(((analytics.activityLast30Days - analytics.activityPrevious30Days) / analytics.activityPrevious30Days) * 100)
    : 0;

  const kpis = [
    {
      label: 'Active Projects',
      value: analytics.activeProjects,
      icon: FolderOpen,
    },
    {
      label: 'Active Permits',
      value: analytics.activePermits,
      icon: TrendingUp,
    },
    {
      label: 'Open Comments',
      value: analytics.openComments,
      icon: MessageSquare,
    },
    {
      label: 'Avg Review Days',
      value: analytics.avgReviewDays,
      icon: Clock,
    },
  ];

  const maxMonthlyCount = Math.max(...analytics.monthlyTrends.map(m => m.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Advanced metrics, insights, and performance tracking.
        </p>
      </div>

      {/* KPI Row */}
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
                <p className="text-3xl font-semibold tracking-tight" style={{ color: '#D4A937' }}>
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
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Projects by Status
            </h2>
            <p className="text-sm text-muted-foreground">Current project distribution.</p>
          </div>

          {Object.keys(analytics.projectsByStatus).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analytics.projectsByStatus).map(([status, count]) => {
                const colors = PROJECT_STATUS_COLORS[status as ProjectStatus];
                const label = PROJECT_STATUS_LABELS[status as ProjectStatus];
                const total = Object.values(analytics.projectsByStatus).reduce((a, b) => a + b, 0);
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
                            width: `${(count / total) * 100}%`,
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
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Permits by Status
            </h2>
            <p className="text-sm text-muted-foreground">Current permit workflow stages.</p>
          </div>

          {Object.keys(analytics.permitsByStatus).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analytics.permitsByStatus).map(([status, count]) => {
                const colors = PERMIT_STATUS_COLORS[status as PermitStatus];
                const label = PERMIT_STATUS_LABELS[status as PermitStatus];
                const total = Object.values(analytics.permitsByStatus).reduce((a, b) => a + b, 0);
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
                            width: `${(count / total) * 100}%`,
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
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Permits by Type
            </h2>
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

      {/* Comment Resolution Rate by Category */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Comment Resolution by Category
            </h2>
            <p className="text-sm text-muted-foreground">Resolution rates across comment types.</p>
          </div>

          {Object.keys(analytics.commentsByCategory).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-foreground font-medium">Category</th>
                    <th className="text-center py-2 px-3 text-foreground font-medium">Total</th>
                    <th className="text-center py-2 px-3 text-foreground font-medium">Resolved</th>
                    <th className="text-right py-2 px-3 text-foreground font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(analytics.commentsByCategory)
                    .sort(([, a], [, b]) => b.total - a.total)
                    .map(([category, data]) => {
                      const rate = data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0;
                      return (
                        <tr key={category} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-3 text-foreground">
                            {COMMENT_CATEGORY_LABELS[category as CommentCategory] || category}
                          </td>
                          <td className="text-center py-3 px-3">{data.total}</td>
                          <td className="text-center py-3 px-3">{data.resolved}</td>
                          <td className="text-right py-3 px-3">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${rate}%`,
                                    backgroundColor: '#1B3B2D',
                                  }}
                                />
                              </div>
                              <span className="font-semibold w-10 text-right">{rate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          )}
        </div>
      </Card>

      {/* Approval Timeline by Jurisdiction */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Approval Timeline by Jurisdiction
            </h2>
            <p className="text-sm text-muted-foreground">Average review days and permit volume.</p>
          </div>

          {analytics.jurisdictionMetrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-foreground font-medium">Jurisdiction</th>
                    <th className="text-center py-2 px-3 text-foreground font-medium">Permits</th>
                    <th className="text-right py-2 px-3 text-foreground font-medium">Avg Days</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.jurisdictionMetrics.map((jurisdiction) => (
                    <tr key={jurisdiction.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3 text-foreground font-medium">{jurisdiction.name}</td>
                      <td className="text-center py-3 px-3">{jurisdiction.permitCount}</td>
                      <td className="text-right py-3 px-3 font-semibold" style={{ color: '#D4A937' }}>
                        {jurisdiction.avgDays}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No jurisdiction data available.</p>
          )}
        </div>
      </Card>

      {/* Recent Activity Comparison */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Recent Activity Trends
            </h2>
            <p className="text-sm text-muted-foreground">Activity comparison for last 30 days.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#E8E0D0' }}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4" style={{ color: '#1B3B2D' }} />
                <p className="text-sm font-medium text-foreground">Last 30 Days</p>
              </div>
              <p className="text-3xl font-semibold" style={{ color: '#1B3B2D' }}>
                {analytics.activityLast30Days}
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: '#E8E0D0' }}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4" style={{ color: '#D4A937' }} />
                <p className="text-sm font-medium text-foreground">Previous 30 Days</p>
              </div>
              <p className="text-3xl font-semibold" style={{ color: '#D4A937' }}>
                {analytics.activityPrevious30Days}
              </p>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" style={{ color: activityChange >= 0 ? '#22c55e' : '#ef4444' }} />
                <p className="text-sm font-medium text-foreground">Change</p>
              </div>
              <p
                className="text-3xl font-semibold"
                style={{ color: activityChange >= 0 ? '#22c55e' : '#ef4444' }}
              >
                {activityChange >= 0 ? '+' : ''}{activityChange}%
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Reviewer Patterns */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Reviewer Patterns
            </h2>
            <p className="text-sm text-muted-foreground">Top commenters and their focus areas.</p>
          </div>

          {analytics.reviewerPatterns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-foreground font-medium">Reviewer</th>
                    <th className="text-center py-2 px-3 text-foreground font-medium">Comments</th>
                    <th className="text-right py-2 px-3 text-foreground font-medium">Top Category</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.reviewerPatterns.map((reviewer) => (
                    <tr key={reviewer.author} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3 text-foreground font-medium">{reviewer.author}</td>
                      <td className="text-center py-3 px-3">{reviewer.commentCount}</td>
                      <td className="text-right py-3 px-3">
                        {COMMENT_CATEGORY_LABELS[reviewer.topCategory as CommentCategory] || reviewer.topCategory}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No reviewer data available.</p>
          )}
        </div>
      </Card>

      {/* Monthly Trend */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Monthly Permit Submissions
            </h2>
            <p className="text-sm text-muted-foreground">Permit submissions over the last 6 months.</p>
          </div>

          {analytics.monthlyTrends.length > 0 ? (
            <div className="space-y-3">
              {analytics.monthlyTrends.map((trend) => {
                const percentage = maxMonthlyCount > 0 ? (trend.count / maxMonthlyCount) * 100 : 0;
                return (
                  <div key={trend.month} className="flex items-center justify-between">
                    <span className="text-sm text-foreground w-12">{trend.month}</span>
                    <div className="flex-1 mx-4 bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: '#1B3B2D',
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-8 text-right">
                      {trend.count}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No permit submission data available.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
