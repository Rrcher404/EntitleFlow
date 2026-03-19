'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface JurisdictionMetric {
  name: string;
  activeProjects: number;
  avgReviewDays: number;
  approvalRate: number;
}

interface MonthlyData {
  month: string;
  permits: number;
}

interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

const jurisdictionMetrics: JurisdictionMetric[] = [
  { name: 'Greensboro', activeProjects: 8, avgReviewDays: 18, approvalRate: 82 },
  { name: 'Raleigh', activeProjects: 6, avgReviewDays: 21, approvalRate: 75 },
  { name: 'Durham', activeProjects: 5, avgReviewDays: 16, approvalRate: 88 },
  { name: 'Cary', activeProjects: 4, avgReviewDays: 14, approvalRate: 91 },
];

const monthlyData: MonthlyData[] = [
  { month: 'Jan', permits: 12 },
  { month: 'Feb', permits: 18 },
  { month: 'Mar', permits: 14 },
  { month: 'Apr', permits: 22 },
  { month: 'May', permits: 19 },
  { month: 'Jun', permits: 25 },
];

const commentCategories: CategoryBreakdown[] = [
  { category: 'Parking & Access', count: 34, percentage: 24 },
  { category: 'Stormwater', count: 28, percentage: 20 },
  { category: 'Building Code', count: 32, percentage: 23 },
  { category: 'Zoning', count: 22, percentage: 15 },
  { category: 'Fire/Safety', count: 18, percentage: 12 },
  { category: 'Other', count: 6, percentage: 6 },
];

const maxPermits = Math.max(...monthlyData.map((d) => d.permits));
const maxComments = Math.max(...commentCategories.map((c) => c.count));

export default function AnalyticsPage() {
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

      {/* Jurisdiction Performance */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Jurisdiction Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-3 text-left font-semibold text-foreground">
                    Jurisdiction
                  </th>
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
                {jurisdictionMetrics.map((metric) => (
                  <tr
                    key={metric.name}
                    className="border-b border-border hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {metric.name}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {metric.activeProjects}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {metric.avgReviewDays} days
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full"
                              style={{
                                width: `${metric.approvalRate}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground min-w-max">
                            {metric.approvalRate}%
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Permit Activity */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Monthly Permit Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex items-center gap-3">
                <div className="w-12 text-sm font-medium text-muted-foreground">
                  {data.month}
                </div>
                <div className="flex-1">
                  <div className="bg-secondary rounded-full h-6 overflow-hidden relative">
                    <div
                      className="bg-blue-500 h-full transition-all"
                      style={{
                        width: `${(data.permits / maxPermits) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-medium text-foreground">
                  {data.permits}
                </div>
              </div>
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
            {commentCategories.map((category) => (
              <div key={category.category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {category.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {category.count}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {category.percentage}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all"
                    style={{
                      width: `${(category.count / maxComments) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
