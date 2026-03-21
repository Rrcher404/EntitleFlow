/**
 * EntitleFlow AI Agent Layer — Type Definitions
 *
 * Shared types for the multi-agent AI system. Every agent implements
 * AgentPersona and returns typed results through the AgentResponse envelope.
 */

// ---------------------------------------------------------------------------
// Model & Provider
// ---------------------------------------------------------------------------

export type AIProvider = 'openrouter' | 'vertex';

export type AIModel =
  | 'xiaomi/mimo-v2-pro'       // MiMo-v2-Pro via OpenRouter — deep reasoning, 1M ctx
  | 'gemini-2.0-flash';        // Vertex AI — fast classification, low-cost

export interface ModelConfig {
  provider: AIProvider;
  model: AIModel;
  /** Max tokens for the generated completion */
  maxTokens?: number;
  /** Temperature (0-2). Lower = more deterministic. */
  temperature?: number;
  /** Enable extended thinking / chain-of-thought (MiMo-v2-Pro) */
  reasoning?: boolean;
}

// ---------------------------------------------------------------------------
// Agent identity
// ---------------------------------------------------------------------------

export type AgentId =
  | 'comment-analyst'
  | 'response-drafter'
  | 'document-strategist'
  | 'compliance-advisor'
  | 'resubmittal-planner'
  | 'project-intel';

export interface AgentPersona {
  id: AgentId;
  name: string;
  description: string;
  /** The system prompt that shapes this agent's behavior */
  systemPrompt: string;
  /** Default model config — can be overridden per-call */
  defaultModel: ModelConfig;
  /** Which AI task types this agent handles */
  capabilities: AITaskType[];
}

// ---------------------------------------------------------------------------
// Task routing
// ---------------------------------------------------------------------------

export type AITaskType =
  | 'classify-comment'
  | 'suggest-response'
  | 'summarize-document'
  | 'compliance-check'
  | 'resubmittal-plan'
  | 'project-insights'
  | 'batch-classify'
  | 'draft-response-letter';

export interface AITaskRequest {
  taskType: AITaskType;
  /** Primary text input */
  input: string;
  /** Optional structured context */
  context?: Record<string, unknown>;
  /** Override the default model for this task */
  modelOverride?: Partial<ModelConfig>;
}

// ---------------------------------------------------------------------------
// Agent responses
// ---------------------------------------------------------------------------

export interface AgentResponse<T = unknown> {
  agentId: AgentId;
  taskType: AITaskType;
  /** Provider + model actually used */
  model: {
    provider: AIProvider;
    model: AIModel;
  };
  /** The typed result payload */
  result: T;
  /** Reasoning trace (if available from MiMo-v2-Pro extended thinking) */
  reasoning?: string;
  /** Token usage for cost tracking */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
  };
  /** Wall-clock ms for the LLM call */
  latencyMs: number;
}

// ---------------------------------------------------------------------------
// Domain-specific result types
// ---------------------------------------------------------------------------

export type CommentCategory =
  | 'parking_access'
  | 'stormwater'
  | 'building_code'
  | 'zoning'
  | 'fire_safety'
  | 'landscaping'
  | 'traffic'
  | 'environmental'
  | 'general'
  | 'other';

export interface ClassificationResult {
  category: CommentCategory;
  confidence: number;
  reasoning: string;
  /** Severity: how blocking is this comment? */
  severity: 'critical' | 'major' | 'minor' | 'informational';
  /** Suggested priority for triage */
  suggestedPriority: 1 | 2 | 3 | 4;
}

export interface ResponseDraft {
  response: string;
  /** Tone used in the response */
  tone: 'formal' | 'technical' | 'collaborative';
  /** Relevant NC code references cited */
  codeReferences: string[];
  /** Confidence that this response fully addresses the comment */
  confidence: number;
}

export interface DocumentSummary {
  summary: string;
  totalItems: number;
  criticalItems: string[];
  actionItems: Array<{
    item: string;
    category: CommentCategory;
    severity: 'critical' | 'major' | 'minor' | 'informational';
    estimatedEffort: 'low' | 'medium' | 'high';
  }>;
  categories: Record<CommentCategory, number>;
  /** Overall risk assessment for approval */
  approvalRisk: 'low' | 'medium' | 'high';
  /** Estimated time to resolve all items */
  estimatedResolutionDays: number;
}

export interface ComplianceCheckResult {
  /** The specific NC code sections relevant to this comment */
  applicableCodes: Array<{
    code: string;
    section: string;
    title: string;
    relevance: string;
  }>;
  /** Whether the project appears compliant based on available info */
  complianceStatus: 'compliant' | 'non-compliant' | 'needs-review' | 'insufficient-info';
  /** Specific actions needed to achieve compliance */
  requiredActions: string[];
  /** Jurisdiction-specific notes (Greensboro, Raleigh, etc.) */
  jurisdictionNotes: string;
}

export interface ResubmittalPlan {
  /** Prioritized list of items to address */
  prioritizedItems: Array<{
    commentId?: string;
    description: string;
    category: CommentCategory;
    priority: 1 | 2 | 3;
    suggestedResponse: string;
    estimatedEffort: 'low' | 'medium' | 'high';
  }>;
  /** Suggested grouping of items for efficient resolution */
  workPackages: Array<{
    name: string;
    items: string[];
    assignTo: string;
    estimatedDays: number;
  }>;
  /** Overall strategy narrative */
  strategy: string;
  /** Total estimated days to complete resubmittal */
  totalEstimatedDays: number;
}

export interface ProjectInsights {
  /** Pattern analysis across comments */
  patterns: Array<{
    pattern: string;
    frequency: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  }>;
  /** Predicted timeline to approval */
  predictedApprovalDays: number;
  /** Risk factors that could delay approval */
  riskFactors: string[];
  /** Recommendations for improving the process */
  recommendations: string[];
  /** Comparison to similar past projects (if data available) */
  benchmarkNotes: string;
}
