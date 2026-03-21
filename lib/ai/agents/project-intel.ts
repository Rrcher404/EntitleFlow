/**
 * Agent: Project Intelligence (NEW capability — enhancement layer)
 *
 * Cross-project pattern analysis, timeline prediction, and recommendations.
 * Directly supports the Phase 3 roadmap item: "ML timeline predictions."
 */

import { getReasoningModel } from '../model-registry';
import type { AgentPersona, AgentResponse, ProjectInsights } from '../types';
import { executeAgent } from './base';

export const projectIntelPersona: AgentPersona = {
  id: 'project-intel',
  name: 'Project Intelligence',
  description:
    'Analyzes patterns across permit comments, predicts approval timelines, ' +
    'identifies risk factors, and provides strategic recommendations.',
  systemPrompt: `You are a Project Intelligence Analyst for North Carolina land development projects. You analyze permit review data to find patterns, predict timelines, and provide strategic recommendations.

YOUR ANALYTICAL CAPABILITIES:
1. PATTERN DETECTION: Identify recurring comment themes, reviewer tendencies, and common issues
2. TIMELINE PREDICTION: Estimate days to approval based on comment volume, severity, and category mix
3. RISK ASSESSMENT: Flag factors that could delay approval (critical items, complex zoning, environmental)
4. RECOMMENDATIONS: Suggest process improvements and strategic actions
5. BENCHMARKING: Compare against typical NC permit review timelines by project type

TIMELINE ESTIMATION FRAMEWORK:
Base timeline by review type:
- Site plan review: 15-30 days per round
- Rezoning/conditional zoning: 60-120 days
- Subdivision review: 30-45 days per round
- Building permit: 10-20 days per round

Adjustment factors:
- +5 days per critical comment
- +2 days per major comment
- +10 days if environmental study required
- +15 days if TIA (Traffic Impact Analysis) required
- +5 days per re-review round
- -5 days if all items are minor/informational

PATTERN CATEGORIES:
- Recurring: Same issue appearing across multiple review rounds
- Increasing: Issue type becoming more frequent
- Stable: Consistent issue frequency
- Decreasing: Issue type becoming less frequent (good sign)

Respond with ONLY a valid JSON object:
{
  "patterns": [
    {
      "pattern": "<description of the pattern>",
      "frequency": <number of occurrences>,
      "trend": "<increasing|stable|decreasing>"
    }
  ],
  "predictedApprovalDays": <number>,
  "riskFactors": ["<factors that could delay approval>"],
  "recommendations": ["<strategic recommendations>"],
  "benchmarkNotes": "<how this project compares to typical NC timelines>"
}`,
  defaultModel: getReasoningModel({ maxTokens: 4096 }),
  capabilities: ['project-insights'],
};

/**
 * Generate project insights from comment data.
 */
export async function analyzeProject(
  data: {
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
  },
): Promise<AgentResponse<ProjectInsights>> {
  if (!data.comments?.length) {
    throw new Error('At least one comment is required for analysis');
  }

  const commentsList = data.comments
    .map((c, i) => {
      const parts = [`[${i + 1}]`];
      if (c.category) parts.push(`Category: ${c.category}`);
      if (c.status) parts.push(`Status: ${c.status}`);
      if (c.createdAt) parts.push(`Date: ${c.createdAt}`);
      parts.push(`"${c.text}"`);
      return parts.join(' | ');
    })
    .join('\n');

  let userPrompt = `PROJECT DATA FOR ANALYSIS:\n\nCOMMENTS (${data.comments.length} total):\n${commentsList}`;

  const contextParts: string[] = [];
  if (data.projectType) contextParts.push(`Project Type: ${data.projectType}`);
  if (data.jurisdiction) contextParts.push(`Jurisdiction: ${data.jurisdiction}`);
  if (data.reviewRound) contextParts.push(`Current Review Round: ${data.reviewRound}`);
  if (data.totalReviewRounds) contextParts.push(`Total Review Rounds So Far: ${data.totalReviewRounds}`);
  if (data.daysSinceSubmission) contextParts.push(`Days Since Initial Submission: ${data.daysSinceSubmission}`);

  if (contextParts.length > 0) {
    userPrompt = `PROJECT CONTEXT:\n${contextParts.join('\n')}\n\n${userPrompt}`;
  }

  return executeAgent<ProjectInsights>(
    projectIntelPersona,
    'project-insights',
    userPrompt,
  );
}
