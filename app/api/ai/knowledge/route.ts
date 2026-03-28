import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/ai/knowledge
 * Retrieve knowledge entries matching a query (used by FlowE at inference time)
 * Query params: q (search query), category, limit
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '5', 10), 20);

    const adminClient = getSupabaseAdminClient();

    if (!adminClient) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
    }

    // Build the query — combine keyword matching with full-text search
    let dbQuery = adminClient!
      .from('flowe_knowledge')
      .select('id, category, title, content, keywords, tags, example_question, example_response, confidence, source')
      .eq('is_active', true)
      .order('confidence', { ascending: false })
      .limit(limit);

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    // Use full-text search if a query is provided
    if (query) {
      dbQuery = dbQuery.textSearch('title || content', query, {
        type: 'websearch',
        config: 'english',
      });
    }

    const { data: entries, error } = await dbQuery;

    if (error) {
      // Fallback: if full-text search fails, try keyword overlap
      console.warn('Full-text search failed, falling back to keyword match:', error.message);

      const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

      let fallbackQuery = adminClient!
        .from('flowe_knowledge')
        .select('id, category, title, content, keywords, tags, example_question, example_response, confidence, source')
        .eq('is_active', true)
        .order('confidence', { ascending: false })
        .limit(limit);

      if (category) {
        fallbackQuery = fallbackQuery.eq('category', category);
      }

      if (keywords.length > 0) {
        fallbackQuery = fallbackQuery.overlaps('keywords', keywords);
      }

      const { data: fallbackEntries, error: fallbackError } = await fallbackQuery;

      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 400 });
      }

      return NextResponse.json({ data: fallbackEntries || [] });
    }

    return NextResponse.json({ data: entries || [] });
  } catch (error) {
    console.error('Error fetching knowledge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/ai/knowledge
 * Add a new knowledge entry (admin/team lead function)
 * Body: { category, title, content, keywords, tags, source?, example_question?, example_response? }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      category,
      title,
      content,
      keywords = [],
      tags = [],
      source,
      source_url,
      example_question,
      example_response,
      is_global = false,
    } = body;

    if (!category || !title || !content) {
      return NextResponse.json(
        { error: 'category, title, and content are required' },
        { status: 400 },
      );
    }

    const validCategories = ['nc_code', 'jurisdiction', 'platform', 'workflow', 'faq', 'correction', 'few_shot'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 },
      );
    }

    if (category === 'few_shot' && (!example_question || !example_response)) {
      return NextResponse.json(
        { error: 'few_shot entries require example_question and example_response' },
        { status: 400 },
      );
    }

    const adminClient = getSupabaseAdminClient();

    if (!adminClient) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
    }

    const { data: entry, error } = await adminClient!
      .from('flowe_knowledge')
      .insert({
        category,
        title,
        content,
        keywords: keywords.map((k: string) => k.toLowerCase()),
        tags,
        source: source || null,
        source_url: source_url || null,
        example_question: example_question || null,
        example_response: example_response || null,
        organization_id: is_global ? null : profile.organization_id,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    console.error('Error creating knowledge entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
