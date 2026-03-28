'use client';

import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: 'open' | 'in-progress' | 'ready-for-review' | 'resolved' | 'blocked';
  children: React.ReactNode;
  pulse?: boolean;
}

const statusConfig = {
  open: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    dot: 'bg-blue-500',
  },
  'in-progress': {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    dot: 'bg-amber-500',
  },
  'ready-for-review': {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    dot: 'bg-purple-500',
  },
  resolved: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    dot: 'bg-emerald-500',
  },
  blocked: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    dot: 'bg-red-500',
  },
};

export function StatusBadge({ status, children, pulse = false }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
        config.bg,
        config.border,
        config.text,
      )}
    >
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          config.dot,
          pulse && 'animate-pulse',
        )}
      />
      {children}
    </span>
  );
}
