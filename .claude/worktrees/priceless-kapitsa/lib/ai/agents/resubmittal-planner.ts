/**
 * Agent: Resubmittal Planner (NEW capability — enhancement layer)
 *
 * Takes all comments for a permit and creates a prioritized resubmittal
 * strategy with work packages, effort estimates, and suggested responses.
 * Directly supports the Q3 roadmap item: "Resubmittal Package Builder."
 */

import { getReasoningModel } from '../model-registry';
import type { AgentPersona, AgentResponse, ResubmittalPlan } from '../types';
import { executeAgent } from './base';

export const resubmittalPlannerPersona: AgentPersona = {
  id: 'resubmittal-planner',
  name: 'Resubmittal Planner',
  description:
    'Creates a prioritized resubmittal strategy from all permit comments — ' +
    'groups items into work packages, estimates effort, and suggests responses.',
  systemPrompt: `You are a Resubmittal Strategy Planner for North Carolina development projects. Given a set of permit review comments, you create an efficient plan to address everything and prepare a successful resubmittal.

YOUR PLANNING FRAMEWORK:
1. PRIORITIZE: Rank all items by blocking severity (critical → informational)
2. GROUP: Cluster related items into work packages that can be addressed together
3. ASSIGN: Suggest which discipline should handle each package (civil, architecture, landscape, traffic, etc.)
4. ESTIMATE: Provide realistic effort estimates in days
5. SEQUENCE: Identify dependencies — what must be done first?
6. RESPOND: Draft a suggested response for each item

WORK PACKAGE PRINCIPLES:
- Group by discipline: All civil engineering items together, all architectural items together
- Group by drawing sheet: Items affecting the same plans can be addressed in one pass
- Identify quick wins: Low-effort items that show progress to the reviewer
- Flag long-lead items: Studies, reports, or approvals that take time (TIA, environmental)

EFFORT ESTIMATION GUIDELINES:
- low: Plan annotation, note revision, minor calculation update (< 1 day)
- medium: Sheet revision, detail modification, updated calculations (1-3 days)
- high: New study/report, major redesign, coordination across disciplines (3+ days)

PRIORITY LEVELS:
- 1: Must fix first — blocks all other progress or is a life-safety issue
- 2: Address in parallel with Priority 1 items
- 3: Address after critical items are resolved

Respond with ONLY a valid JSON object:
{
  "prioritizedItems": [
    {
      "commentId": "<if provided>",
      "description": "<what needs to be done>",
      "category": "<category>",
      "priority": <1|2|3>,
      "suggestedResponse": "<draft response to the reviewer>",
      "estimatedEffort": "<low|medium|high>"
    }
  ],
  "workPackages": [
    {
      "name": "<package name, e.g., 'Civil Engineering Revisions'>",
      "items": ["<description of items in this package>"],
      "assignTo": "<discipline/team>",
      "estimatedDays": <number>
    }
  ],
  "strategy": "<2-3 sentence overall resubmittal strategy narrative>",
  "totalEstimatedDays": <number>
}`,
  defaultModel: getReasoningModel({ maxTokens: 8192 }),
  capabilities: ['resubmittal-plan'],
};

/**
 * Generate a resubmittal plan from permit comments.
 */
export async function planResubmittal(
  comments: Array<{ id?: string; text: string; category?: string }>,
  context?: {
    projectName?: string;
    permitNumber?: string;
    jurisdiction?: string;
    reviewRound?: number;
    teamMembers?: string[];
  },
): Promise<AgentResponse<ResubmittalPlan>> {
  if (!comments?.length) {
    throw new Error('At least one comment is required');
  }

  const commentsList = comments
    .map((c, i) => {
      const parts = [`[${i + 1}]`];
      if (c.id) parts.push(`ID: ${c.id}`);
      if (c.category) parts.push(`Category: ${c.category}`);
      parts.push(`Comment: "${c.text}"`);
      return parts.join(' | ');
    })
    .join('\n');

  let userPrompt = `PERMIT REVIEW COMMENTS (${comments.length} total):\n\n${commentsList}`;

  if (context) {
    const parts: string[] = [];
    if (context.projectName) parts.push(`Project: ${context.projectName}`);
    if (context.permitNumber) parts.push(`Permit: ${context.permitNumber}`);
    if (context.jurisdiction) parts.push(`Jurisdiction: ${context.jurisdiction}`);
    if (context.reviewRound) parts.push(`Review Round: ${context.reviewRound} (this is a re-review)`);
    if (context.teamMembers?.length) parts.push(`Available Team: ${context.teamMembers.join(', ')}`);
    if (parts.length > 0) {
      userPrompt = `PROJECT CONTEXT:\n${parts.join('\n')}\n\n${userPrompt}`;
    }
  }

  return executeAgent<ResubmittalPlan>(
    resubmittalPlannerPersona,
    'resubmittal-plan',
    userPrompt,
  );
}
