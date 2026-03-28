'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { X, Bell, CheckCircle, FileText, Clock, Upload, Zap, Users, Mail } from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ToastNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  action_url?: string;
  created_at: string;
}

const TOAST_DURATION = 5000; // 5 seconds

const getToastIcon = (type: string) => {
  const iconClass = 'w-5 h-5 flex-shrink-0';
  switch (type) {
    case 'comment_assigned':
      return <Bell className={`${iconClass} text-blue-500`} />;
    case 'comment_resolved':
      return <CheckCircle className={`${iconClass} text-green-500`} />;
    case 'permit_status_changed':
      return <FileText className={`${iconClass} text-purple-500`} />;
    case 'deadline_approaching':
      return <Clock className={`${iconClass} text-amber-500`} />;
    case 'document_uploaded':
      return <Upload className={`${iconClass} text-cyan-500`} />;
    case 'ai_parse_complete':
      return <Zap className={`${iconClass} text-yellow-500`} />;
    case 'team_invitation':
      return <Users className={`${iconClass} text-indigo-500`} />;
    case 'email_ingested':
      return <Mail className={`${iconClass} text-gray-500`} />;
    default:
      return <Bell className={`${iconClass} text-gray-500`} />;
  }
};

/**
 * Global toast notification container that shows real-time notifications
 * as slide-in toasts. Subscribes to Supabase Realtime independently
 * from the notification bell.
 */
export function NotificationToastContainer() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((notification: ToastNotification) => {
    setToasts((prev) => {
      // Max 3 toasts at once
      const updated = [...prev, notification].slice(-3);
      return updated;
    });

    // Auto-dismiss after duration
    setTimeout(() => {
      removeToast(notification.id);
    }, TOAST_DURATION);
  }, [removeToast]);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      const channel = supabase
        .channel('notification-toasts')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            const notif = payload.new as ToastNotification;
            addToast(notif);
          }
        )
        .subscribe();

      channelRef.current = channel;
    };

    setup();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [supabase, addToast]);

  const handleToastClick = (toast: ToastNotification) => {
    if (toast.action_url) {
      router.push(toast.action_url);
    }
    removeToast(toast.id);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex gap-3 items-start cursor-pointer hover:bg-gray-50 transition-all animate-slide-in-right"
          style={{
            borderColor: '#E8E0D0',
            backgroundColor: '#FDFBF7',
            animationDelay: `${index * 100}ms`,
          }}
          onClick={() => handleToastClick(toast)}
          role="alert"
        >
          {getToastIcon(toast.type)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {toast.title}
            </p>
            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
              {toast.body}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* CSS animation for slide-in */}
      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
