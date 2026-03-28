'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MoreHorizontal, ChevronDown, Check, X, Clock, CheckCircle2, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type LicenseType = 'admin' | 'project_manager' | 'contributor' | 'guest_viewer';
type UserRole = 'admin' | 'manager' | 'contributor' | 'viewer';
type RequestStatus = 'pending' | 'approved' | 'rejected' | 'applied';

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

interface LicenseRequest {
  id: string;
  user_id: string;
  user_name: string;
  current_license: LicenseType | null;
  requested_license: LicenseType;
  status: RequestStatus;
  submitted_at: string;
  reviewed_at?: string;
  review_notes?: string;
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

// Toast notification component
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const SimpleToast = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-emerald-50 border-emerald-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  }[toast.type];

  const textColor = {
    success: 'text-emerald-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  }[toast.type];

  return (
    <div className={`border ${bgColor} rounded-lg px-4 py-3 flex items-center justify-between animate-slide-in-right`}>
      <p className={`text-sm font-medium ${textColor}`}>{toast.message}</p>
      <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const LicenseTypeSelector = ({
  userId,
  currentLicense,
  hasPendingRequest,
  pendingRequestedType,
  onRequestSubmitted,
  onToast,
  disabled,
}: {
  userId: string;
  currentLicense: LicenseType | null;
  hasPendingRequest: boolean;
  pendingRequestedType?: LicenseType;
  onRequestSubmitted: () => void;
  onToast: (message: string, type: 'success' | 'error') => void;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const licenseOptions: { value: LicenseType; label: string; price: string }[] = [
    { value: 'admin', label: 'Admin', price: '$99/mo' },
    { value: 'project_manager', label: 'Project Manager', price: '$49/mo' },
    { value: 'contributor', label: 'Contributor', price: '$29/mo' },
    { value: 'guest_viewer', label: 'Guest Viewer', price: 'Free' },
  ];

  const handleLicenseChange = async (newLicense: LicenseType) => {
    if (newLicense === currentLicense || hasPendingRequest) {
      setIsOpen(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/company-admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_type: newLicense }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }

      onToast('License change request submitted for approval', 'success');
      onRequestSubmitted();
      setIsOpen(false);
    } catch (err) {
      onToast(
        err instanceof Error ? err.message : 'Failed to submit request',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            disabled={disabled || isSubmitting || hasPendingRequest}
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
              disabled={isSubmitting}
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

      {hasPendingRequest && pendingRequestedType && (
        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
          Pending: → {getLicenseLabel(pendingRequestedType)}
        </span>
      )}
    </div>
  );
};

const getLicenseLabel = (license: LicenseType): string => {
  const labels: Record<LicenseType, string> = {
    admin: 'Admin',
    project_manager: 'Project Manager',
    contributor: 'Contributor',
    guest_viewer: 'Guest Viewer',
  };
  return labels[license] || license;
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
    ))}
  </div>
);

const RequestStatusBadge = ({ status }: { status: RequestStatus }) => {
  const config: Record<RequestStatus, { bg: string; text: string; icon: React.ReactNode }> = {
    pending: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      icon: <Clock className="w-4 h-4" />,
    },
    approved: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    applied: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: <XCircle className="w-4 h-4" />,
    },
  };

  const cfg = config[status];
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
};

const RecentRequestsSection = ({ requests }: { requests: LicenseRequest[] }) => {
  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#e2e5e5] bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#e2e5e5] bg-[#f6f5f0]">
        <h2 className="text-lg font-semibold text-[#1B3B2D]" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
          Recent License Change Requests
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-[#e2e5e5] bg-[#f6f5f0]">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">User</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">Change</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">Submitted</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[#1B3B2D]">Review Notes</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request, index) => (
              <tr key={request.id} className={index % 2 === 0 ? '' : 'bg-[#f6f5f0]'}>
                <td className="px-6 py-4 text-sm text-[#1B3B2D] font-medium">{request.user_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {getLicenseLabel(request.current_license as LicenseType || 'guest_viewer')} → {getLicenseLabel(request.requested_license)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <RequestStatusBadge status={request.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(request.submitted_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {request.review_notes ? (
                    <span className="text-red-600 italic">{request.review_notes}</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function UsersPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleFilter = searchParams.get('role');

  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [licenseFilter, setLicenseFilter] = useState<'all' | LicenseType>('all');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({
      id: Math.random().toString(),
      message,
      type,
    });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, requestsRes] = await Promise.all([
          fetch('/api/company-admin/users'),
          fetch('/api/company-admin/license-requests?status=pending'),
        ]);

        if (!usersRes.ok) throw new Error('Failed to fetch users');
        const usersData = await usersRes.json();
        setUsers(usersData);

        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setRequests(requestsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRequestSubmitted = useCallback(() => {
    // Re-fetch pending requests
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/company-admin/license-requests?status=pending');
        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        }
      } catch (err) {
        console.error('Failed to refresh requests:', err);
      }
    };
    fetchRequests();
  }, []);

  const getPendingRequestForUser = (userId: string): LicenseRequest | undefined => {
    return requests.find((req) => req.user_id === userId && req.status === 'pending');
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
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 w-96 animate-slide-in-right">
          <SimpleToast toast={toast} onClose={closeToast} />
        </div>
      )}

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
          Manage all users in your organization. License changes require approval from the super-admin.
        </p>
      </div>

      {/* Recent Requests Section */}
      {requests.length > 0 && (
        <RecentRequestsSection requests={requests} />
      )}

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
                {filteredUsers.map((user, index) => {
                  const pendingRequest = getPendingRequestForUser(user.id);
                  return (
                    <tr key={user.id} className={index % 2 === 0 ? '' : 'bg-[#f6f5f0]'}>
                      <td className="px-6 py-4 text-sm text-[#1B3B2D] font-medium">{user.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <LicenseTypeSelector
                          userId={user.id}
                          currentLicense={user.license_type}
                          hasPendingRequest={!!pendingRequest}
                          pendingRequestedType={pendingRequest?.requested_license}
                          onRequestSubmitted={handleRequestSubmitted}
                          onToast={showToast}
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
                  );
                })}
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
