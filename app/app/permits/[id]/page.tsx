'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Permit,
  Project,
  Comment,
  PermitStatusHistory,
  Document,
  Deadline,
  ActivityLogEntry,
  Profile,
} from '@/lib/types/index';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  FileText,
  Calendar,
  MapPin,
  ChevronDown,
  Search,
  Filter,
  Check,
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type PermitStatus = 'draft' | 'submitted' | 'under_review' | 'revision_requested' | 'resubmitted' | 'approved' | 'approved_with_conditions' | 'denied' | 'withdrawn' | 'expired';

interface CommentWithAuthor extends Comment {
  author?: Profile;
  replies?: CommentWithAuthor[];
  aiSuggestion?: {
    text: string;
    tone?: string;
    codeReferences?: string[];
    confidence?: number;
    agentId?: string;
    model?: { provider: string; model: string };
    generatedAt: string;
    isLoading?: boolean;
  };
}

interface TabState {
  comments: 'all' | 'open' | 'resolved';
  searchText: string;
  categoryFilter: string | null;
  assigneeFilter: string | null;
  selectedCommentIds: Set<string>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PERMIT_STATUS_FLOW: PermitStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'revision_requested',
  'resubmitted',
  'approved',
];

const STATUS_LABELS: Record<PermitStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  revision_requested: 'Revision Requested',
  resubmitted: 'Resubmitted',
  approved: 'Approved',
  approved_with_conditions: 'Approved w/ Conditions',
  denied: 'Denied',
  withdrawn: 'Withdrawn',
  expired: 'Expired',
};

const STATUS_COLORS: Record<PermitStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-300',
  submitted: 'bg-blue-100 text-blue-800 border-blue-300',
  under_review: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  revision_requested: 'bg-orange-100 text-orange-800 border-orange-300',
  resubmitted: 'bg-purple-100 text-purple-800 border-purple-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  approved_with_conditions: 'bg-green-100 text-green-800 border-green-300',
  denied: 'bg-red-100 text-red-800 border-red-300',
  withdrawn: 'bg-gray-100 text-gray-800 border-gray-300',
  expired: 'bg-gray-100 text-gray-800 border-gray-300',
};

const COMMENT_CATEGORIES = [
  'Stormwater',
  'Grading',
  'Site Plan',
  'Traffic',
  'Environmental',
  'Other',
];

const VALID_STATUS_TRANSITIONS: Record<PermitStatus, PermitStatus[]> = {
  draft: ['submitted', 'withdrawn'],
  submitted: ['under_review', 'withdrawn'],
  under_review: ['revision_requested', 'approved', 'approved_with_conditions', 'denied'],
  revision_requested: ['resubmitted', 'withdrawn'],
  resubmitted: ['under_review', 'withdrawn'],
  approved: [],
  approved_with_conditions: [],
  denied: [],
  withdrawn: [],
  expired: [],
};

const formatDate = (s: string | null) => {
  if (!s) return '';
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ============================================================================
// STATUS TIMELINE COMPONENT
// ============================================================================

function StatusTimeline({ permit, onStatusChange }: { permit: Permit; onStatusChange: (status: PermitStatus) => Promise<void> }) {
  const [isChanging, setIsChanging] = useState(false);
  const currentStatusIndex = PERMIT_STATUS_FLOW.indexOf(permit.status as PermitStatus);
  const validTransitions = VALID_STATUS_TRANSITIONS[permit.status as PermitStatus] || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-sm">Status Timeline</h3>
        {validTransitions.length > 0 && (
          <div className="ml-auto relative">
            <select
              disabled={isChanging}
              onChange={async (e) => {
                setIsChanging(true);
                try {
                  await onStatusChange(e.target.value as PermitStatus);
                } finally {
                  setIsChanging(false);
                }
              }}
              className="text-sm px-2 py-1 border rounded bg-white cursor-pointer disabled:opacity-50"
              defaultValue=""
            >
              <option value="">Change Status...</option>
              {validTransitions.map((status) => (
                <option key={status} value={status}>
                  → {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {PERMIT_STATUS_FLOW.map((status, idx) => (
          <div key={status} className="flex items-center gap-2 flex-shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                idx < currentStatusIndex
                  ? 'bg-green-500 text-white'
                  : idx === currentStatusIndex
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : 'bg-gray-200 text-gray-600'
              }`}
            >
              {idx < currentStatusIndex ? <Check size={16} /> : idx + 1}
            </div>
            <span className={`text-xs font-medium whitespace-nowrap ${idx === currentStatusIndex ? 'text-blue-600 font-bold' : ''}`}>
              {status === 'under_review' ? 'Review' : status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
            </span>
            {idx < PERMIT_STATUS_FLOW.length - 1 && <div className="w-6 h-0.5 bg-gray-300" />}
          </div>
        ))}
      </div>
    </div>
  );
}


// ============================================================================
// COMMENT CARD COMPONENT
// ============================================================================

function CommentCard({
  comment,
  allProfiles,
  onResolve,
  onAssign,
  onAiSuggest,
  onReply,
  isSelected,
  onSelect,
}: {
  comment: CommentWithAuthor;
  allProfiles: Profile[];
  onResolve: (commentId: string) => Promise<void>;
  onAssign: (commentId: string, profileId: string) => Promise<void>;
  onAiSuggest: (commentId: string) => Promise<void>;
  onReply: (commentId: string) => void;
  isSelected: boolean;
  onSelect: (commentId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [showAiSuggestion, setShowAiSuggestion] = useState(!!comment.aiSuggestion);

  return (
    <Card className="border-l-4" style={{ borderLeftColor: comment.is_resolved ? '#22c55e' : '#f97316' }}>
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(comment.id)}
            className="mt-1"
          />

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                {comment.category || 'General'}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded font-medium ${
                  comment.is_resolved
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {comment.is_resolved ? '✅ Resolved' : '🔴 Open'}
              </span>
            </div>

            <p className="text-sm text-gray-700 mb-2">{comment.body}</p>

            <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
              <span className="font-medium">👤 {comment.author_name}</span>
              {comment.source && <span>|</span>}
              {comment.source && <span className="capitalize">{comment.source}</span>}
              {comment.created_at && (
                <>
                  <span>|</span>
                  <span>{formatDate(comment.created_at)}</span>
                </>
              )}
            </div>

            {(comment as any).metadata?.assigned_to && (
              <div className="text-xs text-gray-600 mb-3">
                Assigned to:{' '}
                {allProfiles.find((p) => p.id === (comment as any).metadata?.assigned_to)?.full_name ||
                  'Unknown'}
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <button
                disabled={isResolving}
                onClick={async () => {
                  setIsResolving(true);
                  try {
                    await onResolve(comment.id);
                  } finally {
                    setIsResolving(false);
                  }
                }}
                className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                  comment.is_resolved
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {comment.is_resolved ? '✓ Resolved' : '✅ Resolve'}
              </button>

              <select
                onChange={(e) => onAssign(comment.id, e.target.value)}
                className="text-xs px-2 py-1 border rounded bg-white cursor-pointer"
                defaultValue=""
              >
                <option value="">👤 Assign...</option>
                {allProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.full_name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowAiSuggestion(!showAiSuggestion)}
                className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 font-medium transition-colors"
              >
                🤖 AI Suggest
              </button>

              <button
                onClick={() => onReply(comment.id)}
                className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors"
              >
                ↩ Reply
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            <ChevronDown size={18} />
          </button>
        </div>

        {showAiSuggestion && comment.aiSuggestion && (
          <div className="ml-6 p-3 bg-purple-50 border border-purple-200 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-purple-900">
                🤖 AI Suggested Response
              </div>
              {comment.aiSuggestion.agentId && !comment.aiSuggestion.isLoading && (
                <div className="flex items-center gap-2">
                  {comment.aiSuggestion.confidence && (
                    <span className="text-xs text-purple-600">
                      {Math.round(comment.aiSuggestion.confidence * 100)}% confident
                    </span>
                  )}
                  {comment.aiSuggestion.model && (
                    <span className="text-xs px-1.5 py-0.5 bg-purple-200 text-purple-800 rounded font-mono">
                      {comment.aiSuggestion.model.provider === 'openrouter' ? 'MiMo' : 'Gemini'}
                    </span>
                  )}
                </div>
              )}
            </div>
            {comment.aiSuggestion.isLoading ? (
              <div className="flex items-center gap-2 text-xs text-purple-600">
                <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                Generating response...
              </div>
            ) : (
              <>
                <p className="text-xs text-purple-800 mb-2">{comment.aiSuggestion.text}</p>
                {comment.aiSuggestion.codeReferences && comment.aiSuggestion.codeReferences.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-purple-700">References: </span>
                    <span className="text-xs text-purple-600">
                      {comment.aiSuggestion.codeReferences.join(', ')}
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="flex gap-2">
              <button className="text-xs px-2 py-1 bg-purple-200 text-purple-900 rounded hover:bg-purple-300 font-medium">
                Copy
              </button>
              <button className="text-xs px-2 py-1 bg-purple-200 text-purple-900 rounded hover:bg-purple-300 font-medium">
                Insert as Reply
              </button>
              <button
                onClick={() => onAiSuggest(comment.id)}
                className="text-xs px-2 py-1 bg-purple-200 text-purple-900 rounded hover:bg-purple-300 font-medium"
              >
                Regenerate
              </button>
              <button
                onClick={() => setShowAiSuggestion(false)}
                className="text-xs px-2 py-1 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 font-medium ml-auto"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-6 space-y-2 pt-2 border-t border-gray-200">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="text-sm bg-gray-50 p-2 rounded">
                <div className="font-medium text-xs text-gray-700 mb-1">
                  {reply.author_name}
                </div>
                <div className="text-xs text-gray-600">{reply.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}


// ============================================================================
// DOCUMENTS TAB COMPONENT
// ============================================================================

function DocumentsTab({
  documents,
  onUpload,
  isLoading,
}: {
  documents: Document[];
  onUpload: () => Promise<void>;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Documents ({documents.length})</h3>
        <Button
          size="sm"
          disabled={isLoading}
          onClick={onUpload}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Upload
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText size={32} className="mx-auto mb-2 opacity-50" />
          <p>No documents uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded border"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-blue-600" />
                <div>
                  <div className="text-sm font-medium">{doc.file_name}</div>
                  <div className="text-xs text-gray-500">
                    {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''} •{' '}
                    {formatDate(doc.created_at)}
                  </div>
                </div>
              </div>
              <a href={(doc as any).file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TIMELINE TAB COMPONENT
// ============================================================================

function TimelineTab({
  statusHistory,
  activityLog,
}: {
  statusHistory: PermitStatusHistory[];
  activityLog: ActivityLogEntry[];
}) {
  const combined = [
    ...statusHistory.map((item) => ({
      type: 'status' as const,
      date: item.created_at,
      data: item,
    })),
    ...activityLog.map((item) => ({
      type: 'activity' as const,
      date: item.created_at,
      data: item,
    })),
  ]
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 50);

  return (
    <div className="space-y-3">
      {combined.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar size={32} className="mx-auto mb-2 opacity-50" />
          <p>No activity yet</p>
        </div>
      ) : (
        combined.map((item, idx) => (
          <div key={`${item.type}-${idx}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-blue-600 mt-1.5" />
              {idx < combined.length - 1 && <div className="w-0.5 h-12 bg-gray-300" />}
            </div>
            <div className="pb-4">
              <div className="text-sm font-medium">
                {item.type === 'status'
                  ? `Status changed to ${STATUS_LABELS[(item.data as PermitStatusHistory).to_status as PermitStatus]}`
                  : item.data.description || 'Activity recorded'}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(item.date)}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}


// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function PermitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const permitId = params?.id as string;

  // State
  const [permit, setPermit] = useState<Permit | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [statusHistory, setStatusHistory] = useState<PermitStatusHistory[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);

  const [activeTab, setActiveTab] = useState<'comments' | 'documents' | 'timeline' | 'details'>('comments');
  const [tabState, setTabState] = useState<TabState>({
    comments: 'all',
    searchText: '',
    categoryFilter: null,
    assigneeFilter: null,
    selectedCommentIds: new Set(),
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const supabase = createClient();

  // Load permit data
  useEffect(() => {
    const loadData = async () => {
      if (!supabase) return;
      try {
        setLoading(true);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('Auth failed');

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profileData) throw new Error('Profile not found');

        const orgId = profileData.organization_id;

        // Fetch permit
        const { data: permitData, error: permitError } = await supabase
          .from('permits')
          .select('*')
          .eq('id', permitId)
          .eq('organization_id', orgId)
          .single();

        if (permitError || !permitData) throw new Error('Permit not found');
        setPermit(permitData as Permit);

        // Fetch project
        if (permitData.project_id) {
          const { data: projectData } = await supabase
            .from('projects')
            .select('*')
            .eq('id', permitData.project_id)
            .single();
          setProject(projectData as Project);
        }

        // Fetch comments
        const { data: commentsData } = await supabase
          .from('comments')
          .select('*')
          .eq('permit_id', permitId)
          .order('created_at', { ascending: true });
        setComments((commentsData || []) as CommentWithAuthor[]);

        // Fetch documents
        const { data: docsData } = await supabase
          .from('documents')
          .select('*')
          .eq('permit_id', permitId)
          .order('created_at', { ascending: false });
        setDocuments((docsData || []) as Document[]);

        // Fetch status history
        const { data: historyData } = await supabase
          .from('permit_status_history')
          .select('*')
          .eq('permit_id', permitId)
          .order('created_at', { ascending: false });
        setStatusHistory((historyData || []) as PermitStatusHistory[]);

        // Fetch activity log
        const { data: activityData } = await supabase
          .from('activity_log')
          .select('*')
          .eq('permit_id', permitId)
          .order('created_at', { ascending: false });
        setActivityLog((activityData || []) as ActivityLogEntry[]);

        // Fetch deadlines
        const { data: deadlineData } = await supabase
          .from('deadlines')
          .select('*')
          .eq('permit_id', permitId);
        setDeadlines((deadlineData || []) as Deadline[]);

        // Fetch team members
        const { data: teamData } = await supabase
          .from('profiles')
          .select('*')
          .eq('organization_id', orgId);
        setTeamMembers((teamData || []) as Profile[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load permit');
        console.error('Error loading permit:', err);
      } finally {
        setLoading(false);
      }
    };

    if (permitId) {
      loadData();
    }
  }, [permitId, supabase]);

  // Status change handler
  const handleStatusChange = useCallback(
    async (newStatus: PermitStatus) => {
      if (!permit || !supabase) return;

      setIsChangingStatus(true);
      try {
        const { error: updateError } = await supabase
          .from('permits')
          .update({ status: newStatus })
          .eq('id', permit.id);

        if (updateError) throw updateError;

        const { error: historyError } = await supabase
          .from('permit_status_history')
          .insert({
            permit_id: permit.id,
            from_status: permit.status,
            to_status: newStatus,
          } as any);

        if (historyError) throw historyError;

        setPermit({ ...permit, status: newStatus });

        const { data: historyData } = await supabase
          .from('permit_status_history')
          .select('*')
          .eq('permit_id', permit.id)
          .order('created_at', { ascending: false });
        setStatusHistory((historyData || []) as PermitStatusHistory[]);
      } catch (err) {
        console.error('Error changing status:', err);
        setError('Failed to change status');
      } finally {
        setIsChangingStatus(false);
      }
    },
    [permit, supabase]
  );


  // Resolve comment handler
  const handleResolveComment = useCallback(
    async (commentId: string) => {
      if (!supabase) return;
      try {
        const { error } = await supabase
          .from('comments')
          .update({ is_resolved: true, resolved_at: new Date().toISOString() })
          .eq('id', commentId);

        if (error) throw error;

        setComments(
          comments.map((c) =>
            c.id === commentId
              ? { ...c, is_resolved: true, resolved_at: new Date().toISOString() }
              : c
          )
        );
      } catch (err) {
        console.error('Error resolving comment:', err);
      }
    },
    [comments, supabase]
  );

  // Assign comment handler
  const handleAssignComment = useCallback(
    async (commentId: string, profileId: string) => {
      if (!supabase) return;
      try {
        const { error } = await supabase
          .from('comments')
          .update({
            metadata: {
              assigned_to: profileId,
            },
          })
          .eq('id', commentId);

        if (error) throw error;

        setComments(
          comments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  metadata: {
                    ...(typeof c.metadata === 'object' && c.metadata !== null ? c.metadata : {}),
                    assigned_to: profileId,
                  } as any,
                }
              : c
          )
        );
      } catch (err) {
        console.error('Error assigning comment:', err);
      }
    },
    [comments, supabase]
  );

  // AI suggest handler — calls the Response Drafter agent via API
  const handleAiSuggest = useCallback(async (commentId: string) => {
    // Set loading state
    setComments(
      comments.map((c) =>
        c.id === commentId
          ? { ...c, aiSuggestion: { text: '', generatedAt: '', isLoading: true } }
          : c
      )
    );

    try {
      const res = await fetch(`/api/comments/${commentId}/ai-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Failed to generate AI suggestion');
      }

      const data = await res.json();

      setComments(
        comments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                aiSuggestion: {
                  text: data.suggestion,
                  tone: data.tone,
                  codeReferences: data.codeReferences,
                  confidence: data.confidence,
                  agentId: data.agentId,
                  model: data.model,
                  generatedAt: new Date().toISOString(),
                },
              }
            : c
        )
      );
    } catch (error) {
      console.error('AI suggest error:', error);
      setComments(
        comments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                aiSuggestion: {
                  text: 'Failed to generate suggestion. Please try again.',
                  generatedAt: new Date().toISOString(),
                },
              }
            : c
        )
      );
    }
  }, [comments]);

  // Reply comment handler
  const handleReplyComment = useCallback(
    (commentId: string) => {
      console.log('Reply to comment:', commentId);
    },
    []
  );

  // Filter comments based on tab state
  const filteredComments = comments.filter((c) => {
    if (tabState.comments === 'open' && c.is_resolved) return false;
    if (tabState.comments === 'resolved' && !c.is_resolved) return false;
    if (tabState.searchText && !c.body.toLowerCase().includes(tabState.searchText.toLowerCase())) return false;
    if (tabState.categoryFilter && c.category !== tabState.categoryFilter) return false;
    return true;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-72" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    );
  }

  // Error state
  if (!permit || error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle size={40} className="mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Permit not found'}</p>
          <Button onClick={() => router.back()} className="bg-blue-600 hover:bg-blue-700">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }


  // Main render
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={18} />
          Back to Permits
        </button>

        {project && (
          <div className="text-sm text-gray-600 mb-3">
            Project: <span className="font-medium">{project.name}</span>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{permit.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                  STATUS_COLORS[permit.status as PermitStatus]
                }`}
              >
                {STATUS_LABELS[permit.status as PermitStatus]}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                {permit.priority === 'high' ? '🔴' : permit.priority === 'urgent' ? '⚡' : '🟡'} {permit.priority}
              </span>
              {permit.jurisdiction && (
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin size={16} />
                  {permit.jurisdiction}
                </span>
              )}
            </div>
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700">Edit</Button>
        </div>
      </div>

      {/* Status Timeline */}
      <Card className="p-6 mb-6" style={{ backgroundColor: '#FDFBF7' }}>
        <StatusTimeline permit={permit} onStatusChange={handleStatusChange} />
      </Card>

      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="flex gap-4 border-b border-gray-200 bg-white rounded-t px-6">
          {[
            { id: 'comments', label: `Comments (${comments.length})`, icon: MessageSquare },
            { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
            { id: 'timeline', label: 'Timeline', icon: Calendar },
            { id: 'details', label: 'Details', icon: Clock },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Container */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7' }}>
        {/* COMMENTS TAB */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex gap-3 flex-wrap items-center">
              <div className="flex-1 min-w-64 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search comments..."
                  value={tabState.searchText}
                  onChange={(e) =>
                    setTabState({ ...tabState, searchText: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border rounded bg-white"
                />
              </div>

              <select
                value={tabState.categoryFilter || ''}
                onChange={(e) =>
                  setTabState({
                    ...tabState,
                    categoryFilter: e.target.value || null,
                  })
                }
                className="px-3 py-2 border rounded bg-white cursor-pointer"
              >
                <option value="">All Categories</option>
                {COMMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={tabState.comments}
                onChange={(e) =>
                  setTabState({
                    ...tabState,
                    comments: e.target.value as 'all' | 'open' | 'resolved',
                  })
                }
                className="px-3 py-2 border rounded bg-white cursor-pointer"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Stats */}
            <div className="text-sm text-gray-600">
              Showing {filteredComments.length} of {comments.length} comments |{' '}
              {comments.filter((c) => c.is_resolved).length} resolved |{' '}
              {comments.filter((c) => !c.is_resolved).length} open
            </div>

            {/* Bulk Actions */}
            {tabState.selectedCommentIds.size > 0 && (
              <div className="flex gap-2 p-3 bg-blue-50 rounded border border-blue-200">
                <span className="text-sm font-medium">
                  {tabState.selectedCommentIds.size} selected
                </span>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Bulk Resolve
                </Button>
                <select className="text-sm px-2 py-1 border rounded bg-white cursor-pointer">
                  <option value="">Bulk Assign...</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {filteredComments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No comments found</p>
                </div>
              ) : (
                filteredComments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    allProfiles={teamMembers}
                    onResolve={handleResolveComment}
                    onAssign={handleAssignComment}
                    onAiSuggest={handleAiSuggest}
                    onReply={handleReplyComment}
                    isSelected={tabState.selectedCommentIds.has(comment.id)}
                    onSelect={(commentId) => {
                      const newSelected = new Set(tabState.selectedCommentIds);
                      if (newSelected.has(commentId)) {
                        newSelected.delete(commentId);
                      } else {
                        newSelected.add(commentId);
                      }
                      setTabState({ ...tabState, selectedCommentIds: newSelected });
                    }}
                  />
                ))
              )}
            </div>

            {/* Add Comment Button */}
            <div className="pt-6 border-t">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10">
                + Add Comment
              </Button>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <DocumentsTab
            documents={documents}
            onUpload={async () => {}}
            isLoading={loading}
          />
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <TimelineTab statusHistory={statusHistory} activityLog={activityLog} />
        )}


        {/* DETAILS TAB */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Permit ID', value: permit.id },
                {
                  label: 'Type',
                  value: permit.permit_type
                    ? permit.permit_type.replace(/_/g, ' ').toUpperCase()
                    : '—',
                },
                { label: 'Jurisdiction', value: permit.jurisdiction || '—' },
                {
                  label: 'Assigned Reviewer',
                  value: permit.assigned_reviewer || '—',
                },
                {
                  label: 'Reviewer Email',
                  value: permit.reviewer_email || '—',
                },
                { label: 'Priority', value: permit.priority },
                {
                  label: 'Fee Amount',
                  value: permit.fee_amount
                    ? `$${permit.fee_amount.toFixed(2)}`
                    : '—',
                },
                {
                  label: 'Fee Paid',
                  value: permit.fee_paid ? '✅ Yes' : '❌ No',
                },
                {
                  label: 'Created',
                  value: formatDate(permit.created_at),
                },
                {
                  label: 'Updated',
                  value: formatDate(permit.updated_at),
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    {label}
                  </div>
                  <div className="text-sm font-medium text-gray-900">{value}</div>
                </div>
              ))}
            </div>

            {permit.description && (
              <div className="mt-6 p-4 bg-white rounded border">
                <div className="text-xs font-semibold text-gray-600 mb-2">
                  Description
                </div>
                <p className="text-sm text-gray-700">{permit.description}</p>
              </div>
            )}

            <Button className="bg-blue-600 hover:bg-blue-700">
              Edit Details
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
