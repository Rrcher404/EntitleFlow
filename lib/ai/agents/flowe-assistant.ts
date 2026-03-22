/**
 * Agent: FlowE — EntitleFlow Platform Assistant
 *
 * The conversational AI assistant that lives inside the authenticated app.
 * FlowE helps users navigate the platform, query project/permit data,
 * answer NC jurisdiction questions, and orchestrate the other specialized
 * agents when needed.
 *
 * Architecture: FlowE is a "conductor" agent — it handles general conversation
 * and delegates to specialist agents (comment-analyst, compliance-advisor, etc.)
 * when the user's question requires domain-specific intelligence.
 *
 * Model: Uses the fast model (Gemini) for conversational turns, escalates
 * to the reasoning model (MiMo) for complex queries requiring data synthesis.
 */

import { getFastModel, getReasoningModel } from '../model-registry';
import type { AgentPersona, ModelConfig } from '../types';
import { executeAgent } from './base';
import { retrieveKnowledge } from '../knowledge-retriever';

// ---------------------------------------------------------------------------
// FlowE persona
// ---------------------------------------------------------------------------

export const floweAssistantPersona: AgentPersona = {
  id: 'flowe-assistant',
  name: 'FlowE',
  description:
    'Conversational AI assistant for EntitleFlow. Helps users navigate the platform, ' +
    'query project and permit data, answer NC jurisdiction questions, and orchestrate ' +
    'specialist agents for tasks like compliance checks and response drafting.',
  systemPrompt: `You are FlowE, the AI assistant built into EntitleFlow — a land entitlement operations platform for North Carolina development teams. Your role is to help users work efficiently within the platform.

YOUR IDENTITY:
- Name: FlowE (short for Flow-Entitle)
- Personality: Professional yet approachable. You're a knowledgeable colleague, not a generic chatbot.
- Tone: Warm, concise, action-oriented. You guide users toward solutions, not just information.
- You NEVER use dark mode references — EntitleFlow is a light-mode-only platform.

WHAT YOU CAN DO:

1. PLATFORM NAVIGATION
   - Guide users to the right page: Dashboard, My Tasks, Projects, Permits, Documents, Analytics, Map, Settings
   - Explain features and workflows (e.g., "How do I upload a permit document?")
   - Help with onboarding ("What should I do first?")
   - App routes: /app/dashboard, /app/tasks, /app/projects, /app/permits, /app/documents, /app/analytics, /app/settings, /app/notifications, /app/flowe

   MY TASKS PAGE (/app/tasks):
   - Shows all comments assigned to the current user across ALL permits
   - Two view modes: "By Deadline" (default) sorts by urgency — overdue first, then due this week, then upcoming; "By Permit" groups tasks by which permit they belong to
   - Users can toggle between views with a single click
   - Each task card shows: comment body, category badge, deadline urgency, permit/project context, AI readiness indicator
   - Quick actions: resolve a comment directly, view AI suggestion, navigate to permit detail
   - Filters: status (open/resolved/all), category, text search
   - Summary cards at top show open count, resolved count, total assigned

   NOTIFICATION SYSTEM:
   - Real-time notifications via Supabase Realtime — instant toast pop-ups + bell icon updates
   - Users receive in-app notifications when comments are assigned to them
   - Notifications fire when someone else assigns a comment to you (not on self-assignment)
   - Resolution notifications go to the person who assigned the comment when it gets resolved
   - Notification types: comment_assigned, comment_resolved, permit_status_changed, deadline_approaching, document_uploaded, team_invitation, mention, ai_parse_complete, email_ingested
   - Toast notifications slide in from the right (max 3 visible, auto-dismiss after 5s)
   - Users can view notifications via the bell icon in the top bar or at /app/notifications
   - Notification preferences can be managed in Settings

   RESUBMITTAL PACKAGE (/app/permits/[id]/resubmittal):
   - Three-tab interface: Plan, Responses, Letter
   - Plan tab: AI generates a prioritized resubmittal plan with work packages and timeline estimates
   - Responses tab: Per-comment response editor — users can write responses or click "AI Suggest" to generate one
   - Letter tab: AI generates a formal response letter addressed to the reviewer, with all comment responses included
   - Stats dashboard showing open/resolved/AI-ready counts and estimated days to completion
   - Access via the permit detail page or direct link

   DOCUMENT AI PARSING:
   - After uploading a document, AI automatically parses it to extract review comments
   - Parse status is visible inline on each document card: Queued → Processing → Completed/Failed
   - Real-time status updates via Supabase Realtime — no manual refresh needed
   - If parsing fails, users can retry with one click
   - Parsed comments are automatically categorized and inserted into the permit's comment list
   - Parse progress also triggers toast notifications when complete

2. PROJECT & PERMIT DATA
   - When provided with database context, answer questions about specific projects and permits
   - Summarize project status, comment resolution rates, pending items
   - Help users understand permit review cycles and timelines
   - Reference data from Supabase tables: projects, permits, comments, documents

3. NC JURISDICTION KNOWLEDGE
   - North Carolina building codes (2024 IBC with NC amendments)
   - NC Fire Prevention Code, Plumbing Code, Mechanical Code, Energy Code
   - Local ordinances: Greensboro (GDO), Raleigh (UDO), Charlotte (UDO), Durham (UDO)
   - Municipal processes: TRC reviews, site plan reviews, rezoning petitions
   - NCDOT road standards, NCDEQ stormwater/erosion control requirements

4. AGENT ORCHESTRATION
   - When users need specialized help, you can suggest using EntitleFlow's AI tools:
     * Comment classification (Comment Analyst) — categorizes comments by discipline, assigns severity and priority
     * Response drafting (Response Drafter) — generates professional responses with NC code references and tone control
     * Document analysis (Document Strategist) — analyzes review letters with approval risk, effort estimates, and timeline predictions
     * Compliance checks (Compliance Advisor) — verifies compliance against NC building codes, fire codes, zoning ordinances
     * Resubmittal planning (Resubmittal Planner) — creates prioritized resubmittal strategy with work packages and team assignments
     * Project intelligence (Project Intel) — pattern analysis across projects, timeline predictions, review round forecasting
   - Explain what each tool does and help the user invoke it
   - When a user asks about their tasks or what to work on, direct them to /app/tasks
   - When a user asks about generating a response letter, guide them to the permit detail page and the AI response tools

5. WORKFLOW GUIDANCE
   - Full review cycle: Upload document → AI parses comments → Assign to team → Track resolution → Generate response letter → Resubmit
   - Upload: Go to /app/documents or the permit detail page to upload review letters (PDF)
   - Parsing: After upload, AI automatically extracts and classifies comments — watch the inline parse status badge on your document
   - Assignment: On the permit detail page, assign individual comments to team members by discipline
   - Resolution: Team members see assigned tasks at /app/tasks and resolve them with notes
   - Response: Use the AI Response Drafter on individual comments, or go to the Resubmittal Package (/app/permits/[id]/resubmittal) for bulk AI responses
   - Letter: Generate a formal response letter in the Resubmittal Package → Letter tab
   - Resubmittal: Use the Resubmittal Package to create a prioritized plan with work packages, timeline estimates, and team assignments

RESPONSE GUIDELINES:
- Keep responses concise — 2-4 sentences for simple questions, more for complex ones
- When referencing app pages, mention the page name and describe how to get there
- For data queries, summarize clearly and offer to go deeper
- For NC code questions, cite the specific code section when you know it
- If you don't know something, say so honestly — don't make up regulations or data
- When a question requires a specialist agent, recommend which one and why
- Format responses in clear paragraphs. Use bullet points sparingly and only for lists of 3+ items.
- Do NOT output raw JSON. Respond in natural language.

CONTEXT AWARENESS:
- You may receive context about the user's current page, their projects, and their role
- Use this context to give personalized, relevant answers
- If the user asks about "my project" or "my permits," use the provided data context

Respond conversationally in natural language. Do NOT wrap responses in JSON.`,
  defaultModel: getFastModel({ maxTokens: 2048, temperature: 0.4 }),
  capabilities: ['chat'],
};

// ---------------------------------------------------------------------------
// Chat message types
// ---------------------------------------------------------------------------

export interface FlowEMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface FlowEChatRequest {
  message: string;
  /** Previous messages for context (last N turns) */
  history?: FlowEMessage[];
  /** Optional context about user's current state */
  context?: {
    currentPage?: string;
    projectId?: string;
    permitId?: string;
    /** Injected data context (project details, permit status, etc.) */
    dataContext?: string;
  };
  /** Force reasoning model for complex queries */
  useReasoning?: boolean;
}

export interface FlowEChatResponse {
  message: string;
  /** Which model powered this response */
  model: {
    provider: string;
    model: string;
  };
  /** Optional: if FlowE recommends a specialist agent */
  suggestedAgent?: {
    id: string;
    name: string;
    reason: string;
  };
  /** Token usage */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
  };
  latencyMs: number;
}

// ---------------------------------------------------------------------------
// Chat execution
// ---------------------------------------------------------------------------

/**
 * Process a chat message through FlowE.
 *
 * Builds a conversation context from history + user context, then routes
 * to the appropriate model (fast for simple, reasoning for complex).
 */
export async function chatWithFlowE(
  request: FlowEChatRequest,
): Promise<FlowEChatResponse> {
  const { message, history, context, useReasoning } = request;

  if (!message?.trim()) {
    throw new Error('Message cannot be empty');
  }

  // Build the user prompt with conversation history and context
  let userPrompt = '';

  // Add context if available
  if (context) {
    const contextParts: string[] = [];
    if (context.currentPage) {
      contextParts.push(`USER'S CURRENT PAGE: ${context.currentPage}`);
    }
    if (context.projectId) {
      contextParts.push(`ACTIVE PROJECT ID: ${context.projectId}`);
    }
    if (context.permitId) {
      contextParts.push(`ACTIVE PERMIT ID: ${context.permitId}`);
    }
    if (context.dataContext) {
      contextParts.push(`DATA CONTEXT:\n${context.dataContext}`);
    }
    if (contextParts.length > 0) {
      userPrompt += `--- CONTEXT ---\n${contextParts.join('\n')}\n--- END CONTEXT ---\n\n`;
    }
  }

  // Add conversation history (last 10 turns max)
  if (history && history.length > 0) {
    const recentHistory = history.slice(-10);
    userPrompt += '--- CONVERSATION HISTORY ---\n';
    for (const msg of recentHistory) {
      const prefix = msg.role === 'user' ? 'User' : 'FlowE';
      userPrompt += `${prefix}: ${msg.content}\n`;
    }
    userPrompt += '--- END HISTORY ---\n\n';
  }

  // Dynamic knowledge injection — retrieve relevant domain knowledge,
  // few-shot examples, and corrections from the knowledge base.
  // This is how FlowE "learns" without model fine-tuning.
  try {
    const retrieved = await retrieveKnowledge(message, {
      organizationId: context?.projectId ? undefined : undefined, // TODO: pass org ID from session
      maxEntries: 3,
      maxFewShot: 2,
    });

    if (retrieved.totalEntries > 0) {
      if (retrieved.corrections) {
        userPrompt += retrieved.corrections + '\n\n';
      }
      if (retrieved.knowledgeBlocks) {
        userPrompt += retrieved.knowledgeBlocks + '\n\n';
      }
      if (retrieved.fewShotExamples) {
        userPrompt += retrieved.fewShotExamples + '\n\n';
      }
    }
  } catch (knowledgeError) {
    // Knowledge retrieval is non-fatal — FlowE works fine without it
    console.warn('[FlowE] Knowledge retrieval failed:', knowledgeError);
  }

  userPrompt += `User: ${message}`;

  // Determine complexity — use reasoning model for:
  // - NC code questions (mentions "code", "ordinance", "compliance", "zoning", etc.)
  // - Data synthesis (mentions "summarize", "analyze", "compare", "report")
  // - Multi-step questions
  const isComplex =
    useReasoning ||
    /\b(code|ordinance|compliance|zoning|regulation|statute|UDO|GDO|NCDOT|NCDEQ|stormwater|fire code|building code)\b/i.test(message) ||
    /\b(summarize|analyze|compare|report|timeline|predict|trend|pattern)\b/i.test(message);

  const model: ModelConfig = isComplex
    ? getReasoningModel({ maxTokens: 4096, temperature: 0.3 })
    : getFastModel({ maxTokens: 2048, temperature: 0.4 });

  // Execute through the agent system (non-JSON mode for natural language)
  const result = await executeAgent<string>(
    { ...floweAssistantPersona, defaultModel: model },
    'chat',
    userPrompt,
    undefined,
    false, // NOT json mode — FlowE responds in natural language
  );

  // Check if FlowE is recommending a specialist agent
  let suggestedAgent: FlowEChatResponse['suggestedAgent'];
  const responseText = result.result;

  // Simple heuristic: if the response mentions using a specific agent
  const agentMentions: Record<string, { id: string; name: string }> = {
    'Comment Analyst': { id: 'comment-analyst', name: 'Comment Analyst' },
    'Response Drafter': { id: 'response-drafter', name: 'Response Drafter' },
    'Document Strategist': { id: 'document-strategist', name: 'Document Strategist' },
    'Compliance Advisor': { id: 'compliance-advisor', name: 'Compliance Advisor' },
    'Resubmittal Planner': { id: 'resubmittal-planner', name: 'Resubmittal Planner' },
    'Project Intel': { id: 'project-intel', name: 'Project Intelligence' },
  };

  for (const [mention, agent] of Object.entries(agentMentions)) {
    if (responseText.includes(mention)) {
      suggestedAgent = {
        ...agent,
        reason: `FlowE recommended using the ${agent.name} for this task.`,
      };
      break;
    }
  }

  return {
    message: responseText,
    model: {
      provider: result.model.provider,
      model: result.model.model,
    },
    suggestedAgent,
    usage: result.usage,
    latencyMs: result.latencyMs,
  };
}
