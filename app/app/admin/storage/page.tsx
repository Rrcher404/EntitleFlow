'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface StorageStats {
  used: number;
  total: number;
  perFileSizeLimit: number;
  breakdown: Array<{ name: string; size: number; color: string }>;
  fileTypeDistribution: Array<{ name: string; count: number; color: string }>;
}

const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
    ))}
  </div>
);

export default function StoragePage() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/company-admin/storage');
        if (!response.ok) throw new Error('Failed to fetch storage stats');
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

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        Error loading storage stats: {error}
      </div>
    );
  }

  if (loading) return <LoadingSkeleton />;
  if (!stats) return <div>No data available</div>;

  const usagePercent = (stats.used / stats.total) * 100;
  const totalGB = stats.total / 1024 / 1024 / 1024;
  const usedGB = stats.used / 1024 / 1024 / 1024;
  const limitMB = stats.perFileSizeLimit / 1024 / 1024;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600">
        <span>Admin</span> / <span className="font-medium text-[#1B3B2D]">Storage</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1B3B2D]" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
          Storage & File Management
        </h1>
        <p className="text-gray-600 mt-2">Monitor your organization's storage usage</p>
      </div>

      {/* Storage Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Used */}
        <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600 font-medium">Total Storage Used</p>
          <p className="text-3xl font-bold text-[#1B3B2D] mt-2">
            {usedGB.toFixed(1)} GB
          </p>
          <p className="text-xs text-gray-500 mt-1">of {totalGB.toFixed(1)} GB</p>
        </div>

        {/* Usage Percentage */}
        <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600 font-medium">Usage</p>
          <p className="text-3xl font-bold text-[#1B3B2D] mt-2">
            {usagePercent.toFixed(1)}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-[#25a18e] h-2 rounded-full transition-all"
              style={{ width: `${usagePercent}%` }}
            ></div>
          </div>
        </div>

        {/* Per-File Limit */}
        <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600 font-medium">Per-File Size Limit</p>
          <p className="text-3xl font-bold text-[#1B3B2D] mt-2">
            {limitMB.toFixed(0)} MB
          </p>
          <p className="text-xs text-gray-500 mt-1">Maximum file size</p>
        </div>
      </div>

      {/* Storage Usage Progress */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-[#1B3B2D] mb-4">Storage Progress</h3>
        <div className="space-y-3">
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#25a18e] to-[#0f3c35] h-6 rounded-full transition-all flex items-center justify-end pr-3"
              style={{ width: `${usagePercent}%` }}
            >
              {usagePercent > 10 && (
                <span className="text-xs font-semibold text-white">
                  {usagePercent.toFixed(0)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{usedGB.toFixed(2)} GB used</span>
            <span>{(stats.total / 1024 / 1024 / 1024 - usedGB).toFixed(2)} GB available</span>
          </div>
        </div>
      </div>

      {/* Storage Breakdown */}
      {stats.breakdown.length > 0 && (
        <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-[#1B3B2D] mb-4">Storage Breakdown by Project</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.breakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="size" fill="#25a18e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* File Type Distribution */}
      {stats.fileTypeDistribution.length > 0 && (
        <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-[#1B3B2D] mb-4">File Type Distribution</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.fileTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.fileTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Storage Details Table */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#e2e5e5]">
          <h3 className="font-semibold text-[#1B3B2D]">Storage Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f6f5f0] border-b border-[#e2e5e5]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">Metric</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#e2e5e5]">
                <td className="px-6 py-4 text-sm text-[#1B3B2D]">Total Storage Allocated</td>
                <td className="px-6 py-4 text-sm text-gray-600">{totalGB.toFixed(2)} GB</td>
              </tr>
              <tr className="border-b border-[#e2e5e5] bg-[#f6f5f0]">
                <td className="px-6 py-4 text-sm text-[#1B3B2D]">Used Storage</td>
                <td className="px-6 py-4 text-sm text-gray-600">{usedGB.toFixed(2)} GB</td>
              </tr>
              <tr className="border-b border-[#e2e5e5]">
                <td className="px-6 py-4 text-sm text-[#1B3B2D]">Available Storage</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {(totalGB - usedGB).toFixed(2)} GB
                </td>
              </tr>
              <tr className="border-b border-[#e2e5e5] bg-[#f6f5f0]">
                <td className="px-6 py-4 text-sm text-[#1B3B2D]">Per-File Size Limit</td>
                <td className="px-6 py-4 text-sm text-gray-600">{limitMB.toFixed(0)} MB</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-[#1B3B2D]">Usage Percentage</td>
                <td className="px-6 py-4 text-sm text-gray-600">{usagePercent.toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
