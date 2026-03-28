'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

type TimeRange = '7d' | '30d' | '90d' | '1y';

interface JurisdictionMetric {
  name: string;
  activeProjects: number;
  avgReviewDays: number;
  approvalRate: number;
  expanded?: boolean;
  permitTypeBreakdown?: { type: string; count: number }[];
}

interface MonthlyData {
  month: string;
  '7d': number;
  '30d': number;
  '90d': number;
  '1y': number;
}

interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

const jurisdictionMetricsData: JurisdictionMetric[] = [
  {
    name: 'Greensboro',
    activeProjects: 8,
    avgReviewDays: 18,
    approvalRate: 82,
    permitTypeBreakdown: [
      { type: 'Site Plan', count: 12 },
      { type: 'Building Permit', count: 8 },
      { type: 'Zoning Variance', count: 5 },
    ],
  },
  {
    name: 'Raleigh',
    activeProjects: 6,
    avgReviewDays: 21,
    approvalRate: 75,
    permitTypeBreakdown: [
      { type: 'Site Plan', count: 14 },
      { type: 'Stormwater Review', count: 9 },
      { type: 'Building Permit', count: 6 },
    ],
  },
  {
    name: 'Durham',
    activeProjects: 5,
    avgReviewDays: 16,
    approvalRate: 88,
    permitTypeBreakdown: [
      { type: 'Building Permit', count: 10 },
      { type: 'Site Plan', count: 7 },
      { type: 'Zoning Variance', count: 3 },
    ],
  },
  {
    name: 'Cary',
    activeProjects: 4,
    avgReviewDays: 14,
    approvalRate: 91,
    permitTypeBreakdown: [
      { type: 'Site Plan', count: 8 },
      { type: 'Building Permit', count: 5 },
      { type: 'Stormwater Review', count: 4 },
    ],
  },
];

const monthlyDataConfig: MonthlyData[] = [
  { month: 'Jan', '7d': 3, '30d': 12, '90d': 12, '1y': 12 },
  { month: 'Feb', '7d': 5, '30d': 18, '90d': 18, '1y': 18 },
  { month: 'Mar', '7d': 8, '30d': 14, '90d': 14, '1y': 14 },
  { month: 'Apr', '7d': 6, '30d': 22, '90d': 22, '1y': 22 },
  { month: 'May', '7d': 4, '30d': 19, '90d': 19, '1y': 19 },
  { month: 'Jun', '7d': 2, '30d': 25, '90d': 25, '1y': 25 },
  { month: 'Jul', '7d': 1, '30d': 20, '90d': 20, '1y': 20 },
  { month: 'Aug', '7d': 0, '30d': 17, '90d': 17, '1y': 17 },
  { month: 'Sep', '7d': 0, '30d': 21, '90d': 21, '1y': 21 },
  { month: 'Oct', '7d': 0, '30d': 19, '90d': 19, '1y': 19 },
  { month: 'Nov', '7d': 0, '30d': 24, '90d': 24, '1y': 24 },
  { month: 'Dec', '7d': 0, '30d': 26, '90d': 26, '1y': 26 },
];

const commentCategoriesData: CategoryBreakdown[] = [
  { category: 'Parking & Access', count: 34, percentage: 24 },
  { category: 'Stormwater', count: 28, percentage: 20 },
  { category: 'Building Code', count: 32, percentage: 23 },
  { category: 'Zoning', count: 22, percentage: 15 },
  { category: 'Fire/Safety', count: 18, percentage: 12 },
  { category: 'Other', count: 6, percentage: 6 },
];

const processingSpeedData = [
  { week: 'Week 1', avgDays: 5.2 },
  { week: 'Week 2', avgDays: 4.8 },
  { week: 'Week 3', avgDays: 4.5 },
  { week: 'Week 4', avgDays: 4.1 },
  { week: 'Week 5', avgDays: 3.9 },
  { week: 'Week 6', avgDays: 3.7 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string | null>(null);
  const [expandedJurisdiction, setExpandedJurisdiction] = useState<string | null>(null);
  const [jurisdictionMetrics, setJurisdictionMetrics] = useState(jurisdictionMetricsData);

  const monthlyData = useMemo(() => {
    return monthlyDataConfig.map((data) => ({
      month: data.month,
      permits: data[timeRange],
    }));
  }, [timeRange]);

  const maxPermits = Math.max(...monthlyData.map((d) => d.permits));
  const maxComments = Math.max(...commentCategoriesData.map((c) => c.count));
  const maxProcessingSpeed = Math.max(...processingSpeedData.map((d) => d.avgDays));

  // Calculate stats
  const totalProjects = jurisdictionMetrics.reduce((sum, j) => sum + j.activeProjects, 0);
  const totalPermits = monthlyData.reduce((sum, d) => sum + d.permits, 0);
  const avgApprovalRate = Math.round(
    jurisdictionMetrics.reduce((sum, j) => sum + j.approvalRate, 0) / jurisdictionMetrics.length
  );
  const avgReviewTime = parseFloat(
    (
      jurisdictionMetrics.reduce((sum, j) => sum + j.avgReviewDays, 0) /
      jurisdictionMetrics.length
    ).toFixed(1)
  );

  const filteredMetrics = useMemo(() => {
    if (!jurisdictionFilter) return jurisdictionMetrics;
    return jurisdictionMetrics.filter((m) => m.name === jurisdictionFilter);
  }, [jurisdictionFilter, jurisdictionMetrics]);

  const toggleJurisdictionExpand = (name: string) => {
    setExpandedJurisdiction(expandedJurisdiction === name ? null : name);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-display font-semibold text-foreground">
          Analytics & Performance
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track performance metrics across jurisdictions and permit types
        </p>
      </div>

      {/* Time Range Filter */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-accent text-primary font-semibold'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {range === '7d' ? '7 days' : range === '30d' ? '30 days' : range === '90d' ? '90 days' : '1 year'}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Projects', value: totalProjects },
          { label: 'Total Permits', value: totalPermits },
          { label: 'Avg Approval Rate', value: `${avgApprovalRate}%` },
          { label: 'Avg Review Time', value: `${avgReviewTime}d` },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardContent className="p-5">
                <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Jurisdiction Performance */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">
              Jurisdiction Performance
            </CardTitle>
            <select
              value={jurisdictionFilter || ''}
              onChange={(e) => setJurisdictionFilter(e.target.value || null)}
              className="text-xs px-3 py-1 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All Jurisdictions</option>
              {jurisdictionMetrics.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Jurisdiction</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">
                    Active Projects
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">
                    Avg Review Time
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">
                    Approval Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMetrics.map((metric) => (
                  <motion.tr
                    key={metric.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border hover:bg-secondary/30 transition-colors"
                  >
                    <td
                      className="px-6 py-4 font-medium text-foreground cursor-pointer hover:underline"
                      onClick={() => toggleJurisdictionExpand(metric.name)}
                    >
                      {metric.name}
                    </td>
                    <td className="px-6 py-4 text-foreground">{metric.activeProjects}</td>
                    <td className="px-6 py-4 text-foreground">{metric.avgReviewDays} days</td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="bg-emerald-500 h-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${metric.approvalRate}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground min-w-max">
                            {metric.approvalRate}%
                          </span>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expandable Permit Type Breakdown */}
          {expandedJurisdiction && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-lg bg-secondary/20 space-y-3"
            >
              <h4 className="font-semibold text-foreground">
                Permit Types in {expandedJurisdiction}
              </h4>
              {jurisdictionMetrics
                .find((m) => m.name === expandedJurisdiction)
                ?.permitTypeBreakdown?.map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{item.type}</span>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                ))}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Permit Activity */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Monthly Permit Activity ({timeRange === '1y' ? 'Last 12 Months' : timeRange})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthlyData.map((data, index) => (
              <motion.div
                key={data.month}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-center gap-3"
              >
                <div className="w-12 text-sm font-medium text-muted-foreground">{data.month}</div>
                <div className="flex-1">
                  <div className="bg-secondary rounded-full h-6 overflow-hidden relative group">
                    <motion.div
                      className="bg-blue-500 h-full transition-all"
                      initial={{ width: 0 }}
                      animate={{ width: maxPermits > 0 ? `${(data.permits / maxPermits) * 100}%` : '0%' }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                    {/* Hover tooltip */}
                    {data.permits > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-semibold text-white drop-shadow">
                          {data.permits}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-medium text-foreground">{data.permits}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comment Categories Breakdown */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Comment Categories Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {commentCategoriesData.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{category.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{category.count}</span>
                    <Badge variant="outline" className="text-xs">
                      {category.percentage}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="bg-amber-500 h-full transition-all"
                    initial={{ width: 0 }}
                    animate={{ width: `${(category.count / maxComments) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permit Processing Speed Trend */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Permit Processing Speed Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {processingSpeedData.map((data, index) => (
              <motion.div
                key={data.week}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="w-16 text-sm font-medium text-muted-foreground">{data.week}</div>
                <div className="flex-1">
                  <div className="bg-secondary rounded-full h-6 overflow-hidden relative group">
                    <motion.div
                      className="bg-green-500 h-full transition-all"
                      initial={{ width: 0 }}
                      animate={{
                        width: maxProcessingSpeed > 0 ? `${(data.avgDays / maxProcessingSpeed) * 100}%` : '0%',
                      }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                    {/* Hover tooltip */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-semibold text-white drop-shadow">
                        {data.avgDays}d
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-medium text-foreground">{data.avgDays}d</div>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            ✓ Processing speed improving week over week
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
