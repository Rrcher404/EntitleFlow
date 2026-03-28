'use client';

import { useEffect, useState, useMemo } from 'react';
import { Filter, Download } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
    ))}
  </div>
);

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const params = new URLSearchParams();
        if (dateFrom) params.append('from', dateFrom);
        if (dateTo) params.append('to', dateTo);
        if (userFilter) params.append('user', userFilter);
        if (actionFilter) params.append('action', actionFilter);
        if (resourceFilter) params.append('resource', resourceFilter);

        const response = await fetch(`/api/company-admin/audit?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch audit logs');
        const data = await response.json();
        setLogs(data);
        setCurrentPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [dateFrom, dateTo, userFilter, actionFilter, resourceFilter]);

  const filteredLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return logs.slice(start, start + itemsPerPage);
  }, [logs, currentPage]);

  const totalPages = Math.ceil(logs.length / itemsPerPage);

  const handleExport = async (format: 'csv' | 'xlsx' | 'md') => {
    setExporting(true);
    try {
      const data = JSON.stringify(logs);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log.${format === 'xlsx' ? 'xlsx' : format === 'md' ? 'md' : 'csv'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        Error loading audit logs: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600">
        <span>Admin</span> / <span className="font-medium text-[#1B3B2D]">Audit Trail</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1B3B2D]" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
            Audit Trail & Reports
          </h1>
          <p className="text-gray-600 mt-2">Track all activities in your organization</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e2e5e5] text-[#1B3B2D] hover:bg-[#f6f5f0] transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e2e5e5] text-[#1B3B2D] hover:bg-[#f6f5f0] transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={() => handleExport('md')}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e2e5e5] text-[#1B3B2D] hover:bg-[#f6f5f0] transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Markdown
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-[#1B3B2D]">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date From */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#e2e5e5] focus:outline-none focus:ring-2 focus:ring-[#25a18e]"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#e2e5e5] focus:outline-none focus:ring-2 focus:ring-[#25a18e]"
            />
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">User</label>
            <input
              type="text"
              placeholder="Filter by user"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#e2e5e5] focus:outline-none focus:ring-2 focus:ring-[#25a18e]"
            />
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Action</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="appearance-none w-full px-3 py-2 rounded-lg border border-[#e2e5e5] focus:outline-none focus:ring-2 focus:ring-[#25a18e]"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>
          </div>

          {/* Resource Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Resource</label>
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="appearance-none w-full px-3 py-2 rounded-lg border border-[#e2e5e5] focus:outline-none focus:ring-2 focus:ring-[#25a18e]"
            >
              <option value="">All Resources</option>
              <option value="user">User</option>
              <option value="project">Project</option>
              <option value="permission">Permission</option>
              <option value="setting">Setting</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-600">
            No audit logs found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#e2e5e5] bg-[#f6f5f0]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">Timestamp</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">Action</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">Resource</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => (
                  <tr key={log.id} className={index % 2 === 0 ? '' : 'bg-[#f6f5f0]'}>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#1B3B2D] font-medium">{log.user}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.resource}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredLogs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, logs.length)} of {logs.length} logs
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-[#e2e5e5] text-sm text-[#1B3B2D] hover:bg-[#f6f5f0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentPage === i + 1
                      ? 'bg-[#0f3c35] text-white'
                      : 'border border-[#e2e5e5] text-[#1B3B2D] hover:bg-[#f6f5f0]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-[#e2e5e5] text-sm text-[#1B3B2D] hover:bg-[#f6f5f0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
