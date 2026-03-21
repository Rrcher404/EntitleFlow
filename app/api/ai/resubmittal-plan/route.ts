import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AIRouter from '@/lib/ai/router';
import { z } from 'zod';

const commentSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1),
  category: z.string().optional(),
});

const requestSchema = z.object({
  comments: z.array(commentSchema).min(1, 'At least one comment is required'),
  projectName: z.string().optional(),
  permitNumber: z.string().optional(),
  jurisdiction: z.string().optional(),
  reviewRound: z.number().optional(),
  teamMembers: z.array(z.string()).optional(),
});

/**
 * POST /api/ai/resubmittal-plan
 * Generates a prioritized resubmittal strategy from permit comments.
 * Returns work packages, effort estimates, and suggested responses.
 *
 * NEW CAPABILITY — powered by the MiMo-v2-Pro enhancement layer.
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
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 },
      );
    }

    const { comments, projectName, permitNumber, jurisdiction, reviewRound, teamMembers } =
      validation.data;

    const response = await AIRouter.planResubmittal(comments, {
      projectName,
      permitNumber,
      jurisdiction,
      reviewRound,
      teamMembers,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/ai/resubmittal-plan:', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
