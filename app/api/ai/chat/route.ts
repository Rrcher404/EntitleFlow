/**
 * API Route: /api/ai/chat
 *
 * FlowE chat endpoint. Handles conversational messages, maintains
 * context awareness, and persists chat history to Supabase.
 *
 * Auth: Required — uses Supabase session.
 *
 * NOTE: The flowe_conversations and flowe_messages tables are new and
 * not yet in the generated Database types. We use explicit typing until
 * types are regenerated with `npx supabase gen types`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { chatWithFlowE, type FlowEMessage } from '@/lib/ai/agents/flowe-assistant';

// Explicit types for FlowE tables (until DB types are regenerated)
interface FlowEConversationRow {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface FlowEMessageRow {
  id: string;
  conversation_id: string;
  user_id: string;
  role: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      message,
      conversationId,
      context,
      useReasoning,
    } = body as {
      message: string;
      conversationId?: string;
      context?: {
        currentPage?: string;
        projectId?: string;
        permitId?: string;
      };
      useReasoning?: boolean;
    };

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      );
    }

    // Use untyped client for new FlowE tables
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Load conversation history if conversationId provided
    let history: FlowEMessage[] = [];
    let activeConversationId = conversationId;

    if (activeConversationId) {
      const { data: messages } = await db
        .from('flowe_messages')
        .select('role, content, created_at')
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true })
        .limit(20) as { data: FlowEMessageRow[] | null };

      if (messages) {
        history = messages.map((m: FlowEMessageRow) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: m.created_at,
        }));
      }
    } else {
      // Create a new conversation
      const { data: conv } = await db
        .from('flowe_conversations')
        .insert({
          user_id: user.id,
          title: message.substring(0, 100),
        })
        .select('id')
        .single() as { data: FlowEConversationRow | null };

      if (conv) {
        activeConversationId = conv.id;
      }
    }

    // Build data context from user's projects/permits if requested
    let dataContext: string | undefined;

    if (context?.projectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', context.projectId)
        .single();

      if (project) {
        dataContext = `PROJECT: ${project.name || 'Unknown'} (ID: ${project.id})\nStatus: ${project.status || 'unknown'}\nJurisdiction: ${project.jurisdiction || 'N/A'}`;
      }
    }

    if (context?.permitId) {
      const { data: permit } = await supabase
        .from('permits')
        .select('*')
        .eq('id', context.permitId)
        .single();

      if (permit) {
        const permitInfo = `\nPERMIT: ${permit.permit_number || permit.id}\nType: ${permit.permit_type || 'N/A'}\nStatus: ${permit.status || 'unknown'}`;
        dataContext = dataContext ? dataContext + permitInfo : permitInfo;
      }
    }

    // Execute FlowE chat
    const response = await chatWithFlowE({
      message,
      history,
      context: {
        ...context,
        dataContext,
      },
      useReasoning,
    });

    // Persist messages to Supabase (fire-and-forget for latency)
    if (activeConversationId) {
      // Save user message
      db.from('flowe_messages')
        .insert({
          conversation_id: activeConversationId,
          role: 'user',
          content: message,
          user_id: user.id,
        })
        .then(() => {});

      // Save assistant response
      db.from('flowe_messages')
        .insert({
          conversation_id: activeConversationId,
          role: 'assistant',
          content: response.message,
          user_id: user.id,
          metadata: {
            model: response.model,
            suggestedAgent: response.suggestedAgent,
            usage: response.usage,
            latencyMs: response.latencyMs,
          },
        })
        .then(() => {});

      // Update conversation title if it's the first message
      if (!conversationId) {
        db.from('flowe_conversations')
          .update({ title: message.substring(0, 100) })
          .eq('id', activeConversationId)
          .then(() => {});
      }
    }

    return NextResponse.json({
      message: response.message,
      conversationId: activeConversationId,
      model: response.model,
      suggestedAgent: response.suggestedAgent,
      usage: response.usage,
      latencyMs: response.latencyMs,
    });
  } catch (error) {
    console.error('[FlowE Chat Error]', error);
    const errMessage =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

/**
 * GET /api/ai/chat — Load conversation history
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use untyped client for new FlowE tables
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Load specific conversation
      const { data: messages } = await db
        .from('flowe_messages')
        .select('id, role, content, metadata, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true }) as { data: FlowEMessageRow[] | null };

      return NextResponse.json({ messages: messages || [] });
    }

    // List recent conversations
    const { data: conversations } = await db
      .from('flowe_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20) as { data: FlowEConversationRow[] | null };

    return NextResponse.json({ conversations: conversations || [] });
  } catch (error) {
    console.error('[FlowE Chat History Error]', error);
    return NextResponse.json(
      { error: 'Failed to load chat history' },
      { status: 500 },
    );
  }
}
