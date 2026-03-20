import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { summarizeReviewLetter } from '@/lib/gcp/vertex-ai';
import { z } from 'zod';

// Request validation schema
const requestSchema = z.object({
  text: z.string().min(1, 'Review letter text is required').max(50000, 'Text is too long (max 50KB)'),
});

/**
 * POST /api/ai/summarize
 * Summarizes a permit review letter into key sections and action items.
 * Requires authenticated user.
 *
 * Request body:
 * {
 *   "text": "string (1-50000 chars)"
 * }
 *
 * Response:
 * {
 *   "summary": "string",
 *   "totalItems": number,
 *   "criticalItems": ["string"],
 *   "actionItems": [
 *     {
 *       "item": "string",
 *       "category": "parking_access" | "stormwater" | "building_code" | ...
 *     }
 *   ],
 *   "categories": {
 *     "parking_access": number,
 *     "stormwater": number,
 *     ...
 *   }
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

    const { text } = validationResult.data;

    // Call Vertex AI to summarize the review letter
    const result = await summarizeReviewLetter(text);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in /api/ai/summarize:', error);

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

    return NextResponse.json({ error: 'Unexpected error during summarization' }, { status: 500 });
  }
}
