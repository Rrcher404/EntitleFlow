'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { NotificationResponse } from '@/lib/validation/notifications';

interface UseNotificationsOptions {
  pollInterval?: number;
  onNewNotification?: (notification: NotificationResponse) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface NotificationState {
  notifications: NotificationResponse[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing notifications with polling support
 * Polls for new notifications and provides notification management functions
 */
export function useNotifications(
  options: UseNotificationsOptions = {}
) {
  const {
    pollInterval = 30000, // 30 seconds default
    onNewNotification,
    onError,
    enabled = true,
  } = options;

  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  });

  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousCountRef = useRef(0);

  /**
   * Fetch unread notifications
   */
  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/notifications?unread=true', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch notifications: ${response.statusText}`
        );
      }

      const { data } = await response.json();
      const notifications = data || [];
      const unreadCount = notifications.filter(
        (n: NotificationResponse) => !n.is_read
      ).length;

      // Call onNewNotification for newly received notifications
      if (unreadCount > previousCountRef.current) {
        const newNotifications = notifications.slice(
          0,
          unreadCount - previousCountRef.current
        );
        newNotifications.forEach((n: NotificationResponse) => {
          onNewNotification?.(n);
        });
      }

      previousCountRef.current = unreadCount;

      setState((prev) => ({
        ...prev,
        notifications,
        unreadCount,
        loading: false,
        error: null,
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message,
      }));

      onError?.(err);
    }
  }, [enabled, onNewNotification, onError]);

  /**
   * Start polling for notifications
   */
  useEffect(() => {
    if (!enabled) return;

    // Fetch immediately
    fetchNotifications();

    // Set up polling
    const setupPoll = () => {
      pollTimeoutRef.current = setTimeout(() => {
        fetchNotifications();
        setupPoll();
      }, pollInterval);
    };

    setupPoll();

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [enabled, pollInterval, fetchNotifications]);

  /**
   * Mark a notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to mark notification as read: ${response.statusText}`
        );
      }

      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    }
  }, [onError]);

  /**
   * Mark multiple notifications as read
   */
  const markMultipleAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications/bulk-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: notificationIds }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to mark notifications as read: ${response.statusText}`
        );
      }

      setState((prev) => {
        const unreadReduced = notificationIds.filter(
          (id) => !prev.notifications.find((n) => n.id === id && n.is_read)
        ).length;

        return {
          ...prev,
          notifications: prev.notifications.map((n) =>
            notificationIds.includes(n.id)
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          ),
          unreadCount: Math.max(0, prev.unreadCount - unreadReduced),
        };
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    }
  }, [onError]);

  /**
   * Mark all notifications as read
   */
  const markAllRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to mark all notifications as read: ${response.statusText}`
        );
      }

      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    }
  }, [onError]);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete notification: ${response.statusText}`
        );
      }

      setState((prev) => {
        const notification = prev.notifications.find(
          (n) => n.id === notificationId
        );
        const wasUnread = notification && !notification.is_read;

        return {
          ...prev,
          notifications: prev.notifications.filter(
            (n) => n.id !== notificationId
          ),
          unreadCount: wasUnread
            ? Math.max(0, prev.unreadCount - 1)
            : prev.unreadCount,
        };
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    }
  }, [onError]);

  /**
   * Delete multiple notifications
   */
  const deleteMultiple = useCallback(async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: notificationIds }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete notifications: ${response.statusText}`
        );
      }

      setState((prev) => {
        const deletedUnreadCount = notificationIds.filter(
          (id) => !prev.notifications.find((n) => n.id === id && n.is_read)
        ).length;

        return {
          ...prev,
          notifications: prev.notifications.filter(
            (n) => !notificationIds.includes(n.id)
          ),
          unreadCount: Math.max(0, prev.unreadCount - deletedUnreadCount),
        };
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    }
  }, [onError]);

  /**
   * Manually refresh notifications
   */
  const refresh = useCallback(() => {
    return fetchNotifications();
  }, [fetchNotifications]);

  /**
   * Get notifications by type
   */
  const getNotificationsByType = useCallback(
    (type: string) => {
      return state.notifications.filter((n) => n.type === type);
    },
    [state.notifications]
  );

  /**
   * Get unread notifications
   */
  const getUnread = useCallback(() => {
    return state.notifications.filter((n) => !n.is_read);
  }, [state.notifications]);

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loading,
    error: state.error,
    markAsRead,
    markMultipleAsRead,
    markAllRead,
    deleteNotification,
    deleteMultiple,
    refresh,
    getNotificationsByType,
    getUnread,
  };
}
