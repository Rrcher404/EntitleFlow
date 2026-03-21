/**
 * EntitleFlow AI — Agent Registry
 *
 * Central registry of all available agent personas.
 * Import agents from here — never import persona definitions directly.
 */

import type { AgentId, AgentPersona, AITaskType } from '../types';

import { commentAnalystPersona } from './comment-analyst';
import { responseDrafterPersona } from './response-drafter';
import { documentStrategistPersona } from './document-strategist';
import { complianceAdvisorPersona } from './compliance-advisor';
import { resubmittalPlannerPersona } from './resubmittal-planner';
import { projectIntelPersona } from './project-intel';
import { floweAssistantPersona } from './flowe-assistant';

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const AGENTS: Record<AgentId, AgentPersona> = {
  'comment-analyst': commentAnalystPersona,
  'response-drafter': responseDrafterPersona,
  'document-strategist': documentStrategistPersona,
  'compliance-advisor': complianceAdvisorPersona,
  'resubmittal-planner': resubmittalPlannerPersona,
  'project-intel': projectIntelPersona,
  'flowe-assistant': floweAssistantPersona,
};

/**
 * Look up an agent by ID.
 */
export function getAgent(id: AgentId): AgentPersona {
  const agent = AGENTS[id];
  if (!agent) {
    throw new Error(`Unknown agent: ${id}. Available: ${Object.keys(AGENTS).join(', ')}`);
  }
  return agent;
}

/**
 * Find the best agent for a given task type.
 */
export function getAgentForTask(taskType: AITaskType): AgentPersona {
  for (const agent of Object.values(AGENTS)) {
    if (agent.capabilities.includes(taskType)) {
      return agent;
    }
  }
  throw new Error(`No agent can handle task type: ${taskType}`);
}

/**
 * List all registered agents (for the /api/ai/agents endpoint).
 */
export function listAgents(): Array<{
  id: AgentId;
  name: string;
  description: string;
  capabilities: AITaskType[];
  model: string;
  provider: string;
}> {
  return Object.values(AGENTS).map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    capabilities: a.capabilities,
    model: a.defaultModel.model,
    provider: a.defaultModel.provider,
  }));
}

// Re-export agent execution functions
export { classifyComment, batchClassify } from './comment-analyst';
export { draftResponse, draftResponseLetter } from './response-drafter';
export { analyzeDocument } from './document-strategist';
export { checkCompliance } from './compliance-advisor';
export { planResubmittal } from './resubmittal-planner';
export { analyzeProject } from './project-intel';
export { chatWithFlowE } from './flowe-assistant';
