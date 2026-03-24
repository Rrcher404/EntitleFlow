'use client';

import { useEffect, useState } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface LicensePermissions {
  licenseType: string;
  permissions: Record<string, boolean>;
}

interface PermissionOverride {
  userId: string;
  userName: string;
  permission: string;
  granted: boolean;
  overridden: boolean;
}

const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-64 bg-gray-200 rounded-xl"></div>
    <div className="h-96 bg-gray-200 rounded-xl"></div>
  </div>
);

const PermissionIcon = ({ granted, overridden }: { granted: boolean; overridden?: boolean }) => {
  if (overridden) {
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  }
  if (granted) {
    return <Check className="w-5 h-5 text-green-600" />;
  }
  return <X className="w-5 h-5 text-red-600" />;
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [licensePermissions, setLicensePermissions] = useState<LicensePermissions[]>([]);
  const [overrides, setOverrides] = useState<PermissionOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'licenses' | 'overrides'>('licenses');

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/company-admin/permissions');
        if (!response.ok) throw new Error('Failed to fetch permissions');
        const data = await response.json();
        setPermissions(data.permissions || []);
        setLicensePermissions(data.licensePermissions || []);
        setOverrides(data.overrides || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        Error loading permissions: {error}
      </div>
    );
  }

  if (loading) return <LoadingSkeleton />;

  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600">
        <span>Admin</span> / <span className="font-medium text-[#1B3B2D]">Permissions</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1B3B2D]" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
          Permission Management
        </h1>
        <p className="text-gray-600 mt-2">Configure permissions for different license types and users</p>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white shadow-sm">
        <div className="flex border-b border-[#e2e5e5]">
          <button
            onClick={() => setActiveTab('licenses')}
            className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'licenses'
                ? 'border-[#0f3c35] text-[#0f3c35]'
                : 'border-transparent text-gray-600 hover:text-[#1B3B2D]'
            }`}
          >
            License Types
          </button>
          <button
            onClick={() => setActiveTab('overrides')}
            className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overrides'
                ? 'border-[#0f3c35] text-[#0f3c35]'
                : 'border-transparent text-gray-600 hover:text-[#1B3B2D]'
            }`}
          >
            User Overrides
          </button>
        </div>

        {/* License Types Tab */}
        {activeTab === 'licenses' && (
          <div className="p-6 space-y-6">
            {licensePermissions.map((license) => (
              <div key={license.licenseType}>
                <h3 className="font-semibold text-[#1B3B2D] mb-4 capitalize">
                  {license.licenseType} License
                </h3>

                {categories.map((category) => {
                  const categoryPerms = permissions.filter((p) => p.category === category);
                  if (categoryPerms.length === 0) return null;

                  return (
                    <div key={category} className="mb-6 ml-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 capitalize">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categoryPerms.map((perm) => (
                          <div key={perm.id} className="flex items-start gap-3 p-3 rounded-lg border border-[#e2e5e5] bg-[#f6f5f0]">
                            <div className="mt-1">
                              {license.permissions[perm.id] ? (
                                <Check className="w-5 h-5 text-green-600" />
                              ) : (
                                <X className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#1B3B2D]">{perm.name}</p>
                              <p className="text-xs text-gray-600">{perm.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="border-t border-[#e2e5e5] mt-6 pt-6" />
              </div>
            ))}
          </div>
        )}

        {/* User Overrides Tab */}
        {activeTab === 'overrides' && (
          <div className="p-6">
            {overrides.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                No permission overrides configured
              </div>
            ) : (
              <div className="space-y-4">
                {overrides.map((override) => (
                  <div key={`${override.userId}-${override.permission}`} className="flex items-center justify-between p-4 rounded-lg border border-[#e2e5e5] bg-[#f6f5f0]">
                    <div className="flex items-center gap-3">
                      <PermissionIcon
                        granted={override.granted}
                        overridden={override.overridden}
                      />
                      <div>
                        <p className="text-sm font-medium text-[#1B3B2D]">
                          {override.userName}
                        </p>
                        <p className="text-xs text-gray-600">{override.permission}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs rounded border border-[#e2e5e5] text-[#1B3B2D] hover:bg-white transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-xs rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-[#1B3B2D] mb-4">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-700">Permission Granted</span>
          </div>
          <div className="flex items-center gap-3">
            <X className="w-5 h-5 text-red-600" />
            <span className="text-sm text-gray-700">Permission Denied</span>
          </div>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-gray-700">Override Active</span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Permission Hierarchy</p>
          <p className="mt-1">
            User overrides take precedence over license type permissions. Overridden permissions are marked with a yellow indicator.
          </p>
        </div>
      </div>
    </div>
  );
}
