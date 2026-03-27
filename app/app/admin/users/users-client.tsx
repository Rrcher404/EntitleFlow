'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MoreHorizontal, ChevronDown, Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type LicenseType = 'admin' | 'project_manager' | 'contributor' | 'guest_viewer';
type UserRole = 'admin' | 'manager' | 'contributor' | 'viewer';
type UserStatus = 'active' | 'inactive' | 'pending';

interface User {
  id: string;
  full_name: string;
  email: string;
  license_type: LicenseType | null;
  role: UserRole | null;
  last_seen_at: string | null;
  is_active: boolean | null;
  created_at: string;
}

const LicenseBadge = ({ type }: { type: LicenseType | null }) => {
  const licenseConfig: Record<LicenseType, { bg: string; text: string; label: string }> = {
    admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin' },
    project_manager: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Project Manager' },
    contributor: { bg: 'bg-green-100', text: 'text-green-700', label: 'Contributor' },
    guest_viewer: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Guest Viewer' },
  };

  if (!type) {
    return (
      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
        Unassigned
      </span>
    );
  }

  const config = licenseConfig[type] || licenseConfig.guest_viewer;

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

const StatusBadge = ({ isActive }: { isActive: boolean | null }) => {
  const status = isActive ? 'active' : 'inactive';
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

const LicenseTypeSelector = ({
  userId,
  currentLicense,
  onUpdate,
  disabled,
}: {
  userId: string;
  currentLicense: LicenseType | null;
  onUpdate: (newLicense: LicenseType) => void;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const licenseOptions: { value: LicenseType; label: string; price: string }[] = [
    { value: 'admin', label: 'Admin', price: '$99/mo' },
    { value: 'project_manager', label: 'Project Manager', price: '$49/mo' },
    { value: 'contributor', label: 'Contributor', price: '$29/mo' },
    { value: 'guest_viewer', label: 'Guest Viewer', price: 'Free' },
  ];

  const handleLicenseChange = async (newLicense: LicenseType) => {
    if (newLicense === currentLicense) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/company-admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_type: newLicense }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update license');
      }

      onUpdate(newLicense);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            disabled={disabled || isUpdating}
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LicenseBadge type={currentLicense} />
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {licenseOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleLicenseChange(option.value)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-gray-500">{option.price}</div>
              </div>
              {currentLicense === option.value && (
                <Check className="w-4 h-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {error && (
        <div className="absolute top-full mt-1 left-0 bg-red-100 border border-red-300 text-red-800 text-xs px-2 py-1 rounded whitespace-nowrap z-50">
          {error}
        </div>
      )}
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
    ))}
  </div>
);

export default function UsersPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleFilter = searchParams.get('role');

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [licenseFilter, setLicenseFilter] = useState<'all' | LicenseType>('all');
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

  const handleLicenseUpdate = (userId: string, newLicense: LicenseType) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, license_type: newLicense } : user
      )
    );
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesLicense = licenseFilter === 'all' || user.license_type === licenseFilter;

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
                onChange={(e) => setLicenseFilter(e.target.value as 'all' | LicenseType)}
                className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-[#e2e5e5] focus:outline-none focus:ring-2 focus:ring-[#25a18e]"
              >
                <option value="all">All Licenses</option>
                <option value="admin">Admin</option>
                <option value="project_manager">Project Manager</option>
                <option value="contributor">Contributor</option>
                <option value="guest_viewer">Guest Viewer</option>
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
                    <td className="px-6 py-4 text-sm text-[#1B3B2D] font-medium">{user.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <LicenseTypeSelector
                        userId={user.id}
                        currentLicense={user.license_type}
                        onUpdate={(newLicense) => handleLicenseUpdate(user.id, newLicense)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{user.role || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.last_seen_at
                        ? new Date(user.last_seen_at).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge isActive={user.is_active} />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-gray-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/app/admin/users/${user.id}`)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('Reset Password - Coming soon')}>
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('Deactivate - Coming soon')}>
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
