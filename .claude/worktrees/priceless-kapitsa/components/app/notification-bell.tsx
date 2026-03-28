'use client';

import { Bell, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [flashBell, setFlashBell] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const userIdRef = useRef<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications?limit=10&unread=false');
      const data = await response.json();

      if (response.ok) {
        setNotifications(data.data || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up Supabase Realtime subscription for instant notification updates
  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      userIdRef.current = user.id;

      // Initial fetch
      fetchNotifications();

      // Subscribe to new notifications for this user via Realtime
      const channel = supabase
        .channel('notifications-bell')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            // New notification received in real-time!
            const newNotif = payload.new as Notification;

            setNotifications((prev) => {
              // Prepend new notification, keep max 10
              const updated = [newNotif, ...prev].slice(0, 10);
              return updated;
            });

            setUnreadCount((prev) => prev + 1);

            // Flash the bell icon to draw attention
            setFlashBell(true);
            setTimeout(() => setFlashBell(false), 2000);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            // Notification was read/updated — sync state
            const updated = payload.new as Notification;
            setNotifications((prev) =>
              prev.map((n) => (n.id === updated.id ? updated : n))
            );

            // Recalculate unread count
            if (updated.is_read) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();

      channelRef.current = channel;
    };

    setupRealtime();

    // Fallback polling every 60s (safety net if Realtime disconnects)
    const fallbackInterval = setInterval(fetchNotifications, 60000);

    return () => {
      mounted = false;
      clearInterval(fallbackInterval);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [supabase, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notification_ids: [notification.id]
          })
        });

        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    if (notification.action_url) {
      router.push(notification.action_url);
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mark_all_read: true
        })
      });

      setNotifications(prev =>
        prev.map(n => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment_assigned':
        return '📋';
      case 'comment_resolved':
        return '✅';
      case 'permit_status_changed':
        return '📄';
      case 'deadline_approaching':
        return '⏰';
      case 'document_uploaded':
        return '📤';
      case 'ai_parse_complete':
        return '🤖';
      case 'team_invitation':
        return '👥';
      case 'email_ingested':
        return '📧';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-gray-600 hover:text-gray-900 transition-all ${
          flashBell ? 'animate-bounce' : ''
        }`}
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 transition-colors ${flashBell ? 'text-amber-500' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[18px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
        >
          <div className="border-b border-gray-200" style={{ borderColor: '#E8E0D0' }}>
            <div className="px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  You'll see updates when comments are assigned or resolved
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: '#E8E0D0' }}>
                {notifications.map(notification => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 hover:bg-white/80 transition-colors ${
                      !notification.is_read ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <div className="flex gap-2.5">
                      <span className="text-base flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm truncate ${
                          !notification.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                          {truncateText(notification.body || '', 100)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {getRelativeTime(notification.created_at)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t" style={{ borderColor: '#E8E0D0' }}>
            <Link
              href="/app/notifications"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-sm text-center font-medium hover:bg-gray-50 transition-colors"
              style={{ color: '#1B3B2D' }}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
