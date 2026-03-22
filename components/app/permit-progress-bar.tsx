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
  const inProgressPercent = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const openPercent = total > 0 ? Math.round((open / total) * 100) : 0;

  // Empty state
  if (total === 0) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Resolution Progress</h3>
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
            <h3 className="text-sm font-semibold text-foreground">Resolution Progress</h3>
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
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-200 gap-px">
            {resolved > 0 && (
              <div
                className="bg-green-500"
                style={{ width: `${(resolved / total) * 100}%` }}
                title={`${resolved} resolved`}
              />
            )}
            {inProgress > 0 && (
              <div
                className="bg-blue-500"
                style={{ width: `${(inProgress / total) * 100}%` }}
                title={`${inProgress} in progress`}
              />
            )}
            {open > 0 && (
              <div
                className="bg-gray-400"
                style={{ width: `${(open / total) * 100}%` }}
                title={`${open} open`}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Resolved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <span className="text-muted-foreground">Open</span>
            </div>
          </div>
        </div>

        {/* Breakdown stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">{resolved}</div>
            <p className="text-xs text-green-600 mt-1">Resolved</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{inProgress}</div>
            <p className="text-xs text-blue-600 mt-1">In Progress</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-700">{open}</div>
            <p className="text-xs text-gray-600 mt-1">Open</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
