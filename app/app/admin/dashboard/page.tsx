/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Users, FolderOpen, HardDrive, ScrollText, Plus, Key, BarChart3, Download } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeProjects: number;
  storageUsed: number;
  storageTotal: number;
  activeUsers: number;
  licenseDistribution: Array<{ name: string; count: number; color: string }>;
  recentActivity: Array<{
    id: string;
    timestamp: string;
    user: string;
    action: string;
  }>;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  subtext,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  subtext?: string;
}) => (
  <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <p className="text-3xl font-bold text-[#1B3B2D] mt-2">{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
      <div className="rounded-lg bg-[#f6f5f0] p-3">
        <Icon className="w-6 h-6 text-[#0f3c35]" />
      </div>
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-[#e2e5e5] bg-white p-6 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/company-admin/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        Error loading dashboard: {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-gray-600">
        No data available
      </div>
    );
  }

  const storagePercent = (stats.storageUsed / stats.storageTotal) * 100;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600">
        <span>Admin</span> / <span className="font-medium text-[#1B3B2D]">Dashboard</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1B3B2D]" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
          Dashboard Overview
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's your organization at a glance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          subtext={`${stats.activeUsers} active today`}
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={FolderOpen}
          subtext="This month"
        />
        <StatCard
          title="Storage Used"
          value={`${(stats.storageUsed / 1024 / 1024 / 1024).toFixed(1)}GB`}
          icon={HardDrive}
          subtext={`${storagePercent.toFixed(0)}% of ${(stats.storageTotal / 1024 / 1024 / 1024).toFixed(1)}GB`}
        />
        <StatCard
          title="Active Licenses"
          value={stats.totalUsers}
          icon={ScrollText}
          subtext="All in use"
        />
      </div>

      {/* Storage Progress Bar */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-[#1B3B2D] mb-4">Storage Usage</h3>
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-[#25a18e] h-4 rounded-full transition-all"
              style={{ width: `${storagePercent}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {(stats.storageUsed / 1024 / 1024 / 1024).toFixed(1)}GB / {(stats.storageTotal / 1024 / 1024 / 1024).toFixed(1)}GB used
          </p>
        </div>
      </div>

      {/* License Distribution */}
      {stats.licenseDistribution.length > 0 && (
        <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-[#1B3B2D] mb-4">License Distribution</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.licenseDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.licenseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-[#1B3B2D] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center gap-2 rounded-lg bg-[#0f3c35] text-white px-4 py-3 hover:bg-[#0a2a24] transition-colors">
            <Plus className="w-4 h-4" />
            Invite User
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-[#e2e5e5] text-[#1B3B2D] px-4 py-3 hover:bg-[#f6f5f0] transition-colors">
            <Key className="w-4 h-4" />
            Manage Permissions
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-[#e2e5e5] text-[#1B3B2D] px-4 py-3 hover:bg-[#f6f5f0] transition-colors">
            <Download className="w-4 h-4" />
            Export Audit Log
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-[#1B3B2D] mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#1B3B2D]">{activity.user}</p>
                  <p className="text-xs text-gray-600">{activity.action}</p>
                </div>
                <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
