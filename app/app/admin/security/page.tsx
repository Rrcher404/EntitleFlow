'use client';

import { useEffect, useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';

interface SecurityPolicy {
  resetLinkDuration: number;
  forceResetSchedule: number;
  minPasswordLength: number;
  requireUppercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
}

const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-32 bg-gray-200 rounded-xl"></div>
    <div className="h-40 bg-gray-200 rounded-xl"></div>
  </div>
);

export default function SecurityPage() {
  const [policy, setPolicy] = useState<SecurityPolicy>({
    resetLinkDuration: 24,
    forceResetSchedule: 90,
    minPasswordLength: 12,
    requireUppercase: true,
    requireNumber: true,
    requireSpecialChar: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch('/api/company-admin/security');
        if (!response.ok) throw new Error('Failed to fetch security policy');
        const data = await response.json();
        setPolicy(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch('/api/company-admin/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });

      if (!response.ok) throw new Error('Failed to save policy');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SecurityPolicy, value: string | number | boolean) => {
    setPolicy((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600">
        <span>Admin</span> / <span className="font-medium text-[#1B3B2D]">Security</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1B3B2D]" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
          Password & Security Policies
        </h1>
        <p className="text-gray-600 mt-2">Configure organization-wide security settings</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
          Policy saved successfully
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Password Policy Settings */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm space-y-6">
        <div>
          <h3 className="font-semibold text-[#1B3B2D] mb-4">Password Requirements</h3>
          <div className="space-y-4">
            {/* Min Password Length */}
            <div>
              <label className="block text-sm font-medium text-[#1B3B2D] mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                min="8"
                max="32"
                value={policy.minPasswordLength}
                onChange={(e) => handleChange('minPasswordLength', parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-[#e2e5e5] focus:outline-none focus:ring-2 focus:ring-[#25a18e]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Require passwords to be at least this many characters
              </p>
            </div>

            {/* Character Requirements */}
            <div className="pt-4 border-t border-[#e2e5e5]">
              <p className="text-sm font-medium text-[#1B3B2D] mb-3">Character Requirements</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.requireUppercase}
                    onChange={(e) => handleChange('requireUppercase', e.target.checked)}
                    className="w-4 h-4 rounded border-[#e2e5e5] text-[#25a18e] focus:ring-2 focus:ring-[#25a18e]"
                  />
                  <span className="text-sm text-gray-700">Require uppercase letters (A-Z)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.requireNumber}
                    onChange={(e) => handleChange('requireNumber', e.target.checked)}
                    className="w-4 h-4 rounded border-[#e2e5e5] text-[#25a18e] focus:ring-2 focus:ring-[#25a18e]"
                  />
                  <span className="text-sm text-gray-700">Require numbers (0-9)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.requireSpecialChar}
                    onChange={(e) => handleChange('requireSpecialChar', e.target.checked)}
                    className="w-4 h-4 rounded border-[#e2e5e5] text-[#25a18e] focus:ring-2 focus:ring-[#25a18e]"
                  />
                  <span className="text-sm text-gray-700">Require special characters (!@#$%)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Reset & Expiration */}
        <div className="pt-6 border-t border-[#e2e5e5]">
          <h3 className="font-semibold text-[#1B3B2D] mb-4">Password Reset & Expiration</h3>
          <div className="space-y-4">
            {/* Reset Link Duration */}
            <div>
              <label className="block text-sm font-medium text-[#1B3B2D] mb-2">
                Password Reset Link Duration
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={policy.resetLinkDuration}
                  onChange={(e) => handleChange('resetLinkDuration', parseInt(e.target.value))}
                  className="w-24 px-4 py-2 rounded-lg border border-[#e2e5e5] focus:outline-none focus:ring-2 focus:ring-[#25a18e]"
                />
                <span className="text-sm text-gray-600">hours</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                How long reset links remain valid
              </p>
            </div>

            {/* Force Reset Schedule */}
            <div>
              <label className="block text-sm font-medium text-[#1B3B2D] mb-2">
                Force Password Reset Every
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={policy.forceResetSchedule}
                  onChange={(e) => handleChange('forceResetSchedule', parseInt(e.target.value))}
                  className="w-24 px-4 py-2 rounded-lg border border-[#e2e5e5] focus:outline-none focus:ring-2 focus:ring-[#25a18e]"
                />
                <span className="text-sm text-gray-600">days (0 = disabled)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Set to 0 to disable forced password resets
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Password Reset */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-[#1B3B2D]">Bulk Password Reset</h3>
            <p className="text-sm text-gray-600 mt-1">
              Force all users to reset their passwords on next login
            </p>
          </div>
          <button className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
            Reset All Passwords
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#0f3c35] text-white px-6 py-2 rounded-lg hover:bg-[#0a2a24] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Password policy changes apply to all new passwords going forward. Existing passwords remain valid until next reset.
        </p>
      </div>
    </div>
  );
}
