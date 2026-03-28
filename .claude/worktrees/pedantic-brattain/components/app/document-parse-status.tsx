'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle, AlertCircle, Clock, Zap, RotateCw } from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';

type ParseStatus = 'queued' | 'processing' | 'completed' | 'failed' | null;

interface ParseStatusInfo {
  parse_status: ParseStatus;
  comments_created?: number | null;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
}

interface DocumentParseStatusProps {
  documentId: string;
  /** Initial status from the document record, avoids an extra fetch */
  initialStatus?: ParseStatus;
  /** Compact mode shows just a badge, full mode shows detail */
  variant?: 'badge' | 'card';
  /** Called when parse completes, so parent can refresh data */
  onParseComplete?: (commentsCreated: number) => void;
}

const STATUS_CONFIG: Record<string, {
  icon: typeof Loader2;
  label: string;
  color: string;
  bgColor: string;
  animate?: boolean;
}> = {
  queued: {
    icon: Clock,
    label: 'Queued for parsing',
    color: '#92702A',
    bgColor: '#FDF6E3',
  },
  processing: {
    icon: Loader2,
    label: 'AI parsing in progress…',
    color: '#1B3B2D',
    bgColor: '#E8F5E9',
    animate: true,
  },
  completed: {
    icon: CheckCircle,
    label: 'Parsing complete',
    color: '#2E7D32',
    bgColor: '#E8F5E9',
  },
  failed: {
    icon: AlertCircle,
    label: 'Parsing failed',
    color: '#C62828',
    bgColor: '#FFEBEE',
  },
};

/**
 * Displays the Document AI parsing status for a document.
 * Subscribes to Supabase Realtime for instant status updates,
 * with a polling fallback for active parse jobs.
 */
export function DocumentParseStatus({
  documentId,
  initialStatus,
  variant = 'badge',
  onParseComplete,
}: DocumentParseStatusProps) {
  const [statusInfo, setStatusInfo] = useState<ParseStatusInfo>({
    parse_status: initialStatus || null,
  });
  const [retrying, setRetrying] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  const isActive = statusInfo.parse_status === 'queued' || statusInfo.parse_status === 'processing';

  // Fetch current status
  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/status`);
      if (!res.ok) return;
      const data = await res.json();

      const newStatus: ParseStatus = data.parse_status;
      const prevStatus = statusInfo.parse_status;

      setStatusInfo({
        parse_status: newStatus,
        comments_created: data.parse_job?.comments_created,
        error_message: data.parse_job?.error_message,
        started_at: data.parse_job?.started_at,
        completed_at: data.parse_job?.completed_at,
      });

      // If just completed, notify parent
      if (newStatus === 'completed' && prevStatus !== 'completed') {
        onParseComplete?.(data.parse_job?.comments_created || 0);
      }
    } catch (err) {
      console.warn('[ParseStatus] Fetch failed:', err);
    }
  };

  // Subscribe to Realtime changes on the document record
  useEffect(() => {
    if (!supabase || !documentId) return;

    // Listen for document changes (parse_status updates)
    const channel = supabase
      .channel(`parse-status-${documentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `id=eq.${documentId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.parse_status) {
            setStatusInfo((prev) => ({
              ...prev,
              parse_status: updated.parse_status,
              parsed_at: updated.parsed_at,
            }));

            if (updated.parse_status === 'completed') {
              // Fetch full details including comments_created
              fetchStatus();
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [supabase, documentId]);

  // Poll while status is active (queued or processing)
  useEffect(() => {
    if (isActive) {
      // Initial fetch
      fetchStatus();

      // Poll every 3 seconds while active
      pollRef.current = setInterval(fetchStatus, 3000);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isActive, documentId]);

  // Handle retry for failed parses
  const handleRetry = async () => {
    setRetrying(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/auto-parse`, {
        method: 'POST',
      });
      if (res.ok) {
        setStatusInfo({ parse_status: 'processing' });
      }
    } catch (err) {
      console.error('[ParseStatus] Retry failed:', err);
    } finally {
      setRetrying(false);
    }
  };

  // Don't render anything if there's no parse status
  if (!statusInfo.parse_status) return null;

  const config = STATUS_CONFIG[statusInfo.parse_status];
  if (!config) return null;

  const StatusIcon = config.icon;

  // Badge variant — compact inline display
  if (variant === 'badge') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: config.bgColor, color: config.color }}
      >
        <StatusIcon
          className={`w-3.5 h-3.5 ${config.animate ? 'animate-spin' : ''}`}
        />
        <span>{config.label}</span>
        {statusInfo.parse_status === 'completed' && statusInfo.comments_created != null && (
          <span className="ml-0.5">
            · {statusInfo.comments_created} comment{statusInfo.comments_created !== 1 ? 's' : ''}
          </span>
        )}
        {statusInfo.parse_status === 'failed' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRetry();
            }}
            disabled={retrying}
            className="ml-1 hover:opacity-80"
            title="Retry parsing"
          >
            <RotateCw className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`} />
          </button>
        )}
      </span>
    );
  }

  // Card variant — expanded detail display
  return (
    <div
      className="rounded-lg p-3 border"
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.color + '30',
      }}
    >
      <div className="flex items-start gap-3">
        <StatusIcon
          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.animate ? 'animate-spin' : ''}`}
          style={{ color: config.color }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: config.color }}>
            {config.label}
          </p>

          {statusInfo.parse_status === 'processing' && (
            <div className="mt-2">
              <div className="w-full bg-white/60 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: config.color,
                    width: '60%',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <p className="text-xs mt-1 opacity-75" style={{ color: config.color }}>
                FlowE is analyzing your document with Document AI…
              </p>
            </div>
          )}

          {statusInfo.parse_status === 'completed' && (
            <div className="mt-1 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" style={{ color: '#D4A937' }} />
              <p className="text-xs" style={{ color: config.color }}>
                {statusInfo.comments_created || 0} comment{(statusInfo.comments_created || 0) !== 1 ? 's' : ''} extracted and ready for review
              </p>
            </div>
          )}

          {statusInfo.parse_status === 'failed' && (
            <div className="mt-2 flex items-center gap-2">
              <p className="text-xs opacity-75" style={{ color: config.color }}>
                {statusInfo.error_message || 'An error occurred during parsing'}
              </p>
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border hover:opacity-80"
                style={{ borderColor: config.color, color: config.color }}
              >
                <RotateCw className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`} />
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
