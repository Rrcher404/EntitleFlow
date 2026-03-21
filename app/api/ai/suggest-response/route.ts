import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AIRouter from '@/lib/ai/router';
import { z } from 'zod';

const requestSchema = z.object({
  commentText: z.string().min(1, 'Comment text is required').max(5000, 'Comment text is too long'),
  category: z.string().min(1, 'Category is required').max(50, 'Category is too long'),
  tone: z.enum(['formal', 'technical', 'collaborative']).optional(),
  jurisdiction: z.string().optional(),
  projectContext: z.string().optional(),
});

/**
 * POST /api/ai/suggest-response
 * Generates a professional response to a review comment.
 * Now powered by the Response Drafter agent — adds code references,
 * tone control, and confidence scoring.
 *
 * Response (backwards-compatible + enhanced):
 * {
 *   "response": string,
 *   "tone": "formal" | "technical" | "collaborative",
 *   "codeReferences": string[],
 *   "confidence": number,
 *   "agentId": "response-drafter",
 *   "model": { ... }
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
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

    const { commentText, category, tone, jurisdiction, projectContext } = validationResult.data;

    const agentResponse = await AIRouter.draftResponse(commentText, category, {
      tone,
      jurisdiction,
      projectContext,
    });

    return NextResponse.json({
      ...agentResponse.result,
      agentId: agentResponse.agentId,
      model: agentResponse.model,
      reasoning: agentResponse.reasoning,
      usage: agentResponse.usage,
      latencyMs: agentResponse.latencyMs,
    });
  } catch (error) {
    console.error('Error in /api/ai/suggest-response:', error);
    const message = error instanceof Error ? error.message : 'Unexpected error generating response suggestion';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
