import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AIRouter from '@/lib/ai/router';
import { z } from 'zod';

const requestSchema = z.object({
  text: z.string().min(1, 'Comment text is required').max(5000, 'Comment text is too long'),
  /** Set to true to use deep reasoning model for complex comments */
  deep: z.boolean().optional(),
});

/**
 * POST /api/ai/classify
 * Classifies a permit review comment into one of the predefined categories.
 * Now powered by the agent system — routes through Comment Analyst agent.
 *
 * Request body:
 * {
 *   "text": "string (1-5000 chars)",
 *   "deep": boolean (optional — use enhancement model for deeper analysis)
 * }
 *
 * Response (backwards-compatible + enhanced):
 * {
 *   "category": "parking_access" | "stormwater" | ...,
 *   "confidence": number (0.0-1.0),
 *   "reasoning": string,
 *   "severity": "critical" | "major" | "minor" | "informational",
 *   "suggestedPriority": 1 | 2 | 3 | 4,
 *   "agentId": "comment-analyst",
 *   "model": { "provider": "vertex" | "openrouter", "model": "..." }
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: User session required' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const { text, deep } = validationResult.data;

    const agentResponse = await AIRouter.classifyComment(text, { deep });

    // Return backwards-compatible response with enhanced fields
    return NextResponse.json({
      ...agentResponse.result,
      agentId: agentResponse.agentId,
      model: agentResponse.model,
      usage: agentResponse.usage,
      latencyMs: agentResponse.latencyMs,
    });
  } catch (error) {
    console.error('Error in /api/ai/classify:', error);
    const message = error instanceof Error ? error.message : 'Unexpected error during classification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
