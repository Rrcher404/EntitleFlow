import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { classifyComment } from '@/lib/gcp/vertex-ai';
import { z } from 'zod';

// Request validation schema
const requestSchema = z.object({
  text: z.string().min(1, 'Comment text is required').max(5000, 'Comment text is too long'),
});

/**
 * POST /api/ai/classify
 * Classifies a permit review comment into one of the predefined categories.
 * Requires authenticated user.
 *
 * Request body:
 * {
 *   "text": "string (1-5000 chars)"
 * }
 *
 * Response:
 * {
 *   "category": "parking_access" | "stormwater" | "building_code" | "zoning" | "fire_safety" | "landscaping" | "traffic" | "environmental" | "general" | "other",
 *   "confidence": number (0.0-1.0),
 *   "reasoning": string
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

    // Call Vertex AI to classify the comment
    const result = await classifyComment(text);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in /api/ai/classify:', error);

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

    return NextResponse.json({ error: 'Unexpected error during classification' }, { status: 500 });
  }
}
