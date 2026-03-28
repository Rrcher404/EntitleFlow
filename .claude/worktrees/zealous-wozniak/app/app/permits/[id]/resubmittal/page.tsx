'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  ChevronDown,
  ChevronRight,
  Copy,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Comment {
  id: string;
  body: string;
  category: string;
  is_resolved: boolean;
  ai_suggested_response?: string;
  ai_confidence?: number;
  assigned_to?: string;
  metadata?: Record<string, any>;
}

interface Permit {
  id: string;
  permit_number: string;
  title: string;
  status: string;
  project_id: string;
}

interface ResubmittalPlanItem {
  commentId?: string;
  description: string;
  category: string;
  priority: number;
  suggestedResponse: string;
  estimatedEffort: string;
}

interface WorkPackage {
  name: string;
  items: string[];
  assignTo: string;
  estimatedDays: number;
}

interface ResubmittalPlan {
  prioritizedItems: ResubmittalPlanItem[];
  workPackages: WorkPackage[];
  strategy: string;
  totalEstimatedDays: number;
}

interface ResponseLetter {
  letter: string;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const categoryColors: Record<string, string> = {
  parking_access: 'bg-blue-100 text-blue-800',
  stormwater: 'bg-cyan-100 text-cyan-800',
  building_code: 'bg-orange-100 text-orange-800',
  zoning: 'bg-purple-100 text-purple-800',
  fire_safety: 'bg-red-100 text-red-800',
  landscaping: 'bg-green-100 text-green-800',
  traffic: 'bg-amber-100 text-amber-800',
  environmental: 'bg-teal-100 text-teal-800',
  general: 'bg-gray-100 text-gray-800',
};

const effortBadge: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const priorityLabel: Record<number, { label: string; color: string }> = {
  1: { label: 'Critical', color: 'text-red-600' },
  2: { label: 'High', color: 'text-orange-600' },
  3: { label: 'Medium', color: 'text-yellow-600' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ResubmittalPage() {
  const params = useParams();
  const router = useRouter();
  const permitId = params.id as string;

  const [permit, setPermit] = useState<Permit | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [plan, setPlan] = useState<ResubmittalPlan | null>(null);
  const [responseLetter, setResponseLetter] = useState<ResponseLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'letter' | 'responses'>('plan');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [editingResponses, setEditingResponses] = useState<Record<string, string>>({});

  const supabase = createClient();

  // Load permit + comments
  useEffect(() => {
    async function load() {
      if (!supabase) return;
      setLoading(true);

      try {
        // Fetch permit
        const { data: permitData } = await supabase
          .from('permits')
          .select('id, permit_number, title, status, project_id')
          .eq('id', permitId)
          .single();

        if (permitData) setPermit(permitData as any);

        // Fetch comments for this permit
        const { data: commentData } = await supabase
          .from('comments')
          .select('id, body, category, is_resolved, ai_suggested_response, ai_confidence, assigned_to, metadata')
          .eq('permit_id', permitId)
          .order('created_at', { ascending: true });

        if (commentData) setComments(commentData as any);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [supabase, permitId]);

  // Generate resubmittal plan
  const generatePlan = useCallback(async () => {
    if (!permit || comments.length === 0) return;

    setGeneratingPlan(true);
    try {
      const response = await fetch('/api/ai/resubmittal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comments: comments
            .filter(c => !c.is_resolved)
            .map(c => ({
              id: c.id,
              text: c.body,
              category: c.category,
            })),
          context: {
            permitNumber: permit.permit_number,
            projectName: permit.title,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPlan(data.plan || data.data || data);
      }
    } catch (err) {
      console.error('Failed to generate plan:', err);
    } finally {
      setGeneratingPlan(false);
    }
  }, [permit, comments]);

  // Generate response letter
  const generateLetter = useCallback(async () => {
    if (!permit || comments.length === 0) return;

    setGeneratingLetter(true);
    try {
      const response = await fetch('/api/ai/response-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comments: comments.map(c => ({
            id: c.id,
            text: c.body,
            category: c.category,
            response: editingResponses[c.id] || c.ai_suggested_response || '',
          })),
          projectInfo: {
            permitNumber: permit.permit_number,
            name: permit.title,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResponseLetter({
          letter: data.letter || data.data?.letter || data.response || '',
          generatedAt: new Date().toISOString(),
        });
        setActiveTab('letter');
      }
    } catch (err) {
      console.error('Failed to generate letter:', err);
    } finally {
      setGeneratingLetter(false);
    }
  }, [permit, comments, editingResponses]);

  // Toggle item expansion
  const toggleItem = (index: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Copy letter to clipboard
  const copyLetter = async () => {
    if (responseLetter?.letter) {
      await navigator.clipboard.writeText(responseLetter.letter);
    }
  };

  // Stats
  const openComments = comments.filter(c => !c.is_resolved);
  const resolvedComments = comments.filter(c => c.is_resolved);
  const withAiResponse = comments.filter(c => c.ai_suggested_response);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push(`/app/permits/${permitId}`)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Permit
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Resubmittal Package</h1>
          <p className="text-sm text-gray-600 mt-1">
            {permit?.permit_number} — {permit?.title}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={generatePlan}
            disabled={generatingPlan || openComments.length === 0}
            className="bg-[#1B3B2D] text-white hover:bg-[#153229]"
          >
            {generatingPlan ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Plan...</>
            ) : (
              <><Zap className="w-4 h-4 mr-2" /> Generate AI Plan</>
            )}
          </Button>
          <Button
            onClick={generateLetter}
            disabled={generatingLetter}
            variant="outline"
          >
            {generatingLetter ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><FileText className="w-4 h-4 mr-2" /> Generate Response Letter</>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-[#E8E0D0] bg-[#FDFBF7]">
          <div className="text-2xl font-bold text-gray-900">{openComments.length}</div>
          <div className="text-xs text-gray-600 mt-1">Open Comments</div>
        </Card>
        <Card className="p-4 border-[#E8E0D0] bg-[#FDFBF7]">
          <div className="text-2xl font-bold text-green-700">{resolvedComments.length}</div>
          <div className="text-xs text-gray-600 mt-1">Resolved</div>
        </Card>
        <Card className="p-4 border-[#E8E0D0] bg-[#FDFBF7]">
          <div className="text-2xl font-bold text-blue-700">{withAiResponse.length}</div>
          <div className="text-xs text-gray-600 mt-1">AI Responses Ready</div>
        </Card>
        <Card className="p-4 border-[#E8E0D0] bg-[#FDFBF7]">
          <div className="text-2xl font-bold text-purple-700">
            {plan?.totalEstimatedDays || '—'}
          </div>
          <div className="text-xs text-gray-600 mt-1">Est. Days to Complete</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E8E0D0]">
        {(['plan', 'responses', 'letter'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2',
              activeTab === tab
                ? 'border-[#1B3B2D] text-[#1B3B2D]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            {tab === 'plan' && 'Resubmittal Plan'}
            {tab === 'responses' && `Comment Responses (${comments.length})`}
            {tab === 'letter' && 'Response Letter'}
          </button>
        ))}
      </div>

      {/* Plan Tab */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          {!plan ? (
            <Card className="border-[#E8E0D0] bg-[#FDFBF7] p-12 text-center">
              <Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700">No plan generated yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                Click "Generate AI Plan" to create a prioritized resubmittal strategy
              </p>
            </Card>
          ) : (
            <>
              {/* Strategy Overview */}
              <Card className="border-[#E8E0D0] bg-[#FDFBF7] p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Strategy</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{plan.strategy}</p>
              </Card>

              {/* Prioritized Items */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">
                  Prioritized Items ({plan.prioritizedItems.length})
                </h3>
                {plan.prioritizedItems.map((item, i) => (
                  <Card
                    key={i}
                    className="border-[#E8E0D0] bg-[#FDFBF7] overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(i)}
                      className="w-full p-4 flex items-start gap-3 text-left hover:bg-white/50 transition-colors"
                    >
                      <span className="text-sm font-mono font-bold text-gray-400 mt-0.5">
                        #{i + 1}
                      </span>
                      {expandedItems.has(i) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={cn('text-xs px-2 py-0.5 rounded-full', categoryColors[item.category] || categoryColors.general)}>
                            {item.category.replace('_', ' ')}
                          </span>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full', effortBadge[item.estimatedEffort] || effortBadge.medium)}>
                            {item.estimatedEffort} effort
                          </span>
                          <span className={cn('text-xs font-medium', priorityLabel[item.priority]?.color || 'text-gray-600')}>
                            {priorityLabel[item.priority]?.label || `P${item.priority}`}
                          </span>
                        </div>
                      </div>
                    </button>

                    {expandedItems.has(i) && item.suggestedResponse && (
                      <div className="px-4 pb-4 pl-14 border-t border-[#E8E0D0]">
                        <p className="text-xs font-medium text-gray-500 mt-3 mb-1">Suggested Response</p>
                        <p className="text-sm text-gray-700 bg-white/60 rounded p-3">
                          {item.suggestedResponse}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Work Packages */}
              {plan.workPackages && plan.workPackages.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Work Packages</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.workPackages.map((pkg, i) => (
                      <Card key={i} className="border-[#E8E0D0] bg-[#FDFBF7] p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{pkg.name}</h4>
                          <span className="text-xs text-gray-500">
                            {pkg.estimatedDays} day{pkg.estimatedDays !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">Assign to: {pkg.assignTo}</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {pkg.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <span className="text-gray-400 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Responses Tab */}
      {activeTab === 'responses' && (
        <div className="space-y-4">
          {comments.map(comment => (
            <Card key={comment.id} className="border-[#E8E0D0] bg-[#FDFBF7] p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', categoryColors[comment.category] || categoryColors.general)}>
                    {comment.category?.replace('_', ' ') || 'general'}
                  </span>
                  {comment.is_resolved ? (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="w-3.5 h-3.5" /> Resolved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <Clock className="w-3.5 h-3.5" /> Open
                    </span>
                  )}
                </div>
                {comment.ai_confidence != null && (
                  <span className="text-xs text-blue-600 font-medium">
                    AI {Math.round(comment.ai_confidence * 100)}%
                  </span>
                )}
              </div>

              {/* Comment body */}
              <p className="text-sm text-gray-900 mb-3">{comment.body}</p>

              {/* Response editor */}
              <div className="border-t border-[#E8E0D0] pt-3">
                <label className="text-xs font-medium text-gray-500 block mb-1">
                  Response
                </label>
                <textarea
                  value={editingResponses[comment.id] ?? comment.ai_suggested_response ?? ''}
                  onChange={(e) =>
                    setEditingResponses(prev => ({ ...prev, [comment.id]: e.target.value }))
                  }
                  placeholder="Write your response to this comment, or use AI to suggest one..."
                  className="w-full text-sm border border-gray-200 rounded-md p-3 min-h-[80px] resize-y focus:outline-none focus:ring-1 focus:ring-[#1B3B2D] bg-white"
                />
                {!comment.ai_suggested_response && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/comments/${comment.id}/ai-response`, {
                          method: 'POST',
                        });
                        if (res.ok) {
                          const data = await res.json();
                          const aiResponse = data.response || data.data?.response || '';
                          setEditingResponses(prev => ({
                            ...prev,
                            [comment.id]: aiResponse,
                          }));
                        }
                      } catch (err) {
                        console.error('AI suggest failed:', err);
                      }
                    }}
                  >
                    <Zap className="w-3.5 h-3.5 mr-1" /> AI Suggest Response
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Letter Tab */}
      {activeTab === 'letter' && (
        <div className="space-y-4">
          {!responseLetter ? (
            <Card className="border-[#E8E0D0] bg-[#FDFBF7] p-12 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700">No response letter yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                Edit individual responses in the "Comment Responses" tab, then click
                "Generate Response Letter" to compile them into a formal letter.
              </p>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Generated {new Date(responseLetter.generatedAt).toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyLetter}>
                    <Copy className="w-4 h-4 mr-1" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={generateLetter}>
                    <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
                  </Button>
                </div>
              </div>
              <Card className="border-[#E8E0D0] bg-white p-8">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {responseLetter.letter}
                </pre>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}
