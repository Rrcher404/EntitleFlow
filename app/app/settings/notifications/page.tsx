'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

// Define notification types with human-readable labels
// Keys must match the notification_type enum in the database exactly
const NOTIFICATION_TYPES = [
  { key: 'comment_assigned', label: 'Comment Assigned' },
  { key: 'comment_resolved', label: 'Comment Resolved' },
  { key: 'permit_status_changed', label: 'Permit Status Changed' },
  { key: 'deadline_approaching', label: 'Deadline Approaching' },
  { key: 'document_uploaded', label: 'Document Uploaded' },
  { key: 'team_invitation', label: 'Team Invitation' },
  { key: 'ai_parse_complete', label: 'AI Parse Complete' },
  { key: 'email_ingested', label: 'Email Ingested' },
  { key: 'mention', label: 'Mentions' },
];

interface NotificationPreference {
  id?: string;
  profile_id?: string;
  notification_type: string;
  in_app: boolean;
  email: boolean;
  email_digest: boolean;
  created_at?: string;
  updated_at?: string;
}

interface PreferencesState {
  [key: string]: {
    in_app: boolean;
    email: boolean;
    email_digest: boolean;
  };
}

export default function NotificationPreferencesPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<PreferencesState>({});
  const [dailyDigestEnabled, setDailyDigestEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [supabase] = useState(() => createClient());

  // Initialize default preferences
  const initializePreferences = () => {
    const defaultPrefs: PreferencesState = {};
    NOTIFICATION_TYPES.forEach((notif) => {
      defaultPrefs[notif.key] = {
        in_app: true,
        email: true,
        email_digest: true,
      };
    });
    return defaultPrefs;
  };

  // Load preferences from API
  useEffect(() => {
    const loadData = async () => {
      if (!supabase) {
        setMessage({ type: 'error', text: 'Supabase client not initialized' });
        setLoading(false);
        return;
      }

      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setMessage({ type: 'error', text: 'Session expired — please log in again' });
          setLoading(false);
          return;
        }

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile query error:', profileError.message);
          setMessage({ type: 'error', text: 'Could not load profile' });
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch notification preferences
        const { data: prefsData, error: prefsError } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('profile_id', user.id);

        if (prefsError) {
          console.error('Preferences query error:', prefsError.message);
          // Initialize with defaults if no preferences exist
          setPreferences(initializePreferences());
        } else if (prefsData && prefsData.length > 0) {
          // Convert array of preferences to object format
          const prefsMap: PreferencesState = {};
          prefsData.forEach((pref: any) => {
            prefsMap[pref.notification_type] = {
              in_app: pref.in_app !== false,
              email: pref.email !== false,
              email_digest: pref.email_digest !== false,
            };
          });
          // Ensure all notification types are present
          NOTIFICATION_TYPES.forEach((notif) => {
            if (!prefsMap[notif.key]) {
              prefsMap[notif.key] = {
                in_app: true,
                email: true,
                email_digest: true,
              };
            }
          });
          setPreferences(prefsMap);
        } else {
          setPreferences(initializePreferences());
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        setMessage({ type: 'error', text: `Failed to load preferences: ${msg}` });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  // Handle individual preference toggle
  const handleTogglePreference = (
    notificationType: string,
    channel: 'in_app' | 'email' | 'email_digest'
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [notificationType]: {
        ...prev[notificationType],
        [channel]: !prev[notificationType]?.[channel],
      },
    }));
  };

  // Handle save preferences
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !profile) return;

    setSaving(true);
    setMessage(null);

    try {
      // Save each preference via API route (uses admin client to bypass RLS)
      const entries = Object.entries(preferences);
      for (const [notificationType, prefs] of entries) {
        const res = await fetch('/api/notifications/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notification_type: notificationType,
            in_app: prefs.in_app,
            email: prefs.email,
            email_digest: prefs.email_digest,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to save preference');
        }
      }

      setMessage({ type: 'success', text: 'Notification preferences saved successfully' });
    } catch (error) {
      console.error('Error saving preferences:', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Failed to save preferences: ${msg}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">
            Notification Preferences
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage how and when you receive notifications.
          </p>
        </div>
        <div className="animate-pulse">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">
          Notification Preferences
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage how and when you receive notifications for different events.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Notification Types */}
        <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Notification Types
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose how you want to be notified for each event type.
              </p>
            </div>

            {/* Table header */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Event Type</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">In-App</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Digest</th>
                  </tr>
                </thead>
                <tbody>
                  {NOTIFICATION_TYPES.map((notifType) => (
                    <tr
                      key={notifType.key}
                      className="border-b border-gray-200 hover:bg-white/50 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">
                        {notifType.label}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <label className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={preferences[notifType.key]?.in_app ?? true}
                            onChange={() => handleTogglePreference(notifType.key, 'in_app')}
                            className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                            style={{ accentColor: '#0f3c35' }}
                          />
                        </label>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <label className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={preferences[notifType.key]?.email ?? true}
                            onChange={() => handleTogglePreference(notifType.key, 'email')}
                            className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                            style={{ accentColor: '#0f3c35' }}
                          />
                        </label>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <label className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={preferences[notifType.key]?.email_digest ?? true}
                            onChange={() => handleTogglePreference(notifType.key, 'email_digest')}
                            className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                            style={{ accentColor: '#0f3c35' }}
                          />
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 italic">
              <strong>Digest:</strong> Notifications are batched into daily email digests instead of individual emails
            </p>
          </div>
        </Card>

        {/* Daily Digest Settings */}
        <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Email Digest</h2>
              <p className="text-sm text-muted-foreground">
                Combine notifications into a daily email summary.
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 rounded border border-gray-300 bg-white">
              <input
                type="checkbox"
                id="dailyDigest"
                checked={dailyDigestEnabled}
                onChange={(e) => setDailyDigestEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                style={{ accentColor: '#0f3c35' }}
              />
              <label htmlFor="dailyDigest" className="flex-1 cursor-pointer">
                <div className="text-sm font-medium text-gray-900">
                  Enable Daily Email Digest
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Receive a daily summary of all notifications at 9:00 AM instead of individual emails
                </p>
              </label>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={saving}
            className="w-full"
            style={{ backgroundColor: '#1B3B2D', color: '#FDFBF7' }}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </div>
  );
}
