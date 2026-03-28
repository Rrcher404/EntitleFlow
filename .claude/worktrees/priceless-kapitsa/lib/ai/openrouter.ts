/**
 * EntitleFlow AI — OpenRouter Client
 *
 * OpenAI-compatible client for accessing MiMo-v2-Pro and other models
 * through OpenRouter. Uses the standard fetch API (no extra SDK dependency)
 * to keep the bundle lean and avoid ESM/CJS issues with Next.js.
 */

import type { AIModel, AIProvider, ModelConfig } from './types';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

/** Pricing per 1M tokens (context ≤256K) */
const PRICING: Record<string, { input: number; output: number }> = {
  'xiaomi/mimo-v2-pro': { input: 1.0, output: 3.0 },
};

export function getOpenRouterApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error(
      'OPENROUTER_API_KEY environment variable is required. ' +
      'Get your key at https://openrouter.ai/keys',
    );
  }
  return key;
}

// ---------------------------------------------------------------------------
// Request / Response types (OpenAI-compatible subset)
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  response_format?: { type: 'json_object' | 'text' };
  /** OpenRouter-specific: enable reasoning tokens */
  reasoning?: {
    effort: 'low' | 'medium' | 'high';
  };
}

interface ChatCompletionChoice {
  index: number;
  message: {
    role: string;
    content: string;
    reasoning?: string;
  };
  finish_reason: string;
}

interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: ChatCompletionChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export interface CompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  model: ModelConfig;
  /** Request JSON output format */
  jsonMode?: boolean;
}

export interface CompletionResult {
  content: string;
  reasoning?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
  };
  latencyMs: number;
}

/**
 * Send a chat completion request to OpenRouter.
 * Handles retry with exponential backoff for transient failures.
 */
export async function complete(options: CompletionOptions): Promise<CompletionResult> {
  const { systemPrompt, userPrompt, model, jsonMode } = options;
  const apiKey = getOpenRouterApiKey();

  const body: ChatCompletionRequest = {
    model: model.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: model.maxTokens ?? 4096,
    temperature: model.temperature ?? 0.3,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  if (model.reasoning) {
    body.reasoning = { effort: 'high' };
  }

  const startMs = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://entitleflow.com',
          'X-Title': 'EntitleFlow AI',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();

        // Retry on transient errors
        if (response.status === 429 || response.status >= 500) {
          lastError = new Error(`OpenRouter ${response.status}: ${errorText}`);
          const delayMs = 1000 * Math.pow(2, attempt);
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }

        throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
      }

      const data: ChatCompletionResponse = await response.json();
      const latencyMs = Date.now() - startMs;

      const choice = data.choices?.[0];
      if (!choice?.message?.content) {
        throw new Error('No content in OpenRouter response');
      }

      // Calculate estimated cost
      const usage = data.usage;
      let estimatedCostUsd = 0;
      if (usage) {
        const pricing = PRICING[model.model];
        if (pricing) {
          estimatedCostUsd =
            (usage.prompt_tokens / 1_000_000) * pricing.input +
            (usage.completion_tokens / 1_000_000) * pricing.output;
        }
      }

      return {
        content: choice.message.content,
        reasoning: choice.message.reasoning,
        usage: usage
          ? {
              promptTokens: usage.prompt_tokens,
              completionTokens: usage.completion_tokens,
              totalTokens: usage.total_tokens,
              estimatedCostUsd,
            }
          : undefined,
        latencyMs,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const isTransient =
        lastError.message.includes('429') ||
        lastError.message.includes('500') ||
        lastError.message.includes('503') ||
        lastError.message.includes('timeout') ||
        lastError.message.includes('ECONNRESET');

      if (!isTransient || attempt === 2) {
        throw lastError;
      }

      const delayMs = 1000 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  throw lastError || new Error('OpenRouter: max retries exceeded');
}

/**
 * Determine the provider for a given model string.
 */
export function providerForModel(model: AIModel): AIProvider {
  if (model.includes('/')) return 'openrouter';
  return 'vertex';
}

/**
 * Estimate cost for a given token count and model.
 */
export function estimateCost(
  model: AIModel,
  promptTokens: number,
  completionTokens: number,
): number {
  const pricing = PRICING[model];
  if (!pricing) return 0;
  return (
    (promptTokens / 1_000_000) * pricing.input +
    (completionTokens / 1_000_000) * pricing.output
  );
}
