/**
 * EntitleFlow AI — Task Router
 *
 * The central dispatch point for all AI tasks. Routes requests to the
 * correct agent and model based on task type. Provides a single API
 * surface for the rest of the application.
 *
 * Architecture:
 *   Request → Router → Agent Persona + Model Config → LLM → Response
 *
 * The router doesn't know or care which LLM is behind each agent —
 * that's configured in model-registry.ts (the "memory card slot").
 */

import {
  classifyComment,
  batchClassify,
  draftResponse,
  draftResponseLetter,
  analyzeDocument,
  checkCompliance,
  planResubmittal,
  analyzeProject,
  listAgents,
  getAgentForTask,
} from './agents';
import { ENHANCEMENT_LAYER_ENABLED } from './model-registry';
import type {
  AgentResponse,
  AITaskType,
  ClassificationResult,
  ComplianceCheckResult,
  CommentCategory,
  DocumentSummary,
  ProjectInsights,
  ResubmittalPlan,
  ResponseDraft,
} from './types';

// ---------------------------------------------------------------------------
// Router — the single entry point for all AI operations
// ---------------------------------------------------------------------------

export const AIRouter = {
  // -----------------------------------------------------------------------
  // Core capabilities (Gemini backbone)
  // -----------------------------------------------------------------------

  /**
   * Classify a permit review comment.
   * Model: Gemini 2.0 Flash (fast, cheap)
   */
  classifyComment(
    commentText: string,
    options?: { deep?: boolean },
  ): Promise<AgentResponse<ClassificationResult>> {
    return classifyComment(commentText, options);
  },

  /**
   * Batch classify multiple comments.
   * Model: Enhancement model (MiMo if enabled, else Gemini)
   */
  batchClassify(
    comments: Array<{ id: string; text: string }>,
  ): Promise<AgentResponse<Array<ClassificationResult & { commentId: string }>>> {
    return batchClassify(comments);
  },

  /**
   * Generate a response draft for a review comment.
   * Model: Enhancement model for best quality
   */
  draftResponse(
    commentText: string,
    category: CommentCategory | string,
    options?: {
      tone?: 'formal' | 'technical' | 'collaborative';
      projectContext?: string;
      jurisdiction?: string;
    },
  ): Promise<AgentResponse<ResponseDraft>> {
    return draftResponse(commentText, category, options);
  },

  /**
   * Draft a complete response letter for multiple comments.
   * Model: Enhancement model (complex multi-step task)
   */
  draftResponseLetter(
    comments: Array<{ id: string; text: string; category: string }>,
    projectInfo: {
      projectName: string;
      permitNumber: string;
      jurisdiction: string;
      applicantName?: string;
    },
  ): Promise<AgentResponse<string>> {
    return draftResponseLetter(comments, projectInfo);
  },

  /**
   * Analyze a permit review document.
   * Model: Enhancement model for deep analysis
   */
  analyzeDocument(
    documentText: string,
    context?: {
      projectName?: string;
      permitNumber?: string;
      jurisdiction?: string;
      reviewRound?: number;
    },
  ): Promise<AgentResponse<DocumentSummary>> {
    return analyzeDocument(documentText, context);
  },

  // -----------------------------------------------------------------------
  // Enhancement capabilities (MiMo-v2-Pro layer — new features)
  // -----------------------------------------------------------------------

  /**
   * Compliance analysis against NC codes and jurisdiction ordinances.
   * NEW CAPABILITY — requires enhancement layer for best results.
   */
  checkCompliance(
    commentText: string,
    options?: {
      jurisdiction?: string;
      projectType?: string;
      category?: string;
    },
  ): Promise<AgentResponse<ComplianceCheckResult>> {
    return checkCompliance(commentText, options);
  },

  /**
   * Generate a prioritized resubmittal strategy.
   * NEW CAPABILITY — requires enhancement layer for best results.
   */
  planResubmittal(
    comments: Array<{ id?: string; text: string; category?: string }>,
    context?: {
      projectName?: string;
      permitNumber?: string;
      jurisdiction?: string;
      reviewRound?: number;
      teamMembers?: string[];
    },
  ): Promise<AgentResponse<ResubmittalPlan>> {
    return planResubmittal(comments, context);
  },

  /**
   * Project intelligence — patterns, predictions, recommendations.
   * NEW CAPABILITY — requires enhancement layer for best results.
   */
  analyzeProject(data: {
    comments: Array<{
      text: string;
      category?: string;
      status?: string;
      createdAt?: string;
    }>;
    projectType?: string;
    jurisdiction?: string;
    reviewRound?: number;
    totalReviewRounds?: number;
    daysSinceSubmission?: number;
  }): Promise<AgentResponse<ProjectInsights>> {
    return analyzeProject(data);
  },

  // -----------------------------------------------------------------------
  // Metadata
  // -----------------------------------------------------------------------

  /** List all available agents and their capabilities. */
  listAgents() {
    return listAgents();
  },

  /** Check if the enhancement layer (OpenRouter/MiMo) is active. */
  isEnhancementEnabled(): boolean {
    return ENHANCEMENT_LAYER_ENABLED;
  },

  /** Find which agent handles a given task type. */
  getAgentForTask(taskType: AITaskType) {
    return getAgentForTask(taskType);
  },
};

export default AIRouter;
