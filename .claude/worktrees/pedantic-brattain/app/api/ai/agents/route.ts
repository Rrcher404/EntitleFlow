import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AIRouter from '@/lib/ai/router';

/**
 * GET /api/ai/agents
 * Lists all available AI agents and their capabilities.
 * Includes whether the enhancement layer (MiMo-v2-Pro) is active.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: User session required' },
        { status: 401 },
      );
    }

    return NextResponse.json({
      agents: AIRouter.listAgents(),
      enhancementLayerEnabled: AIRouter.isEnhancementEnabled(),
    });
  } catch (error) {
    console.error('Error in GET /api/ai/agents:', error);
    return NextResponse.json(
      { error: 'Failed to list agents' },
      { status: 500 },
    );
  }
}
