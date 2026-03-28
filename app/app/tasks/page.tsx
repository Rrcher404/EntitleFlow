'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  FileCheck2,
  FolderKanban,
  Search,
  Calendar,
  Sparkles,
  ChevronRight,
  CircleDot,
  Filter,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface TaskComment {
  id: string;
  body: string;
  category: string | null;
  source: string;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  assigned_to: string | null;
  ai_suggested_response: string | null;
  ai_confidence: number | null;
  created_at: string;
  updated_at: string;
  permit_id: string;
  permit: {
    id: string;
    permit_number: string;
    title: string;
    status: string;
    jurisdiction: string | null;
    permit_type: string;
    project: {
      id: string;
      project_number: string;
      name: string;
      status: string;
    };
  };
  assignments: {
    assigned_at: string;
    assigned_by: string | null;
  }[];
}

interface TaskDeadline {
  id: string;
  permit_id: string;
  title: string;
  due_date: string;
  status: string;
}

interface TaskSummary {
  open: number;
  resolved: number;
  total: number;
}

type ViewMode = 'deadline' | 'permit';
type StatusFilter = 'open' | 'resolved' | 'all';

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_LABELS: Record<string, string> = {
  parking_access: 'Parking & Access',
  stormwater: 'Stormwater',
  building_code: 'Building Code',
  zoning: 'Zoning',
  fire_safety: 'Fire/Life Safety',
  landscaping: 'Landscaping',
  traffic: 'Traffic',
  environmental: 'Environmental',
  general: 'General',
  other: 'Other',
};

const CATEGORY_COLORS: Record<string, string> = {
  parking_access: 'bg-blue-100 text-blue-700',
  stormwater: 'bg-cyan-100 text-cyan-700',
  building_code: 'bg-orange-100 text-orange-700',
  zoning: 'bg-purple-100 text-purple-700',
  fire_safety: 'bg-red-100 text-red-700',
  landscaping: 'bg-green-100 text-green-700',
  traffic: 'bg-yellow-100 text-yellow-700',
  environmental: 'bg-emerald-100 text-emerald-700',
  general: 'bg-gray-100 text-gray-700',
  other: 'bg-gray-100 text-gray-600',
};

const STATUS_COLORS: Record<string, string> = {
  overdue: 'text-red-600 bg-red-50 border-red-200',
  due_soon: 'text-amber-600 bg-amber-50 border-amber-200',
  upcoming: 'text-blue-600 bg-blue-50 border-blue-200',
};

// ============================================================================
// URGENCY SCORING — This is where your domain knowledge matters
// ============================================================================

/**
 * Calculates an urgency score for a task based on deadline proximity,
 * comment age, and category severity.
 *
 * This function determines the order tasks appear in the "By Deadline" view.
 * A higher score = more urgent = appears first.
 *
 * Jene: This is the core prioritization logic for your customer's daily view.
 * The weights here directly shape what they see first thing in the morning.
 *
 * Inputs available:
 *   - daysUntilDeadline: number | null (null = no deadline set)
 *   - commentAgeDays: number (how old the comment is)
 *   - category: string | null (comment discipline category)
 *   - hasAiSuggestion: boolean (whether AI has pre-drafted a response)
 *
 * Returns: number (higher = more urgent)
 *
 * TODO: Jene to refine these weights based on domain knowledge
 */
function calculateUrgencyScore(
  daysUntilDeadline: number | null,
  commentAgeDays: number,
  category: string | null,
  hasAiSuggestion: boolean,
): number {
  let score = 0;

  // Deadline proximity is the strongest signal
  if (daysUntilDeadline !== null) {
    if (daysUntilDeadline < 0) {
      // Overdue — max urgency, scaled by how overdue
      score += 100 + Math.abs(daysUntilDeadline) * 5;
    } else if (daysUntilDeadline <= 3) {
      score += 80 - daysUntilDeadline * 10;
    } else if (daysUntilDeadline <= 7) {
      score += 40;
    } else if (daysUntilDeadline <= 14) {
      score += 20;
    } else {
      score += 10;
    }
  } else {
    // No deadline — moderate base urgency so they don't sink to the bottom
    score += 15;
  }

  // Comment age adds mild pressure — older unresolved comments are worse
  if (commentAgeDays > 14) score += 15;
  else if (commentAgeDays > 7) score += 10;
  else if (commentAgeDays > 3) score += 5;

  // Category severity — fire/safety and stormwater tend to block approvals
  const highSeverityCategories = ['fire_safety', 'stormwater', 'building_code', 'zoning'];
  if (category && highSeverityCategories.includes(category)) {
    score += 10;
  }

  // If AI already has a suggestion, slight de-prioritization
  // (easier to resolve = slightly less urgent to look at)
  if (hasAiSuggestion) {
    score -= 5;
  }

  return Math.max(0, score);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function daysBetween(dateStr: string, now: Date): number {
  const date = new Date(dateStr);
  return Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const days = daysBetween(dateStr, now);

  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days <= 7) return `${days}d left`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDeadlineUrgency(dateStr: string): 'overdue' | 'due_soon' | 'upcoming' {
  const days = daysBetween(dateStr, new Date());
  if (days < 0) return 'overdue';
  if (days <= 5) return 'due_soon';
  return 'upcoming';
}

// ============================================================================
// TASK CARD COMPONENT
// ============================================================================

function TaskCard({
  task,
  deadline,
  onResolve,
  onNavigate,
  onAiSuggest,
}: {
  task: TaskComment;
  deadline: TaskDeadline | null;
  onResolve: (id: string) => void;
  onNavigate: (permitId: string) => void;
  onAiSuggest: (id: string) => void;
}) {
  const category = task.category || 'general';
  const categoryLabel = CATEGORY_LABELS[category] || category;
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.general;
  const hasAi = !!task.ai_suggested_response;

  return (
    <Card
      className={cn(
        'p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4',
        task.is_resolved
          ? 'border-l-green-400 opacity-70'
          : deadline && getDeadlineUrgency(deadline.due_date) === 'overdue'
          ? 'border-l-red-400'
          : deadline && getDeadlineUrgency(deadline.due_date) === 'due_soon'
          ? 'border-l-amber-400'
          : 'border-l-primary/40'
      )}
      onClick={() => onNavigate(task.permit_id)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', categoryColor)}>
            {categoryLabel}
          </span>
          {task.source === 'jurisdiction' && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-700">
              Jurisdiction
            </span>
          )}
          {hasAi && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-violet-50 text-violet-700">
              <Sparkles className="h-3 w-3" />
              AI Ready
            </span>
          )}
        </div>

        {/* Deadline badge */}
        {deadline && !task.is_resolved && (
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
            STATUS_COLORS[getDeadlineUrgency(deadline.due_date)]
          )}>
            <Clock className="h-3 w-3" />
            {formatRelativeDate(deadline.due_date)}
          </span>
        )}

        {task.is_resolved && (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700">
            <CheckCircle className="h-3 w-3" />
            Resolved
          </span>
        )}
      </div>

      {/* Comment body — truncated */}
      <p className="text-sm text-foreground leading-relaxed line-clamp-2 mb-3">
        {task.body}
      </p>

      {/* Footer: permit context + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          <FileCheck2 className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">
            {task.permit.permit_number} — {task.permit.project.name}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {!task.is_resolved && hasAi && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50"
              onClick={() => onAiSuggest(task.id)}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              View AI
            </Button>
          )}
          {!task.is_resolved && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => onResolve(task.id)}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Resolve
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onNavigate(task.permit_id)}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function TasksPage() {
  const router = useRouter();
  const _supabase = createClient();

  // State
  const [tasks, setTasks] = useState<TaskComment[]>([]);
  const [deadlines, setDeadlines] = useState<TaskDeadline[]>([]);
  const [summary, setSummary] = useState<TaskSummary>({ open: 0, resolved: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View controls
  const [viewMode, setViewMode] = useState<ViewMode>('deadline');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open');
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // ── Data fetching ──
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        status: statusFilter,
        sort: viewMode === 'deadline' ? 'deadline' : 'permit',
        limit: '100',
      });
      if (categoryFilter) params.set('category', categoryFilter);

      const res = await fetch(`/api/tasks?${params}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');

      const json = await res.json();
      setTasks(json.data || []);
      setDeadlines(json.deadlines || []);
      setSummary(json.summary || { open: 0, resolved: 0, total: 0 });
    } catch (err: unknown) {
      console.error('Tasks fetch error:', err);
      setError((err instanceof Error ? err.message : String(err)) || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, viewMode, categoryFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ── Deadline lookup ──
  const deadlineByPermit = useMemo(() => {
    const map: Record<string, TaskDeadline> = {};
    for (const d of deadlines) {
      // Keep the nearest deadline per permit
      if (!map[d.permit_id] || new Date(d.due_date) < new Date(map[d.permit_id].due_date)) {
        map[d.permit_id] = d;
      }
    }
    return map;
  }, [deadlines]);

  // ── Search filter (client-side for instant feel) ──
  const filteredTasks = useMemo(() => {
    if (!searchText.trim()) return tasks;
    const q = searchText.toLowerCase();
    return tasks.filter(
      (t) =>
        t.body.toLowerCase().includes(q) ||
        t.permit.permit_number.toLowerCase().includes(q) ||
        t.permit.project.name.toLowerCase().includes(q) ||
        (t.category && CATEGORY_LABELS[t.category]?.toLowerCase().includes(q))
    );
  }, [tasks, searchText]);

  // ── Grouping logic for both views ──
  const groupedTasks = useMemo(() => {
    const now = new Date();

    if (viewMode === 'deadline') {
      // Sort by urgency score, then group into urgency buckets
      const scored = filteredTasks.map((task) => {
        const deadline = deadlineByPermit[task.permit_id];
        const daysUntil = deadline ? daysBetween(deadline.due_date, now) : null;
        const commentAge = Math.floor((now.getTime() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24));
        const score = calculateUrgencyScore(daysUntil, commentAge, task.category, !!task.ai_suggested_response);
        return { task, deadline, score, daysUntil };
      });

      scored.sort((a, b) => b.score - a.score);

      // Group into urgency tiers
      const groups: { label: string; icon: React.ReactNode; colorClass: string; items: typeof scored }[] = [
        {
          label: 'Overdue',
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          colorClass: 'text-red-600',
          items: scored.filter((s) => s.daysUntil !== null && s.daysUntil < 0),
        },
        {
          label: 'Due This Week',
          icon: <Clock className="h-4 w-4 text-amber-500" />,
          colorClass: 'text-amber-600',
          items: scored.filter((s) => s.daysUntil !== null && s.daysUntil >= 0 && s.daysUntil <= 7),
        },
        {
          label: 'Upcoming',
          icon: <Calendar className="h-4 w-4 text-blue-500" />,
          colorClass: 'text-blue-600',
          items: scored.filter((s) => s.daysUntil !== null && s.daysUntil > 7),
        },
        {
          label: 'No Deadline Set',
          icon: <CircleDot className="h-4 w-4 text-gray-400" />,
          colorClass: 'text-muted-foreground',
          items: scored.filter((s) => s.daysUntil === null),
        },
      ];

      return groups.filter((g) => g.items.length > 0);
    } else {
      // Group by permit
      const permitMap: Record<string, { permit: TaskComment['permit']; items: { task: TaskComment; deadline: TaskDeadline | null; score: number; daysUntil: number | null }[] }> = {};

      for (const task of filteredTasks) {
        const key = task.permit_id;
        if (!permitMap[key]) {
          permitMap[key] = { permit: task.permit, items: [] };
        }
        const deadline = deadlineByPermit[task.permit_id];
        const daysUntil = deadline ? daysBetween(deadline.due_date, now) : null;
        permitMap[key].items.push({ task, deadline, score: 0, daysUntil });
      }

      // Sort permits by their nearest deadline (most urgent first)
      const sortedPermits = Object.values(permitMap).sort((a, b) => {
        const aDeadline = deadlineByPermit[a.permit.id];
        const bDeadline = deadlineByPermit[b.permit.id];
        if (!aDeadline && !bDeadline) return 0;
        if (!aDeadline) return 1;
        if (!bDeadline) return -1;
        return new Date(aDeadline.due_date).getTime() - new Date(bDeadline.due_date).getTime();
      });

      return sortedPermits.map((group) => {
        const deadline = deadlineByPermit[group.permit.id];
        return {
          label: `${group.permit.permit_number} — ${group.permit.project.name}`,
          icon: <FolderKanban className="h-4 w-4 text-primary" />,
          colorClass: 'text-foreground',
          items: group.items,
          permitMeta: {
            title: group.permit.title,
            jurisdiction: group.permit.jurisdiction,
            status: group.permit.status,
            deadline,
          },
        };
      });
    }
  }, [filteredTasks, viewMode, deadlineByPermit]);

  // ── Actions ──
  const handleResolve = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution_notes: 'Resolved from My Tasks' }),
      });

      if (res.ok) {
        // Optimistic update
        setTasks((prev) => prev.map((t) => (t.id === commentId ? { ...t, is_resolved: true, resolved_at: new Date().toISOString() } : t)));
        setSummary((prev) => ({ ...prev, open: prev.open - 1, resolved: prev.resolved + 1 }));
      }
    } catch (err) {
      console.error('Resolve error:', err);
    }
  };

  const handleNavigate = (permitId: string) => {
    router.push(`/app/permits/${permitId}`);
  };

  const handleAiSuggest = (commentId: string) => {
    // Navigate to the permit detail with the comment highlighted
    const task = tasks.find((t) => t.id === commentId);
    if (task) {
      router.push(`/app/permits/${task.permit_id}?comment=${commentId}&showAi=true`);
    }
  };

  // ── Unique categories in current results ──
  const availableCategories = useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [tasks]);

  // ── Render ──
  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-5xl px-6 py-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Comments assigned to you across all permits
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                <MessageSquare className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.open}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.resolved}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                <FileCheck2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.total}</p>
                <p className="text-xs text-muted-foreground">Total Assigned</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* View toggle */}
          <div className="inline-flex rounded-lg border bg-background p-1">
            <button
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'deadline'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setViewMode('deadline')}
            >
              <Clock className="h-3.5 w-3.5" />
              By Deadline
            </button>
            <button
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'permit'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setViewMode('permit')}
            >
              <FolderKanban className="h-3.5 w-3.5" />
              By Permit
            </button>
          </div>

          {/* Status filter */}
          <div className="inline-flex rounded-lg border bg-background p-1">
            {(['open', 'resolved', 'all'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize',
                  statusFilter === s
                    ? 'bg-secondary text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Category filter */}
          {availableCategories.length > 0 && (
            <div className="relative">
              <select
                className="appearance-none rounded-lg border bg-background px-3 py-1.5 pr-8 text-xs font-medium text-foreground"
                value={categoryFilter || ''}
                onChange={(e) => setCategoryFilter(e.target.value || null)}
              >
                <option value="">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat!}>
                    {CATEGORY_LABELS[cat!] || cat}
                  </option>
                ))}
              </select>
              <Filter className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            </div>
          )}

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search comments, permits, projects..."
              className="w-full rounded-lg border bg-background py-1.5 pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* Task list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-400 mb-3" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchTasks}>
              Retry
            </Button>
          </Card>
        ) : filteredTasks.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="mx-auto h-10 w-10 text-green-400 mb-3" />
            <h3 className="text-lg font-medium text-foreground mb-1">
              {statusFilter === 'open' ? 'All caught up!' : 'No tasks found'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {statusFilter === 'open'
                ? 'You have no open comments assigned to you.'
                : 'No tasks match your current filters.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {groupedTasks.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Group header */}
                <div className="flex items-center gap-2 mb-3">
                  {group.icon}
                  <h2 className={cn('text-sm font-semibold', group.colorClass)}>
                    {group.label}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    ({group.items.length} {group.items.length === 1 ? 'comment' : 'comments'})
                  </span>

                  {/* Permit view: show deadline badge in header */}
                  {viewMode === 'permit' && !!(group as Record<string, unknown>).permitMeta && !!((group as Record<string, unknown>).permitMeta as Record<string, string | Record<string, string>>)?.deadline && (
                    <span className={cn(
                      'ml-auto inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                      STATUS_COLORS[getDeadlineUrgency((((group as Record<string, unknown>).permitMeta as Record<string, Record<string, string>>).deadline).due_date)]
                    )}>
                      <Clock className="h-3 w-3" />
                      {formatRelativeDate((((group as Record<string, unknown>).permitMeta as Record<string, Record<string, string>>).deadline).due_date)}
                    </span>
                  )}
                </div>

                {/* Task cards */}
                <div className="space-y-3 pl-6">
                  {group.items.map(({ task, deadline }) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      deadline={deadline}
                      onResolve={handleResolve}
                      onNavigate={handleNavigate}
                      onAiSuggest={handleAiSuggest}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
