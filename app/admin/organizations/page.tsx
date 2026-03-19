'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  type: string;
  members: number;
  projects: number;
  permits: number;
  createdAt: string;
}

interface ExpandedOrg extends Organization {
  memberList?: string[];
  recentProjects?: string[];
}

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<ExpandedOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchOrgs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/organizations');
        if (!res.ok) throw new Error('Failed to fetch organizations');
        const data = await res.json();
        setOrgs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching organizations');
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, []);

  const toggleExpanded = (orgId: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedIds(newExpanded);
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
            Organizations
          </h1>
          <p className="text-gray-600">View and manage organizations</p>
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
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : orgs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No organizations found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#F5F3F0', borderBottom: '1px solid #E8E0D0' }}>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Organization Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Members
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Projects
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Permits
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.map((org) => (
                    <div key={org.id}>
                      <tr
                        onClick={() => toggleExpanded(org.id)}
                        style={{ borderBottom: '1px solid #E8E0D0', cursor: 'pointer' }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm" style={{ color: '#1B3B2D' }}>
                          <div className="flex items-center gap-2">
                            <ChevronDown
                              size={16}
                              className={`transition-transform ${
                                expandedIds.has(org.id) ? 'rotate-180' : ''
                              }`}
                            />
                            {org.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: '#F5F3F0',
                              color: '#1B3B2D',
                            }}
                          >
                            {org.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {org.members}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {org.projects}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {org.permits}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                      {expandedIds.has(org.id) && (
                        <tr style={{ borderBottom: '1px solid #E8E0D0', backgroundColor: '#F5F3F0' }}>
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-8">
                              <div>
                                <h4 className="font-semibold mb-3" style={{ color: '#1B3B2D' }}>
                                  Members
                                </h4>
                                <div className="space-y-2 text-sm">
                                  {org.memberList && org.memberList.length > 0 ? (
                                    org.memberList.map((member, idx) => (
                                      <div key={idx} className="text-gray-700">
                                        {member}
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-gray-500">No members</p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-3" style={{ color: '#1B3B2D' }}>
                                  Recent Projects
                                </h4>
                                <div className="space-y-2 text-sm">
                                  {org.recentProjects && org.recentProjects.length > 0 ? (
                                    org.recentProjects.map((project, idx) => (
                                      <div key={idx} className="text-gray-700">
                                        {project}
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-gray-500">No projects</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </div>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
