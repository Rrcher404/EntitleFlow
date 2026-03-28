'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface AuditLog {
  id: string;
  admin: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/audit');
        if (!res.ok) throw new Error('Failed to fetch audit logs');
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('remove')) {
      return { bg: '#FEE2E2', text: '#991B1B' };
    }
    if (action.includes('create') || action.includes('add')) {
      return { bg: '#DCFCE7', text: '#166534' };
    }
    if (action.includes('update') || action.includes('edit')) {
      return { bg: '#DBEAFE', text: '#1E40AF' };
    }
    return { bg: '#F3E8FF', text: '#6D28D9' };
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
            Audit Trail
          </h1>
          <p className="text-gray-600">Read-only audit log of admin actions</p>
        </div>

        {error && (
          <Card className="mb-6 border p-4" style={{ borderColor: '#E8E0D0', backgroundColor: '#FEE2E2' }}>
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        <Card className="border overflow-hidden" style={{ borderColor: '#E8E0D0' }}>
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No audit logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#F5F3F0', borderBottom: '1px solid #E8E0D0' }}>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Admin
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Action
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Target
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const actionColor = getActionColor(log.action);
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #E8E0D0' }} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: '#1B3B2D' }}>
                          {log.admin}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge
                            style={{
                              backgroundColor: actionColor.bg,
                              color: actionColor.text,
                            }}
                          >
                            {log.action}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {log.target}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                          {log.details}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {!loading && logs.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {logs.length} audit log entries
          </div>
        )}
      </div>
    </div>
  );
}
