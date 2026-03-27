import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AIRouter from '@/lib/ai/router';
import { z } from 'zod';

const commentDataSchema = z.object({
  text: z.string().min(1),
  category: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
});

const requestSchema = z.object({
  comments: z.array(commentDataSchema).min(1, 'At least one comment is required'),
  projectType: z.string().optional(),
  jurisdiction: z.string().optional(),
  reviewRound: z.number().optional(),
  totalReviewRounds: z.number().optional(),
  daysSinceSubmission: z.number().optional(),
});

/**
 * POST /api/ai/project-insights
 * Analyzes project data for patterns, timeline predictions, and recommendations.
 *
 * NEW CAPABILITY — powered by the MiMo-v2-Pro enhancement layer.
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
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 },
      );
    }

    const response = await AIRouter.analyzeProject(validation.data);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/ai/project-insights:', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
