/**
 * Agent: Response Drafter
 *
 * Generates professional, technically accurate responses to permit review
 * comments. Cites relevant NC codes and adapts tone to context.
 * This is the core value-delivery agent — it saves teams hours of writing.
 */

import { getReasoningModel } from '../model-registry';
import type { AgentPersona, AgentResponse, CommentCategory, ResponseDraft } from '../types';
import { executeAgent } from './base';

export const responseDrafterPersona: AgentPersona = {
  id: 'response-drafter',
  name: 'Response Drafter',
  description:
    'Generates professional responses to permit review comments with NC code references, ' +
    'adjustable tone, and high domain accuracy.',
  systemPrompt: `You are a senior permit response specialist for North Carolina land development projects. Your job is to draft professional, technically accurate responses to reviewer comments that development teams can use directly or lightly edit before submission.

CORE PRINCIPLES:
1. Be SPECIFIC and TECHNICAL — never use vague language like "we will address this"
2. CITE relevant codes when applicable (NC Building Code, local UDO sections, NCDOT standards)
3. Address the EXACT concern raised — don't add unnecessary detail
4. Maintain a professional, collaborative tone — reviewers are colleagues, not adversaries
5. Keep responses concise: 2-4 sentences unless the issue is complex

RESPONSE PATTERNS BY CATEGORY:
- Code violations → Acknowledge, state the corrective action, reference the applicable code section
- Missing information → Confirm what will be provided and where on the revised plans
- Design preferences → Explain the design rationale, offer alternatives if warranted
- Clarification requests → Provide the specific information requested with references

NC-SPECIFIC KNOWLEDGE:
- NC Building Code (based on IBC with NC amendments)
- NC Fire Prevention Code
- Local UDO (Unified Development Ordinance) for Greensboro, Raleigh, Charlotte
- NCDOT access and driveway standards
- NCDEQ stormwater and erosion control requirements
- NC dam safety regulations for stormwater facilities

TONE OPTIONS:
- formal: Official resubmittal response letter language
- technical: Engineer-to-reviewer precise technical language
- collaborative: Approachable but professional, suggesting we work together

Respond with ONLY a valid JSON object:
{
  "response": "<the draft response text>",
  "tone": "<formal|technical|collaborative>",
  "codeReferences": ["<relevant code sections cited>"],
  "confidence": <0.0 to 1.0 — how confident this fully addresses the comment>
}`,
  defaultModel: getReasoningModel(),
  capabilities: ['suggest-response', 'draft-response-letter'],
};

export interface DraftOptions {
  tone?: 'formal' | 'technical' | 'collaborative';
  /** Additional project context to inform the response */
  projectContext?: string;
  /** The jurisdiction (e.g., "Greensboro", "Raleigh") for code-specific references */
  jurisdiction?: string;
}

/**
 * Generate a response draft for a single review comment.
 */
export async function draftResponse(
  commentText: string,
  category: CommentCategory | string,
  options?: DraftOptions,
): Promise<AgentResponse<ResponseDraft>> {
  if (!commentText?.trim()) {
    throw new Error('Comment text cannot be empty');
  }

  let userPrompt = `COMMENT CATEGORY: ${category}\n\nREVIEW COMMENT:\n"${commentText}"`;

  if (options?.tone) {
    userPrompt += `\n\nREQUESTED TONE: ${options.tone}`;
  }
  if (options?.jurisdiction) {
    userPrompt += `\n\nJURISDICTION: ${options.jurisdiction} — use local UDO references where applicable`;
  }
  if (options?.projectContext) {
    userPrompt += `\n\nPROJECT CONTEXT:\n${options.projectContext}`;
  }

  return executeAgent<ResponseDraft>(
    responseDrafterPersona,
    'suggest-response',
    userPrompt,
  );
}

/**
 * Draft a complete response letter covering multiple comments.
 */
export async function draftResponseLetter(
  comments: Array<{ id: string; text: string; category: string }>,
  projectInfo: {
    projectName: string;
    permitNumber: string;
    jurisdiction: string;
    applicantName?: string;
  },
): Promise<AgentResponse<string>> {
  const commentsList = comments
    .map((c, i) => `${i + 1}. [${c.category}] "${c.text}"`)
    .join('\n');

  const userPrompt = `Generate a complete resubmittal response letter for the following permit review.

PROJECT: ${projectInfo.projectName}
PERMIT #: ${projectInfo.permitNumber}
JURISDICTION: ${projectInfo.jurisdiction}
${projectInfo.applicantName ? `APPLICANT: ${projectInfo.applicantName}` : ''}

REVIEWER COMMENTS TO ADDRESS:
${commentsList}

Write a professional response letter that:
1. Opens with a brief introduction referencing the permit number and review date
2. Addresses each comment in numbered order
3. Provides specific, technical responses
4. Closes with a standard resubmittal closing
5. Uses formal tone appropriate for municipal submission

Return the full letter text as a single string (not JSON).`;

  return executeAgent<string>(
    responseDrafterPersona,
    'draft-response-letter',
    userPrompt,
    getReasoningModel({ maxTokens: 8192 }),
    false, // plain text, not JSON
  );
}
