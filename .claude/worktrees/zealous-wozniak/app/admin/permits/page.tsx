'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface PermitStats {
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
}

interface Permit {
  id: string;
  title: string;
  organization: string;
  jurisdiction: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#E5E7EB', text: '#1F2937' },
  submitted: { bg: '#DBEAFE', text: '#1E40AF' },
  approved: { bg: '#DCFCE7', text: '#166534' },
  rejected: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function PermitsPage() {
  const [stats, setStats] = useState<PermitStats | null>(null);
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, permitsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/permits'),
        ]);

        if (!statsRes.ok || !permitsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const statsData = await statsRes.json();
        const permitsData = await permitsRes.json();

        setStats(statsData.permits || {});
        setPermits(permitsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalPermits = stats
    ? Object.values(stats).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
            Permits
          </h1>
          <p className="text-gray-600">Overview of all permits across the platform</p>
        </div>

        {error && (
          <Card className="mb-6 border p-4" style={{ borderColor: '#E8E0D0', backgroundColor: '#FEE2E2' }}>
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {stats && (
                <>
                  <Card className="border p-6" style={{ borderColor: '#E8E0D0' }}>
                    <p className="text-gray-600 text-sm">Draft</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#1B3B2D' }}>
                      {stats.draft}
                    </p>
                    <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${totalPermits > 0 ? (stats.draft / totalPermits) * 100 : 0}%`,
                          backgroundColor: '#9CA3AF',
                        }}
                      />
                    </div>
                  </Card>

                  <Card className="border p-6" style={{ borderColor: '#E8E0D0' }}>
                    <p className="text-gray-600 text-sm">Submitted</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#1B3B2D' }}>
                      {stats.submitted}
                    </p>
                    <div className="mt-4 bg-blue-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${totalPermits > 0 ? (stats.submitted / totalPermits) * 100 : 0}%`,
                          backgroundColor: '#3B82F6',
                        }}
                      />
                    </div>
                  </Card>

                  <Card className="border p-6" style={{ borderColor: '#E8E0D0' }}>
                    <p className="text-gray-600 text-sm">Approved</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#1B3B2D' }}>
                      {stats.approved}
                    </p>
                    <div className="mt-4 bg-green-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${totalPermits > 0 ? (stats.approved / totalPermits) * 100 : 0}%`,
                          backgroundColor: '#22C55E',
                        }}
                      />
                    </div>
                  </Card>

                  <Card className="border p-6" style={{ borderColor: '#E8E0D0' }}>
                    <p className="text-gray-600 text-sm">Rejected</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#1B3B2D' }}>
                      {stats.rejected}
                    </p>
                    <div className="mt-4 bg-red-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${totalPermits > 0 ? (stats.rejected / totalPermits) * 100 : 0}%`,
                          backgroundColor: '#EF4444',
                        }}
                      />
                    </div>
                  </Card>
                </>
              )}
            </div>

            <Card className="border overflow-hidden" style={{ borderColor: '#E8E0D0' }}>
              <div className="p-6 border-b" style={{ borderColor: '#E8E0D0' }}>
                <h2 className="text-lg font-semibold" style={{ color: '#1B3B2D' }}>
                  Recent Permits
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#F5F3F0', borderBottom: '1px solid #E8E0D0' }}>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                        Organization
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                        Jurisdiction
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {permits.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          No permits found
                        </td>
                      </tr>
                    ) : (
                      permits.map((permit) => (
                        <tr key={permit.id} style={{ borderBottom: '1px solid #E8E0D0' }} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium" style={{ color: '#1B3B2D' }}>
                            {permit.title}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {permit.organization}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {permit.jurisdiction}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Badge
                              style={{
                                backgroundColor: statusColors[permit.status].bg,
                                color: statusColors[permit.status].text,
                              }}
                            >
                              {permit.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(permit.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
