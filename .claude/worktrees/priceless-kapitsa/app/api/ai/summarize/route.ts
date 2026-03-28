import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AIRouter from '@/lib/ai/router';
import { z } from 'zod';

const requestSchema = z.object({
  text: z.string().min(1, 'Review letter text is required').max(50000, 'Text is too long (max 50KB)'),
  projectName: z.string().optional(),
  permitNumber: z.string().optional(),
  jurisdiction: z.string().optional(),
  reviewRound: z.number().optional(),
});

/**
 * POST /api/ai/summarize
 * Summarizes a permit review letter with strategic analysis.
 * Now powered by the Document Strategist agent — adds effort estimates,
 * approval risk assessment, and resolution timeline prediction.
 *
 * Response (backwards-compatible + enhanced):
 * {
 *   "summary": string,
 *   "totalItems": number,
 *   "criticalItems": string[],
 *   "actionItems": [{ "item", "category", "severity", "estimatedEffort" }],
 *   "categories": { ... },
 *   "approvalRisk": "low" | "medium" | "high",
 *   "estimatedResolutionDays": number,
 *   "agentId": "document-strategist",
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

    const { text, projectName, permitNumber, jurisdiction, reviewRound } = validationResult.data;

    const agentResponse = await AIRouter.analyzeDocument(text, {
      projectName,
      permitNumber,
      jurisdiction,
      reviewRound,
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
    console.error('Error in /api/ai/summarize:', error);
    const message = error instanceof Error ? error.message : 'Unexpected error during summarization';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
