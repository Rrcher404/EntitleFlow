'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsResponse {
  stats: {
    totalUsers: number;
    totalOrganizations: number;
    activeProjects: number;
    totalPermits: number;
    marketingLeads: number;
  };
  activityLogs: Array<{
    id: string;
    action: string;
    description: string;
    created_at: string;
    user_email?: string;
  }>;
  recentSignups: Array<{
    id: string;
    email: string;
    full_name: string;
    created_at: string;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const statsData = await res.json();
        setData(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
              Analytics
            </h1>
            <p className="text-gray-600">Platform analytics and insights</p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
              Analytics
            </h1>
          </div>
          <Card className="border p-4" style={{ borderColor: '#E8E0D0', backgroundColor: '#FEE2E2' }}>
            <p className="text-red-700">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const activityLogs = data?.activityLogs || [];
  const recentSignups = data?.recentSignups || [];

  // Build summary KPI entries
  const kpis = [
    { label: 'Total Users', value: stats?.totalUsers || 0, color: '#1B3B2D' },
    { label: 'Organizations', value: stats?.totalOrganizations || 0, color: '#1B3B2D' },
    { label: 'Active Projects', value: stats?.activeProjects || 0, color: '#D4A937' },
    { label: 'Total Permits', value: stats?.totalPermits || 0, color: '#1B3B2D' },
    { label: 'Marketing Leads', value: stats?.marketingLeads || 0, color: '#D4A937' },
  ];

  const kpiMax = Math.max(...kpis.map((k) => k.value), 1);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
            Analytics
          </h1>
          <p className="text-gray-600">Platform analytics and insights</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* KPI Summary Cards */}
          <motion.div variants={itemVariants}>
            <Card className="border p-6" style={{ borderColor: '#E8E0D0' }}>
              <h2 className="text-lg font-semibold mb-6" style={{ color: '#1B3B2D' }}>
                Platform Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {kpis.map((kpi) => (
                  <div key={kpi.label}>
                    <p className="text-gray-600 text-sm">{kpi.label}</p>
                    <p className="text-4xl font-bold mt-2" style={{ color: kpi.color }}>
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Platform Metrics Bar Chart */}
          <motion.div variants={itemVariants}>
            <Card className="border p-6" style={{ borderColor: '#E8E0D0' }}>
              <h2 className="text-lg font-semibold mb-6" style={{ color: '#1B3B2D' }}>
                Platform Metrics
              </h2>
              <div className="space-y-4">
                {kpis.map((kpi, idx) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    style={{ originX: 0 }}
                    className="flex items-center gap-4"
                  >
                    <span className="w-32 text-sm font-medium" style={{ color: '#1B3B2D' }}>
                      {kpi.label}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: kpi.color,
                          width: `${(kpi.value / kpiMax) * 100}%`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(kpi.value / kpiMax) * 100}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                      />
                    </div>
                    <span className="w-12 text-sm text-right text-gray-700">
                      {kpi.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Signups */}
          {recentSignups.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border p-6" style={{ borderColor: '#E8E0D0' }}>
                <h2 className="text-lg font-semibold mb-6" style={{ color: '#1B3B2D' }}>
                  Recent Signups
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: '#F5F3F0', borderBottom: '1px solid #E8E0D0' }}>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSignups.map((signup) => (
                        <tr key={signup.id} style={{ borderBottom: '1px solid #E8E0D0' }}>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: '#1B3B2D' }}>
                            {signup.full_name || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{signup.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(signup.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Recent Activity */}
          {activityLogs.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border p-6" style={{ borderColor: '#E8E0D0' }}>
                <h2 className="text-lg font-semibold mb-6" style={{ color: '#1B3B2D' }}>
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between p-3 rounded-lg"
                      style={{ backgroundColor: '#F5F3F0' }}
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#1B3B2D' }}>
                          {log.action}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{log.description}</p>
                        {log.user_email && (
                          <p className="text-xs text-gray-500 mt-1">by {log.user_email}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
