/**
 * EntitleFlow AI — Base Agent Executor
 *
 * Model-agnostic execution layer. Each agent persona defines WHAT to do
 * (system prompt, capabilities). This module handles HOW to execute it
 * against whichever LLM is currently active.
 */

import { complete as openrouterComplete } from '../openrouter';
import type {
  AgentPersona,
  AgentResponse,
  AITaskType,
  ModelConfig,
} from '../types';

// Vertex AI lazy import to avoid loading GCP SDK when using OpenRouter
async function vertexComplete(
  systemPrompt: string,
  userPrompt: string,
  model: ModelConfig,
  _jsonMode: boolean,
): Promise<{ content: string; latencyMs: number }> {
  const { VertexAI } = await import('@google-cloud/vertexai');
  const projectId = process.env.GCP_PROJECT_ID || 'gravityclaw-488910';
  const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

  const vertexAI = new VertexAI({ project: projectId, location });
  const generativeModel = vertexAI.getGenerativeModel({
    model: model.model,
  });

  const startMs = Date.now();

  const response = await generativeModel.generateContent({
    contents: [
      { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
    ],
  });

  const content =
    response.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const latencyMs = Date.now() - startMs;

  if (!content) {
    throw new Error('Empty response from Vertex AI');
  }

  return { content, latencyMs };
}

/**
 * Execute a task against an agent persona using the configured model.
 *
 * This is the central execution point — all agent calls flow through here.
 * The model can be swapped without touching any agent code.
 */
export async function executeAgent<T>(
  persona: AgentPersona,
  taskType: AITaskType,
  userPrompt: string,
  modelOverride?: Partial<ModelConfig>,
  jsonMode: boolean = true,
): Promise<AgentResponse<T>> {
  const model: ModelConfig = {
    ...persona.defaultModel,
    ...modelOverride,
  };

  let content: string;
  let reasoning: string | undefined;
  let usage: AgentResponse<T>['usage'];
  let latencyMs: number;

  if (model.provider === 'openrouter') {
    // Route to OpenRouter (MiMo-v2-Pro, or any OpenRouter model)
    const result = await openrouterComplete({
      systemPrompt: persona.systemPrompt,
      userPrompt,
      model,
      jsonMode,
    });

    content = result.content;
    reasoning = result.reasoning;
    usage = result.usage;
    latencyMs = result.latencyMs;
  } else {
    // Route to Vertex AI (Gemini)
    const result = await vertexComplete(
      persona.systemPrompt,
      userPrompt,
      model,
      jsonMode,
    );

    content = result.content;
    latencyMs = result.latencyMs;
  }

  // Parse JSON response
  let parsed: T;
  if (jsonMode) {
    try {
      // Strip markdown code fences if present
      const cleaned = content
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsed = JSON.parse(cleaned) as T;
    } catch {
      throw new Error(
        `Agent "${persona.id}" returned invalid JSON for task "${taskType}". ` +
        `Raw output: ${content.substring(0, 500)}`,
      );
    }
  } else {
    parsed = content as unknown as T;
  }

  return {
    agentId: persona.id,
    taskType,
    model: {
      provider: model.provider,
      model: model.model,
    },
    result: parsed,
    reasoning,
    usage,
    latencyMs,
  };
}
