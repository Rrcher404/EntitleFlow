'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MoreHorizontal, ChevronDown } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  licenseType: 'pro' | 'standard' | 'basic' | 'free';
  role: 'admin' | 'manager' | 'contributor' | 'viewer';
  lastActive: string;
  status: 'active' | 'inactive' | 'pending';
}

const LicenseBadge = ({ type }: { type: string }) => {
  const colors: Record<string, { bg: string; text: string }> = {
    pro: { bg: 'bg-purple-100', text: 'text-purple-700' },
    standard: { bg: 'bg-blue-100', text: 'text-blue-700' },
    basic: { bg: 'bg-green-100', text: 'text-green-700' },
    free: { bg: 'bg-gray-100', text: 'text-gray-700' },
  };

  const color = colors[type] || colors.free;

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${color.bg} ${color.text}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, { bg: string; text: string }> = {
    active: { bg: 'bg-green-100', text: 'text-green-700' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-700' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  };

  const color = colors[status] || colors.inactive;

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${color.bg} ${color.text}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
    ))}
  </div>
);

export default function UsersPage() {
  const searchParams = useSearchParams();
  const roleFilter = searchParams.get('role');

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [licenseFilter, setLicenseFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/company-admin/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesLicense = licenseFilter === 'all' || user.licenseType === licenseFilter;

      return matchesSearch && matchesRole && matchesLicense;
    });
  }, [users, searchTerm, roleFilter, licenseFilter]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        Error loading users: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600">
        <span>Admin</span> / <span className="font-medium text-[#1B3B2D]">Users</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1B3B2D]" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
          User Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage all users in your organization
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#e2e5e5] focus:outline-none focus:ring-2 focus:ring-[#25a18e]"
              />
            </div>
            <div className="relative">
              <select
                value={licenseFilter}
                onChange={(e) => setLicenseFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-[#e2e5e5] focus:outline-none focus:ring-2 focus:ring-[#25a18e]"
              >
                <option value="all">All Licenses</option>
                <option value="pro">Pro</option>
                <option value="standard">Standard</option>
                <option value="basic">Basic</option>
                <option value="free">Free</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 pointer-events-none text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-600">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#e2e5e5] bg-[#f6f5f0]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">License Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">Last Active</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? '' : 'bg-[#f6f5f0]'}>
                    <td className="px-6 py-4 text-sm text-[#1B3B2D] font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <LicenseBadge type={user.licenseType} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{user.role}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.lastActive).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
}
