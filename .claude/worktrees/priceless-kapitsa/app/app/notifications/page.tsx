'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  CheckCircle,
  FileText,
  Clock,
  Upload,
  Users,
  Zap,
  Mail,
  Settings,
} from 'lucide-react';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

interface NotificationPreferences {
  user_id: string;
  comment_assigned_in_app: boolean;
  comment_assigned_email: boolean;
  comment_assigned_digest: boolean;
  comment_resolved_in_app: boolean;
  comment_resolved_email: boolean;
  comment_resolved_digest: boolean;
  permit_status_changed_in_app: boolean;
  permit_status_changed_email: boolean;
  permit_status_changed_digest: boolean;
  deadline_approaching_in_app: boolean;
  deadline_approaching_email: boolean;
  deadline_approaching_digest: boolean;
  document_uploaded_in_app: boolean;
  document_uploaded_email: boolean;
  document_uploaded_digest: boolean;
  team_invitation_in_app: boolean;
  team_invitation_email: boolean;
  team_invitation_digest: boolean;
  ai_parse_complete_in_app: boolean;
  ai_parse_complete_email: boolean;
  ai_parse_complete_digest: boolean;
  email_ingested_in_app: boolean;
  email_ingested_email: boolean;
  email_ingested_digest: boolean;
}

interface PreferenceSetting {
  key: keyof NotificationPreferences;
  label: string;
  type: 'in_app' | 'email' | 'digest';
}

const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getNotificationIcon = (
  type: string,
  className: string = 'w-5 h-5'
) => {
  const iconProps = { className };
  switch (type) {
    case 'comment_assigned':
      return <UserPlus {...iconProps} />;
    case 'comment_resolved':
      return <CheckCircle {...iconProps} />;
    case 'permit_status_changed':
      return <FileText {...iconProps} />;
    case 'deadline_approaching':
      return <Clock {...iconProps} />;
    case 'document_uploaded':
      return <Upload {...iconProps} />;
    case 'team_invitation':
      return <Users {...iconProps} />;
    case 'ai_parse_complete':
      return <Zap {...iconProps} />;
    case 'email_ingested':
      return <Mail {...iconProps} />;
    default:
      return <FileText {...iconProps} />;
  }
};

const groupNotificationsByDate = (
  notifications: Notification[]
): Record<string, Notification[]> => {
  const groups: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Older: [],
  };

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  notifications.forEach(notification => {
    const notifDate = new Date(notification.created_at);
    notifDate.setHours(0, 0, 0, 0);

    if (notifDate.getTime() === now.getTime()) {
      groups['Today'].push(notification);
    } else if (notifDate.getTime() === yesterday.getTime()) {
      groups['Yesterday'].push(notification);
    } else if (notifDate > weekAgo) {
      groups['This Week'].push(notification);
    } else {
      groups['Older'].push(notification);
    }
  });

  return groups;
};

const PREFERENCE_SETTINGS: Array<{
  category: string;
  key: string;
  settings: PreferenceSetting[];
}> = [
  {
    category: 'Comment Assigned',
    key: 'comment_assigned',
    settings: [
      { key: 'comment_assigned_in_app' as keyof NotificationPreferences, label: 'In-App', type: 'in_app' },
      { key: 'comment_assigned_email' as keyof NotificationPreferences, label: 'Email', type: 'email' },
      { key: 'comment_assigned_digest' as keyof NotificationPreferences, label: 'Digest', type: 'digest' },
    ],
  },
  {
    category: 'Comment Resolved',
    key: 'comment_resolved',
    settings: [
      { key: 'comment_resolved_in_app' as keyof NotificationPreferences, label: 'In-App', type: 'in_app' },
      { key: 'comment_resolved_email' as keyof NotificationPreferences, label: 'Email', type: 'email' },
      { key: 'comment_resolved_digest' as keyof NotificationPreferences, label: 'Digest', type: 'digest' },
    ],
  },
  {
    category: 'Permit Status Changed',
    key: 'permit_status_changed',
    settings: [
      { key: 'permit_status_changed_in_app' as keyof NotificationPreferences, label: 'In-App', type: 'in_app' },
      { key: 'permit_status_changed_email' as keyof NotificationPreferences, label: 'Email', type: 'email' },
      { key: 'permit_status_changed_digest' as keyof NotificationPreferences, label: 'Digest', type: 'digest' },
    ],
  },
  {
    category: 'Deadline Approaching',
    key: 'deadline_approaching',
    settings: [
      { key: 'deadline_approaching_in_app' as keyof NotificationPreferences, label: 'In-App', type: 'in_app' },
      { key: 'deadline_approaching_email' as keyof NotificationPreferences, label: 'Email', type: 'email' },
      { key: 'deadline_approaching_digest' as keyof NotificationPreferences, label: 'Digest', type: 'digest' },
    ],
  },
  {
    category: 'Document Uploaded',
    key: 'document_uploaded',
    settings: [
      { key: 'document_uploaded_in_app' as keyof NotificationPreferences, label: 'In-App', type: 'in_app' },
      { key: 'document_uploaded_email' as keyof NotificationPreferences, label: 'Email', type: 'email' },
      { key: 'document_uploaded_digest' as keyof NotificationPreferences, label: 'Digest', type: 'digest' },
    ],
  },
  {
    category: 'Team Invitation',
    key: 'team_invitation',
    settings: [
      { key: 'team_invitation_in_app' as keyof NotificationPreferences, label: 'In-App', type: 'in_app' },
      { key: 'team_invitation_email' as keyof NotificationPreferences, label: 'Email', type: 'email' },
      { key: 'team_invitation_digest' as keyof NotificationPreferences, label: 'Digest', type: 'digest' },
    ],
  },
  {
    category: 'AI Parse Complete',
    key: 'ai_parse_complete',
    settings: [
      { key: 'ai_parse_complete_in_app' as keyof NotificationPreferences, label: 'In-App', type: 'in_app' },
      { key: 'ai_parse_complete_email' as keyof NotificationPreferences, label: 'Email', type: 'email' },
      { key: 'ai_parse_complete_digest' as keyof NotificationPreferences, label: 'Digest', type: 'digest' },
    ],
  },
  {
    category: 'Email Ingested',
    key: 'email_ingested',
    settings: [
      { key: 'email_ingested_in_app' as keyof NotificationPreferences, label: 'In-App', type: 'in_app' },
      { key: 'email_ingested_email' as keyof NotificationPreferences, label: 'Email', type: 'email' },
      { key: 'email_ingested_digest' as keyof NotificationPreferences, label: 'Digest', type: 'digest' },
    ],
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>(
    'all'
  );
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [savingPreferences, setSavingPreferences] = useState(false);

  const supabase = createClient();

  const loadNotifications = async (pageNum: number = 0) => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not fetch user');

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const pageSize = 20;
      const response = await fetch(
        `/api/notifications?page=${pageNum}&limit=${pageSize}`
      );
      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      if (pageNum === 0) {
        setNotifications(data.notifications || []);
      } else {
        setNotifications(prev => [...prev, ...(data.notifications || [])]);
      }
      setHasMore((data.notifications || []).length === pageSize);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (!response.ok) throw new Error('Failed to fetch preferences');

      const data = await response.json();
      setPreferences(data);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, [supabase]);

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.action_url) {
      try {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'PATCH',
        });
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }

      router.push(notification.action_url);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark all as read');

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        [key]: !preferences[key],
      });
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;

    setSavingPreferences(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) throw new Error('Failed to save preferences');
      alert('Notification preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  const displayNotifications =
    activeTab === 'unread'
      ? notifications.filter(n => !n.is_read)
      : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const groupedNotifications = groupNotificationsByDate(displayNotifications);

  if (loading && activeTab !== 'settings') {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card className="p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="py-4 border-b last:border-b-0">
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-600">
            Stay updated on your projects and permits.
          </p>
        </div>
        {activeTab !== 'settings' && unreadCount > 0 && (
          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            className="text-sm"
          >
            Mark All Read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E8E0D0]">
        {['all', 'unread', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab as typeof activeTab);
              setPage(0);
            }}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2',
              activeTab === tab
                ? 'border-[#1B3B2D] text-[#1B3B2D]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            {tab === 'all' && 'All'}
            {tab === 'unread' && `Unread (${unreadCount})`}
            {tab === 'settings' && (
              <div className="flex items-center gap-1">
                <Settings className="w-4 h-4" />
                Settings
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Notification Settings Tab */}
      {activeTab === 'settings' && preferences && (
        <Card className="border-[#E8E0D0] bg-[#FDFBF7] p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Notification Preferences
          </h2>

          <div className="space-y-4">
            {PREFERENCE_SETTINGS.map(group => (
              <div key={group.key} className="space-y-2">
                <h3 className="font-medium text-gray-900">{group.category}</h3>
                <div className="flex gap-4 ml-4">
                  {group.settings.map(setting => (
                    <label
                      key={setting.key}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!preferences[setting.key]}
                        onChange={() => handlePreferenceChange(setting.key)}
                        className="w-4 h-4 rounded border-gray-300 accent-[#1B3B2D]"
                      />
                      <span className="text-sm text-gray-700">{setting.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSavePreferences}
            disabled={savingPreferences}
            className="bg-[#1B3B2D] text-white hover:bg-[#153229]"
          >
            {savingPreferences ? 'Saving...' : 'Save Preferences'}
          </Button>
        </Card>
      )}

      {/* Notifications List */}
      {activeTab !== 'settings' && (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(
            ([dateGroup, groupNotifications]) =>
              groupNotifications.length > 0 && (
                <div key={dateGroup} className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-600">
                    {dateGroup}
                  </h3>
                  <Card className="border-[#E8E0D0] bg-[#FDFBF7] overflow-hidden">
                    <div className="divide-y divide-[#E8E0D0]">
                      {groupNotifications.map(notification => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={cn(
                            'p-4 flex gap-3 cursor-pointer transition-colors hover:bg-white/70',
                            !notification.is_read && 'border-l-4 border-[#1B3B2D]'
                          )}
                        >
                          {/* Icon */}
                          <div className="flex-shrink-0 text-gray-600 pt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                'text-sm font-medium',
                                notification.is_read
                                  ? 'text-gray-900'
                                  : 'text-gray-900 font-semibold'
                              )}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.body}
                            </p>
                          </div>

                          {/* Time */}
                          <div className="flex-shrink-0 text-right">
                            <span className="text-xs text-gray-500">
                              {getRelativeTime(notification.created_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )
          )}

          {displayNotifications.length === 0 && (
            <Card className="border-[#E8E0D0] bg-[#FDFBF7] p-12 text-center">
              <p className="text-gray-600">
                {activeTab === 'unread'
                  ? 'No unread notifications'
                  : 'No notifications yet'}
              </p>
            </Card>
          )}

          {/* Load More Button */}
          {hasMore && displayNotifications.length > 0 && (
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setPage(prev => prev + 1);
                  loadNotifications(page + 1);
                }}
                variant="outline"
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
