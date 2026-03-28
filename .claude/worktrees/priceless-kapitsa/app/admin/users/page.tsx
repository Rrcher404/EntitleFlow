'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, Search } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface ExpandedUser extends User {
  expanded?: boolean;
  org?: {
    id: string;
    name: string;
    type: string;
    members: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<ExpandedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetchUsers = async (searchQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = searchQuery
        ? `/api/admin/users?search=${encodeURIComponent(searchQuery)}`
        : '/api/admin/users';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers(value);
    }, 300);
  };

  const toggleExpanded = (userId: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedIds(newExpanded);
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
            Users
          </h1>
          <p className="text-gray-600">Manage platform users and permissions</p>
        </div>

        <Card className="mb-6 border" style={{ borderColor: '#E8E0D0' }}>
          <div className="p-6">
            <div className="flex items-center gap-2">
              <Search size={20} style={{ color: '#1B3B2D' }} />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1"
                style={{
                  borderColor: '#E8E0D0',
                }}
              />
            </div>
          </div>
        </Card>

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
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#F5F3F0', borderBottom: '1px solid #E8E0D0' }}>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Organization
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <div key={user.id}>
                      <tr
                        onClick={() => toggleExpanded(user.id)}
                        style={{ borderBottom: '1px solid #E8E0D0', cursor: 'pointer' }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm" style={{ color: '#1B3B2D' }}>
                          <div className="flex items-center gap-2">
                            <ChevronDown
                              size={16}
                              className={`transition-transform ${
                                expandedIds.has(user.id) ? 'rotate-180' : ''
                              }`}
                            />
                            {user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: '#F5F3F0',
                              color: '#1B3B2D',
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {user.organization.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                      {expandedIds.has(user.id) && (
                        <tr style={{ borderBottom: '1px solid #E8E0D0', backgroundColor: '#F5F3F0' }}>
                          <td colSpan={5} className="px-6 py-4">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold" style={{ color: '#1B3B2D' }}>
                                  Organization Details
                                </h4>
                                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-600">Org ID</p>
                                    <p style={{ color: '#1B3B2D' }}>
                                      {user.organization.id}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Org Name</p>
                                    <p style={{ color: '#1B3B2D' }}>
                                      {user.organization.name}
                                    </p>
                                  </div>
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
