import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { suggestResponse } from '@/lib/gcp/vertex-ai';
import { z } from 'zod';

// Request validation schema
const requestSchema = z.object({
  commentText: z
    .string()
    .min(1, 'Comment text is required')
    .max(5000, 'Comment text is too long'),
  category: z.string().min(1, 'Category is required').max(50, 'Category is too long'),
});

/**
 * POST /api/ai/suggest-response
 * Generates a professional response suggestion for a given review comment.
 * Requires authenticated user.
 *
 * Request body:
 * {
 *   "commentText": "string (1-5000 chars)",
 *   "category": "string"
 * }
 *
 * Response:
 * {
 *   "response": "string"
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify user is authenticated
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: User session required' },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { commentText, category } = validationResult.data;

    // Call Vertex AI to generate response suggestion
    const response = await suggestResponse(commentText, category);

    return NextResponse.json({ response }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/ai/suggest-response:', error);

    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }

      if (error.message.includes('Invalid')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'Unexpected error generating response suggestion' },
      { status: 500 },
    );
  }
}
