'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FolderKanban,
  FileCheck2,
  MessageSquare,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardCheck,
  FileText,
  BarChart3,
  Bell,
  Settings,
} from 'lucide-react';

type TimeRange = 'today' | '7d' | '30d' | '90d';

interface StatData {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  today: { value: string; change: string; trend: 'up' | 'down' };
  '7d': { value: string; change: string; trend: 'up' | 'down' };
  '30d': { value: string; change: string; trend: 'up' | 'down' };
  '90d': { value: string; change: string; trend: 'up' | 'down' };
}

const statConfigs: StatData[] = [
  {
    label: 'Active Projects',
    icon: FolderKanban,
    today: { value: '3', change: '+1', trend: 'up' },
    '7d': { value: '7', change: '+2', trend: 'up' },
    '30d': { value: '12', change: '+5', trend: 'up' },
    '90d': { value: '18', change: '+8', trend: 'up' },
  },
  {
    label: 'Pending Permits',
    icon: FileCheck2,
    today: { value: '2', change: '-1', trend: 'down' },
    '7d': { value: '5', change: '-2', trend: 'down' },
    '30d': { value: '8', change: '-1', trend: 'down' },
    '90d': { value: '14', change: '+3', trend: 'up' },
  },
  {
    label: 'Open Comments',
    icon: MessageSquare,
    today: { value: '8', change: '+2', trend: 'up' },
    '7d': { value: '15', change: '+4', trend: 'up' },
    '30d': { value: '23', change: '+5', trend: 'up' },
    '90d': { value: '42', change: '+11', trend: 'up' },
  },
  {
    label: 'Avg. Review Time',
    icon: Clock,
    today: { value: '1.2d', change: '-0.3d', trend: 'down' },
    '7d': { value: '3.8d', change: '-0.5d', trend: 'down' },
    '30d': { value: '4.2d', change: '-0.8d', trend: 'down' },
    '90d': { value: '5.1d', change: '+0.2d', trend: 'up' },
  },
];

interface ActivityItem {
  id: number;
  action: string;
  project: string;
  user: string;
  time: string;
  status: 'warning' | 'success' | 'destructive' | 'default';
  link: string;
}

const recentActivity: ActivityItem[] = [
  {
    id: 1,
    action: 'Comment added',
    project: 'Brightwater Mixed-Use',
    user: 'Greensboro Planning',
    time: '12 min ago',
    status: 'warning',
    link: '/demo/permits',
  },
  {
    id: 2,
    action: 'Permit approved',
    project: 'Oak Hills Subdivision Ph. 3',
    user: 'Raleigh Zoning',
    time: '1 hour ago',
    status: 'success',
    link: '/demo/permits',
  },
  {
    id: 3,
    action: 'Resubmittal required',
    project: 'Downtown Lofts Renovation',
    user: 'Durham Building Dept',
    time: '3 hours ago',
    status: 'destructive',
    link: '/demo/permits',
  },
  {
    id: 4,
    action: 'Status updated',
    project: 'Parkside Senior Living',
    user: 'System',
    time: '5 hours ago',
    status: 'default',
    link: '/demo/projects',
  },
  {
    id: 5,
    action: 'New reviewer assigned',
    project: 'Elm Street Townhomes',
    user: 'Cary Planning',
    time: 'Yesterday',
    status: 'default',
    link: '/demo/projects',
  },
];

const upcomingDeadlines = [
  { project: 'Brightwater Mixed-Use', deadline: 'Mar 22', type: 'Resubmittal' },
  { project: 'Oak Hills Ph. 3', deadline: 'Mar 25', type: 'Site plan review' },
  { project: 'Elm Street Townhomes', deadline: 'Apr 1', type: 'Comment response' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const handleStatClick = (label: string) => {
    if (label === 'Active Projects') {
      router.push('/demo/projects');
    } else if (label === 'Pending Permits') {
      router.push('/demo/permits');
    } else if (label === 'Open Comments') {
      router.push('/demo/permits');
    }
  };

  const handleActivityClick = (link: string) => {
    router.push(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your approval operations.
        </p>
      </div>

      {/* Time Range Filter */}
      <div className="flex gap-2">
        {(['today', '7d', '30d', '90d'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-accent text-primary font-semibold'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {range === 'today' ? 'Today' : range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statConfigs.map((config) => {
          const data = config[timeRange];
          return (
            <motion.div
              key={config.label}
              onClick={() => handleStatClick(config.label)}
              className="cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                      <config.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs font-medium ${
                        data.trend === 'up' ? 'text-emerald-600' : 'text-muted-foreground'
                      }`}
                    >
                      {data.change}
                      {data.trend === 'up' ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <motion.div
                      key={`${config.label}-${data.value}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-2xl font-semibold text-foreground"
                    >
                      {data.value}
                    </motion.div>
                    <div className="text-xs text-muted-foreground">{config.label}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Navigation */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Platform Sections
        </h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {[
            { label: 'Tasks', href: '/demo/tasks', icon: ClipboardCheck, desc: 'Track comment responses' },
            { label: 'Projects', href: '/demo/projects', icon: FolderKanban, desc: 'Manage development sites' },
            { label: 'Permits', href: '/demo/permits', icon: FileCheck2, desc: 'Track permit applications' },
            { label: 'Documents', href: '/demo/documents', icon: FileText, desc: 'Upload & review files' },
            { label: 'Analytics', href: '/demo/analytics', icon: BarChart3, desc: 'Approval cycle insights' },
            { label: 'Notifications', href: '/demo/notifications', icon: Bell, desc: 'Activity & alerts' },
            { label: 'Settings', href: '/demo/settings', icon: Settings, desc: 'Account & preferences' },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Card
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/40"
                onClick={() => router.push(item.href)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <button
                onClick={() => router.push('/demo/permits')}
                className="text-sm text-primary hover:underline font-medium"
              >
                View all
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleActivityClick(item.link)}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-secondary/30 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <Badge variant={item.status} className="text-[10px]">
                      {item.action}
                    </Badge>
                    <div className="text-sm font-medium text-foreground">{item.project}</div>
                    <div className="text-xs text-muted-foreground">{item.user}</div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</div>
                </motion.div>
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
                    <Badge variant="outline" className="text-[10px]">
                      {item.deadline}
                    </Badge>
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
