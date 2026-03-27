import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AIRouter from '@/lib/ai/router';
import { z } from 'zod';

const requestSchema = z.object({
  comments: z.array(z.object({
    id: z.string().min(1),
    text: z.string().min(1),
  })).min(1, 'At least one comment is required').max(50, 'Maximum 50 comments per batch'),
});

/**
 * POST /api/ai/batch-classify
 * Classify multiple comments in a single call.
 * More efficient than calling /api/ai/classify for each comment individually.
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

    const response = await AIRouter.batchClassify(validation.data.comments);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/ai/batch-classify:', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
