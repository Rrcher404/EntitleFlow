/**
 * EntitleFlow AI — Model Registry ("Memory Card Slot")
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SWAP THE BRAIN HERE                                           ║
 * ║                                                                ║
 * ║  To change the LLM powering EntitleFlow's AI agents:           ║
 * ║  1. Update the model entry in AVAILABLE_MODELS below           ║
 * ║  2. Set ACTIVE_REASONING_MODEL / ACTIVE_FAST_MODEL             ║
 * ║  3. Everything else adapts automatically                       ║
 * ║                                                                ║
 * ║  The agent personas, prompts, and routing are all              ║
 * ║  model-agnostic — they don't care what's behind the API.       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { AIModel, AIProvider, ModelConfig } from './types';

// ---------------------------------------------------------------------------
// Model catalog — add new models here
// ---------------------------------------------------------------------------

export interface ModelEntry {
  id: AIModel;
  provider: AIProvider;
  displayName: string;
  /** What this model is best at */
  strengths: string[];
  /** Context window in tokens */
  contextWindow: number;
  /** Cost per 1M input tokens (USD) */
  inputCostPer1M: number;
  /** Cost per 1M output tokens (USD) */
  outputCostPer1M: number;
  /** Supports extended thinking / chain-of-thought */
  supportsReasoning: boolean;
  /** Supports JSON output mode */
  supportsJsonMode: boolean;
  /** Default temperature for this model */
  defaultTemperature: number;
  /** Default max output tokens */
  defaultMaxTokens: number;
}

/**
 * All models available to the system. Add new models here when you
 * want to test or switch to a different LLM.
 */
export const AVAILABLE_MODELS: Record<AIModel, ModelEntry> = {
  'xiaomi/mimo-v2-pro': {
    id: 'xiaomi/mimo-v2-pro',
    provider: 'openrouter',
    displayName: 'MiMo-v2-Pro (Xiaomi)',
    strengths: [
      'deep multi-step reasoning',
      'agentic tool use',
      'coding & structured output',
      '1M token context',
      'NC permit domain analysis',
    ],
    contextWindow: 1_048_576,
    inputCostPer1M: 1.0,
    outputCostPer1M: 3.0,
    supportsReasoning: true,
    supportsJsonMode: true,
    defaultTemperature: 0.2,
    defaultMaxTokens: 4096,
  },
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    provider: 'vertex',
    displayName: 'Gemini 2.0 Flash (Google)',
    strengths: [
      'fast classification',
      'low latency',
      'cost-effective for simple tasks',
      'good JSON output',
    ],
    contextWindow: 1_048_576,
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    supportsReasoning: false,
    supportsJsonMode: true,
    defaultTemperature: 0.1,
    defaultMaxTokens: 2048,
  },
};

// ---------------------------------------------------------------------------
// Active model selection — THE MEMORY CARD SLOT
// ---------------------------------------------------------------------------
//
// HYBRID ARCHITECTURE:
//   Vertex AI (Gemini) = backbone — handles the majority of tasks (GCP credits)
//   OpenRouter (MiMo-v2-Pro) = enhancement layer — escalates for complex reasoning
//
// The system defaults to Gemini for everything. MiMo kicks in when:
//   1. A task requires deep multi-step reasoning (compliance, resubmittal planning)
//   2. An agent explicitly needs extended thinking (project intelligence)
//   3. You flip the ACTIVE_REASONING_MODEL to MiMo for all complex tasks
//
// To go full MiMo: set ACTIVE_REASONING_MODEL = 'xiaomi/mimo-v2-pro'
// To go full Gemini: set ACTIVE_REASONING_MODEL = 'gemini-2.0-flash'
// ---------------------------------------------------------------------------

/**
 * The PRIMARY model for the backbone — handles most tasks.
 * Uses your GCP credits. Fast, cheap, great for classification and summaries.
 */
export const ACTIVE_FAST_MODEL: AIModel = 'gemini-2.0-flash';

/**
 * The ENHANCEMENT model for complex reasoning tasks:
 *   - Compliance analysis (new capability)
 *   - Resubmittal planning (new capability)
 *   - Project intelligence (new capability)
 *   - Response letter drafting (upgraded)
 *   - Deep document analysis (upgraded)
 *
 * Default: MiMo-v2-Pro for the new capabilities that need deep reasoning.
 * Swap to 'gemini-2.0-flash' to run everything on GCP.
 */
export const ACTIVE_REASONING_MODEL: AIModel = 'xiaomi/mimo-v2-pro';

/**
 * Whether to use the enhancement model at all.
 * Set to false to run 100% on Vertex AI / GCP.
 * Set to true to use the hybrid (Gemini backbone + MiMo enhancement).
 */
export const ENHANCEMENT_LAYER_ENABLED: boolean =
  process.env.OPENROUTER_API_KEY ? true : false;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a ModelConfig from a model ID, with optional overrides.
 */
export function getModelConfig(
  modelId: AIModel = ACTIVE_REASONING_MODEL,
  overrides?: Partial<ModelConfig>,
): ModelConfig {
  const entry = AVAILABLE_MODELS[modelId];
  if (!entry) {
    throw new Error(`Unknown model: ${modelId}. Available: ${Object.keys(AVAILABLE_MODELS).join(', ')}`);
  }

  return {
    provider: entry.provider,
    model: entry.id,
    maxTokens: overrides?.maxTokens ?? entry.defaultMaxTokens,
    temperature: overrides?.temperature ?? entry.defaultTemperature,
    reasoning: overrides?.reasoning ?? entry.supportsReasoning,
  };
}

/**
 * Get the reasoning model config (deep thinking tasks).
 * If the enhancement layer is disabled (no OpenRouter key), falls back to Gemini.
 */
export function getReasoningModel(overrides?: Partial<ModelConfig>): ModelConfig {
  const modelId = ENHANCEMENT_LAYER_ENABLED
    ? ACTIVE_REASONING_MODEL
    : ACTIVE_FAST_MODEL;
  return getModelConfig(modelId, overrides);
}

/**
 * Get the fast model config (classification, triage).
 */
export function getFastModel(overrides?: Partial<ModelConfig>): ModelConfig {
  return getModelConfig(ACTIVE_FAST_MODEL, overrides);
}

/**
 * Get a model entry's metadata (for display, cost estimation, etc.).
 */
export function getModelInfo(modelId: AIModel): ModelEntry {
  const entry = AVAILABLE_MODELS[modelId];
  if (!entry) {
    throw new Error(`Unknown model: ${modelId}`);
  }
  return entry;
}

/**
 * List all available models.
 */
export function listModels(): ModelEntry[] {
  return Object.values(AVAILABLE_MODELS);
}

/**
 * Check if a model requires the OpenRouter API key.
 */
export function requiresOpenRouter(modelId: AIModel): boolean {
  return AVAILABLE_MODELS[modelId]?.provider === 'openrouter';
}
