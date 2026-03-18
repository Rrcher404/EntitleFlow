'use client';

import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: 'open' | 'in-progress' | 'ready-for-review' | 'resolved' | 'blocked';
  children: React.ReactNode;
  pulse?: boolean;
}

const statusConfig = {
  open: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    text: 'text-blue-900 dark:text-blue-200',
    dot: 'bg-blue-500 dark:bg-blue-400',
  },
  'in-progress': {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-700',
    text: 'text-amber-900 dark:text-amber-200',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  'ready-for-review': {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-700',
    text: 'text-purple-900 dark:text-purple-200',
    dot: 'bg-purple-500 dark:bg-purple-400',
  },
  resolved: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-700',
    text: 'text-emerald-900 dark:text-emerald-200',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  blocked: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-700',
    text: 'text-red-900 dark:text-red-200',
    dot: 'bg-red-500 dark:bg-red-400',
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
