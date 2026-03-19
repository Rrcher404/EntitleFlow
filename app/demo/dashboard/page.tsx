'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FolderKanban,
  FileCheck2,
  MessageSquare,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const stats = [
  {
    label: 'Active Projects',
    value: '12',
    change: '+2',
    trend: 'up' as const,
    icon: FolderKanban,
  },
  {
    label: 'Pending Permits',
    value: '8',
    change: '-1',
    trend: 'down' as const,
    icon: FileCheck2,
  },
  {
    label: 'Open Comments',
    value: '23',
    change: '+5',
    trend: 'up' as const,
    icon: MessageSquare,
  },
  {
    label: 'Avg. Review Time',
    value: '4.2d',
    change: '-0.8d',
    trend: 'down' as const,
    icon: Clock,
  },
];

const recentActivity = [
  {
    id: 1,
    action: 'Comment added',
    project: 'Brightwater Mixed-Use',
    user: 'Greensboro Planning',
    time: '12 min ago',
    status: 'warning' as const,
  },
  {
    id: 2,
    action: 'Permit approved',
    project: 'Oak Hills Subdivision Ph. 3',
    user: 'Raleigh Zoning',
    time: '1 hour ago',
    status: 'success' as const,
  },
  {
    id: 3,
    action: 'Resubmittal required',
    project: 'Downtown Lofts Renovation',
    user: 'Durham Building Dept',
    time: '3 hours ago',
    status: 'destructive' as const,
  },
  {
    id: 4,
    action: 'Status updated',
    project: 'Parkside Senior Living',
    user: 'System',
    time: '5 hours ago',
    status: 'default' as const,
  },
  {
    id: 5,
    action: 'New reviewer assigned',
    project: 'Elm Street Townhomes',
    user: 'Cary Planning',
    time: 'Yesterday',
    status: 'default' as const,
  },
];

const upcomingDeadlines = [
  { project: 'Brightwater Mixed-Use', deadline: 'Mar 22', type: 'Resubmittal' },
  { project: 'Oak Hills Ph. 3', deadline: 'Mar 25', type: 'Site plan review' },
  { project: 'Elm Street Townhomes', deadline: 'Apr 1', type: 'Comment response' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your approval operations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                  {stat.change}
                  {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="space-y-1">
                    <Badge variant={item.status} className="text-[10px]">{item.action}</Badge>
                    <div className="text-sm font-medium text-foreground">{item.project}</div>
                    <div className="text-xs text-muted-foreground">{item.user}</div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map((item) => (
                <div key={item.project} className="rounded-lg border border-border p-3 space-y-1">
                  <div className="text-sm font-medium text-foreground">{item.project}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{item.type}</span>
                    <Badge variant="outline" className="text-[10px]">{item.deadline}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
