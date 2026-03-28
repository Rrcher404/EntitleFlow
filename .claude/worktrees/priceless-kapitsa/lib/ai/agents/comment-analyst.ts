/**
 * Agent: Comment Analyst
 *
 * Classifies and triages permit review comments with severity assessment
 * and priority recommendations. Upgrades the basic classify endpoint with
 * deeper analysis when routed through MiMo-v2-Pro.
 */

import { getFastModel, getReasoningModel } from '../model-registry';
import type {
  AgentPersona,
  AgentResponse,
  ClassificationResult,
  CommentCategory,
} from '../types';
import { executeAgent } from './base';

const VALID_CATEGORIES: CommentCategory[] = [
  'parking_access', 'stormwater', 'building_code', 'zoning',
  'fire_safety', 'landscaping', 'traffic', 'environmental',
  'general', 'other',
];

export const commentAnalystPersona: AgentPersona = {
  id: 'comment-analyst',
  name: 'Comment Analyst',
  description:
    'Classifies permit review comments into categories, assesses severity, ' +
    'and recommends triage priority. Specializes in NC municipal review workflows.',
  systemPrompt: `You are an expert Comment Analyst for North Carolina land entitlement and permit review processes. Your role is to classify reviewer comments, assess their severity, and recommend triage priority.

DOMAIN EXPERTISE:
- You understand NC Building Code, zoning ordinances, stormwater regulations, and fire code
- You know the review processes for Greensboro, Raleigh, Charlotte, and other NC municipalities
- You can distinguish between hard blockers (code violations) and soft items (design preferences)

CATEGORIES (classify into exactly one):
- parking_access: Parking spaces, ADA accessibility, loading areas, parking lot layout
- stormwater: Stormwater management, drainage, detention/retention ponds, water quality, erosion control
- building_code: Building construction standards, structural, energy code, mechanical/plumbing
- zoning: Zoning compliance, setbacks, lot coverage, use restrictions, conditional zoning
- fire_safety: Fire ratings, egress paths, emergency vehicle access, sprinkler systems, fire hydrants
- landscaping: Landscaping requirements, tree preservation, buffer yards, screening
- traffic: Traffic impact, turn lanes, sight distance, internal circulation, TIA requirements
- environmental: Wetlands, environmental assessment, natural resources, species protection
- general: Administrative items, document completeness, application requirements
- other: Items that don't fit the above categories

SEVERITY LEVELS:
- critical: Hard code violation or life-safety issue — will block permit approval
- major: Significant compliance gap requiring design changes
- minor: Small adjustments needed, won't block approval alone
- informational: Reviewer note or suggestion, no action required

PRIORITY (1=highest, 4=lowest):
- 1: Critical blockers — address immediately
- 2: Major items — address in next revision
- 3: Minor items — batch with related changes
- 4: Informational — acknowledge only

Respond with ONLY a valid JSON object:
{
  "category": "<one of the categories above>",
  "confidence": <0.0 to 1.0>,
  "reasoning": "<1-2 sentence explanation>",
  "severity": "<critical|major|minor|informational>",
  "suggestedPriority": <1|2|3|4>
}`,
  defaultModel: getFastModel(),
  capabilities: ['classify-comment', 'batch-classify'],
};

/**
 * Classify a single comment.
 */
export async function classifyComment(
  commentText: string,
  options?: { deep?: boolean },
): Promise<AgentResponse<ClassificationResult>> {
  if (!commentText?.trim()) {
    throw new Error('Comment text cannot be empty');
  }

  // Use reasoning model for deep analysis, fast model for quick classify
  const modelOverride = options?.deep ? getReasoningModel() : undefined;

  const response = await executeAgent<ClassificationResult>(
    commentAnalystPersona,
    'classify-comment',
    `PERMIT REVIEW COMMENT:\n"${commentText}"`,
    modelOverride,
  );

  // Validate the result
  const result = response.result;
  if (!VALID_CATEGORIES.includes(result.category)) {
    result.category = 'other';
  }
  result.confidence = Math.min(1, Math.max(0, result.confidence));
  if (![1, 2, 3, 4].includes(result.suggestedPriority)) {
    result.suggestedPriority = 3;
  }

  return response;
}

/**
 * Batch classify multiple comments in a single call (uses reasoning model).
 */
export async function batchClassify(
  comments: Array<{ id: string; text: string }>,
): Promise<AgentResponse<Array<ClassificationResult & { commentId: string }>>> {
  if (!comments.length) {
    throw new Error('At least one comment is required');
  }

  const numbered = comments
    .map((c, i) => `[${i + 1}] ID: ${c.id}\nComment: "${c.text}"`)
    .join('\n\n');

  const userPrompt = `Classify each of the following ${comments.length} permit review comments. Return a JSON array where each element corresponds to a comment in order:

${numbered}

Respond with ONLY a valid JSON array:
[
  {
    "commentId": "<the ID from above>",
    "category": "<category>",
    "confidence": <0.0-1.0>,
    "reasoning": "<explanation>",
    "severity": "<critical|major|minor|informational>",
    "suggestedPriority": <1|2|3|4>
  }
]`;

  return executeAgent(
    commentAnalystPersona,
    'batch-classify',
    userPrompt,
    getReasoningModel({ maxTokens: 8192 }),
  );
}
