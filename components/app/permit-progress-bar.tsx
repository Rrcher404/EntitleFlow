'use client';

import { Card } from '@/components/ui/card';
import type { Comment } from '@/lib/types/index';

interface PermitProgressBarProps {
  comments: Comment[];
  className?: string;
}

export function PermitProgressBar({ comments, className }: PermitProgressBarProps) {
  // Count comments by status
  const resolved = comments.filter(c => c.is_resolved).length;
  const inProgress = comments.filter(c => !c.is_resolved && c.assigned_to).length;
  const open = comments.filter(c => !c.is_resolved && !c.assigned_to).length;
  const total = comments.length;

  // Calculate percentages
  const resolvedPercent = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const _inProgressPercent = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const _openPercent = total > 0 ? Math.round((open / total) * 100) : 0;

  // Empty state
  if (total === 0) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground font-display">Resolution Progress</h3>
              <span className="text-xs text-muted-foreground">No comments yet</span>
            </div>
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No comments to track</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6 space-y-6">
        {/* Header with progress percentage */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground font-display">Resolution Progress</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {total} {total === 1 ? 'comment' : 'comments'} total
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground" style={{ color: '#0f3c35' }}>
              {resolvedPercent}%
            </div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </div>
        </div>

        {/* Segmented progress bar */}
        <div className="space-y-2">
          <div
            className="flex h-2 rounded-full overflow-hidden gap-px"
            style={{ backgroundColor: '#e2e5e5' }}
            role="progressbar"
            aria-valuenow={resolved}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={`${resolved} of ${total} comments resolved (${resolvedPercent}%)`}
          >
            {resolved > 0 && (
              <div
                style={{ width: `${(resolved / total) * 100}%`, backgroundColor: '#16a34a' }}
                title={`${resolved} resolved`}
              />
            )}
            {inProgress > 0 && (
              <div
                style={{ width: `${(inProgress / total) * 100}%`, backgroundColor: '#25a18e' }}
                title={`${inProgress} in progress`}
              />
            )}
            {open > 0 && (
              <div
                style={{ width: `${(open / total) * 100}%`, backgroundColor: '#9ca3af' }}
                title={`${open} open`}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#16a34a' }} />
              <span className="text-muted-foreground">Resolved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#25a18e' }} />
              <span className="text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#9ca3af' }} />
              <span className="text-muted-foreground">Open</span>
            </div>
          </div>
        </div>

        {/* Breakdown stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <div className="text-2xl font-bold" style={{ color: '#15803d' }}>{resolved}</div>
            <p className="text-xs mt-1" style={{ color: '#16a34a' }}>Resolved</p>
          </div>
          <div className="p-3 rounded-lg border" style={{ backgroundColor: '#dff2ef', borderColor: '#b2dfdb' }}>
            <div className="text-2xl font-bold" style={{ color: '#0f3c35' }}>{inProgress}</div>
            <p className="text-xs mt-1" style={{ color: '#25a18e' }}>In Progress</p>
          </div>
          <div className="p-3 rounded-lg border border-border" style={{ backgroundColor: '#f0f2f4' }}>
            <div className="text-2xl font-bold text-muted-foreground">{open}</div>
            <p className="text-xs text-muted-foreground mt-1">Open</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
