import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AIRouter from '@/lib/ai/router';
import { z } from 'zod';

const requestSchema = z.object({
  commentText: z.string().min(1, 'Comment text is required').max(10000),
  jurisdiction: z.string().optional(),
  projectType: z.string().optional(),
  category: z.string().optional(),
});

/**
 * POST /api/ai/compliance
 * Analyzes a review comment for NC code compliance.
 * Returns applicable codes, compliance status, and required actions.
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

    const { commentText, jurisdiction, projectType, category } = validation.data;

    const response = await AIRouter.checkCompliance(commentText, {
      jurisdiction,
      projectType,
      category,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/ai/compliance:', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
