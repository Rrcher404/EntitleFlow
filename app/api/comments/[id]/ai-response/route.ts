import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';
import { suggestResponse } from '@/lib/gcp/vertex-ai';

/**
 * POST /api/comments/[id]/ai-response
 * Generates an AI-suggested response to a comment
 * Body: {}
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { id } = await params;

    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('*')
      .eq('id', id)
      .single();

    if (commentError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Call Vertex AI to generate response suggestion
    const suggestion = await suggestResponse(
      comment.body,
      comment.category || 'general',
    );

    const adminClient = getSupabaseAdminClient();

    // Update comment with AI suggestion
    const { data: updatedComment, error: updateError } = await (adminClient as any)
      .from('comments')
      .update({
        metadata: {
          ...(comment.metadata as any),
          ai_suggested_response: suggestion,
          ai_confidence: 0.85,
          ai_suggestion_generated_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedComment) {
      console.error('Error updating comment with AI suggestion:', updateError);
      return NextResponse.json(
        { error: 'Failed to save AI suggestion' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      suggestion,
      confidence: 0.85,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/comments/[id]/ai-response:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
