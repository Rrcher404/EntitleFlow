import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AIRouter from '@/lib/ai/router';
import { z } from 'zod';

const requestSchema = z.object({
  comments: z.array(z.object({
    id: z.string().min(1),
    text: z.string().min(1),
    category: z.string().min(1),
  })).min(1, 'At least one comment is required'),
  projectName: z.string().min(1, 'Project name is required'),
  permitNumber: z.string().min(1, 'Permit number is required'),
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  applicantName: z.string().optional(),
});

/**
 * POST /api/ai/response-letter
 * Generates a complete resubmittal response letter covering all provided comments.
 * Returns the full letter text ready for submission.
 *
 * Directly supports Q3 roadmap: "Resubmittal Package Builder"
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

    const { comments, projectName, permitNumber, jurisdiction, applicantName } =
      validation.data;

    const response = await AIRouter.draftResponseLetter(comments, {
      projectName,
      permitNumber,
      jurisdiction,
      applicantName,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/ai/response-letter:', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
