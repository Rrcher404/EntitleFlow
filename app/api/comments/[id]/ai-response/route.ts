import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';
import AIRouter from '@/lib/ai/router';

/**
 * POST /api/comments/[id]/ai-response
 * Generates an AI-suggested response to a specific comment.
 * Now powered by the Response Drafter agent with enhanced output.
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

    // Use the Response Drafter agent
    const agentResponse = await AIRouter.draftResponse(
      comment.body,
      comment.category || 'general',
    );

    const adminClient = getSupabaseAdminClient();

    if (!adminClient) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
    }

    // Update comment with AI suggestion
    const { data: updatedComment, error: updateError } = await adminClient!
      .from('comments')
      .update({
        metadata: {
          ...(comment.metadata as Record<string, unknown> || {}),
          ai_suggested_response: agentResponse.result.response,
          ai_confidence: agentResponse.result.confidence,
          ai_tone: agentResponse.result.tone,
          ai_code_references: agentResponse.result.codeReferences,
          ai_agent_id: agentResponse.agentId,
          ai_model: agentResponse.model.model,
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
      suggestion: agentResponse.result.response,
      confidence: agentResponse.result.confidence,
      tone: agentResponse.result.tone,
      codeReferences: agentResponse.result.codeReferences,
      agentId: agentResponse.agentId,
      model: agentResponse.model,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/comments/[id]/ai-response:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
