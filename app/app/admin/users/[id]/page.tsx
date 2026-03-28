'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Key, Shield } from 'lucide-react';
import Link from 'next/link';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  license: string;
  avatar?: string;
  status: 'active' | 'inactive';
  permissions: string[];
  activity: Array<{
    timestamp: string;
    action: string;
    details: string;
  }>;
}

const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-32 bg-gray-200 rounded-xl"></div>
    <div className="h-64 bg-gray-200 rounded-xl"></div>
  </div>
);

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/company-admin/users/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user');
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        Error loading user: {error}
      </div>
    );
  }

  if (loading) return <LoadingSkeleton />;
  if (!user) return <div>User not found</div>;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/app/admin/users" className="hover:text-[#1B3B2D]">
          Users
        </Link>
        <span>/</span>
        <span className="font-medium text-[#1B3B2D]">{user.name}</span>
      </div>

      {/* Back Button */}
      <Link
        href="/app/admin/users"
        className="inline-flex items-center gap-2 text-[#0f3c35] hover:text-[#1B3B2D] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      {/* User Profile Card */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#f6f5f0] flex items-center justify-center text-2xl font-bold text-[#0f3c35]">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B3B2D]">{user.name}</h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#e2e5e5]">
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">License Type</p>
            <p className="text-lg font-semibold text-[#1B3B2D] mt-1">{user.license}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">Role</p>
            <p className="text-lg font-semibold text-[#1B3B2D] mt-1 capitalize">{user.role}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">Status</p>
            <p className="text-lg font-semibold text-[#1B3B2D] mt-1">{user.status}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-[#1B3B2D] mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e2e5e5] text-[#1B3B2D] hover:bg-[#f6f5f0] transition-colors">
            <Key className="w-4 h-4" />
            Reset Password
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e2e5e5] text-[#1B3B2D] hover:bg-[#f6f5f0] transition-colors">
            <Shield className="w-4 h-4" />
            Change License
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
            Deactivate
          </button>
        </div>
      </div>

      {/* Permissions */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-[#1B3B2D] mb-4">Permissions</h3>
        <div className="grid grid-cols-2 gap-4">
          {user.permissions.map((permission) => (
            <div key={permission} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border-2 border-[#25a18e] bg-[#25a18e] flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">{permission}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity History */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-[#1B3B2D] mb-4">Activity History</h3>
        <div className="space-y-3">
          {user.activity.slice(0, 10).map((item, index) => (
            <div key={index} className="flex items-between justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1B3B2D]">{item.action}</p>
                <p className="text-xs text-gray-600">{item.details}</p>
              </div>
              <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
