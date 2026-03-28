/**
 * FlowE Knowledge Retriever
 *
 * Fetches relevant knowledge from the flowe_knowledge table and formats it
 * for injection into FlowE's context window at inference time.
 *
 * Architecture:
 *   1. Extract keywords from the user's message
 *   2. Query flowe_knowledge with keyword overlap + full-text search
 *   3. Separate results into: domain knowledge, few-shot examples, corrections
 *   4. Format into structured context blocks for the system prompt
 *
 * This is the "RAG-lite" approach — keyword/FTS retrieval instead of vector
 * embeddings. The interface is designed so swapping in pgvector later only
 * changes the retrieval step, not the injection format.
 */

import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { generateEmbedding } from './embeddings';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KnowledgeEntry {
  id: string;
  category: string;
  title: string;
  content: string;
  keywords: string[];
  tags: string[];
  example_question?: string;
  example_response?: string;
  confidence: number;
  source?: string;
}

export interface RetrievedContext {
  /** Domain knowledge entries formatted as context blocks */
  knowledgeBlocks: string;
  /** Few-shot examples formatted as conversation pairs */
  fewShotExamples: string;
  /** Corrections/updates that override default knowledge */
  corrections: string;
  /** Total number of entries retrieved */
  totalEntries: number;
}

// ---------------------------------------------------------------------------
// Keyword Extraction
// ---------------------------------------------------------------------------

/** Common stop words to filter out */
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over',
  'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
  'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'not', 'only', 'same', 'so',
  'than', 'too', 'very', 'just', 'about', 'what', 'which', 'who', 'whom',
  'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you',
  'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them',
  'their', 'and', 'but', 'or', 'if', 'while', 'because', 'until', 'also',
]);

/**
 * Extract meaningful keywords from a user message.
 * Preserves domain-specific terms like "TRC", "NCDOT", "UDO", etc.
 */
export function extractKeywords(message: string): string[] {
  return message
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')  // Keep hyphens for compound terms
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word))
    .filter((word, index, self) => self.indexOf(word) === index) // dedupe
    .slice(0, 15); // cap at 15 keywords
}

// ---------------------------------------------------------------------------
// Retrieval
// ---------------------------------------------------------------------------

/**
 * Retrieve relevant knowledge entries for a user's message.
 *
 * Strategy:
 *   1. Extract keywords from the message
 *   2. Query with keyword array overlap (fast, index-backed)
 *   3. Also try full-text search for broader matches
 *   4. Deduplicate and rank by confidence
 */
export async function retrieveKnowledge(
  message: string,
  options: {
    organizationId?: string;
    maxEntries?: number;
    maxFewShot?: number;
    categories?: string[];
  } = {},
): Promise<RetrievedContext> {
  const {
    maxEntries = 5,
    maxFewShot = 2,
    categories,
    organizationId,
  } = options;

  const adminClient = getSupabaseAdminClient();

  if (!adminClient) {
    return { knowledgeBlocks: '', fewShotExamples: '', corrections: '', totalEntries: 0 };
  }

  const keywords = extractKeywords(message);

  if (keywords.length === 0) {
    return { knowledgeBlocks: '', fewShotExamples: '', corrections: '', totalEntries: 0 };
  }

  try {
    // Strategy: Try semantic (vector) search first, fall back to keyword match
    let entries: KnowledgeEntry[] | null = null;

    // Attempt vector search if embeddings are available
    try {
      const queryEmbedding = await generateEmbedding(message);
      if (queryEmbedding) {
        const { data: vectorResults, error: vectorError } = await adminClient
          .rpc('match_flowe_knowledge', {
            query_embedding: `[${queryEmbedding.embedding.join(',')}]`,
            match_threshold: 0.65,
            match_count: maxEntries + maxFewShot + 3,
            filter_category: categories && categories.length === 1 ? categories[0] : undefined,
            filter_org_id: organizationId || undefined,
          });

        if (!vectorError && vectorResults && vectorResults.length > 0) {
          entries = vectorResults;
        }
      }
    } catch (_vectorSearchError) {
      // Vector search failed — fall back to keyword search
      // This is expected when embeddings haven't been generated yet
    }

    // Fallback: Keyword overlap match
    if (!entries) {
      let keywordQuery = adminClient
        .from('flowe_knowledge')
        .select('id, category, title, content, keywords, tags, example_question, example_response, confidence, source')
        .eq('is_active', true)
        .overlaps('keywords', keywords)
        .order('confidence', { ascending: false })
        .limit(maxEntries + maxFewShot + 3);

      // Scope: global + org-specific
      if (organizationId) {
        keywordQuery = keywordQuery.or(`organization_id.is.null,organization_id.eq.${organizationId}`);
      } else {
        keywordQuery = keywordQuery.is('organization_id', null);
      }

      if (categories && categories.length > 0) {
        keywordQuery = keywordQuery.in('category', categories);
      }

      const { data: keywordEntries, error: keywordError } = await keywordQuery;

      if (keywordError) {
        console.error('Knowledge retrieval error:', keywordError.message);
        return { knowledgeBlocks: '', fewShotExamples: '', corrections: '', totalEntries: 0 };
      }

      entries = (keywordEntries || []).map((entry: Record<string, unknown>) => ({
        ...entry,
        example_question: entry.example_question || undefined,
        example_response: entry.example_response || undefined,
      } as KnowledgeEntry));
    } // end fallback

    if (!entries || entries.length === 0) {
      return { knowledgeBlocks: '', fewShotExamples: '', corrections: '', totalEntries: 0 };
    }

    // Separate by type
    const knowledge: KnowledgeEntry[] = [];
    const fewShots: KnowledgeEntry[] = [];
    const corrections: KnowledgeEntry[] = [];

    for (const entry of entries as KnowledgeEntry[]) {
      if (entry.category === 'few_shot') {
        if (fewShots.length < maxFewShot) fewShots.push(entry);
      } else if (entry.category === 'correction') {
        corrections.push(entry);
      } else {
        if (knowledge.length < maxEntries) knowledge.push(entry);
      }
    }

    // Format knowledge blocks
    const knowledgeBlocks = knowledge.length > 0
      ? '--- DOMAIN KNOWLEDGE (retrieved from knowledge base) ---\n' +
        knowledge.map(k =>
          `[${k.category.toUpperCase()}] ${k.title}\n${k.content}${k.source ? `\n(Source: ${k.source})` : ''}`
        ).join('\n\n') +
        '\n--- END DOMAIN KNOWLEDGE ---'
      : '';

    // Format few-shot examples
    const fewShotExamples = fewShots.length > 0
      ? '--- EXAMPLE CONVERSATIONS (follow this style and depth) ---\n' +
        fewShots.map(f =>
          `User: ${f.example_question}\nFlowE: ${f.example_response}`
        ).join('\n\n') +
        '\n--- END EXAMPLES ---'
      : '';

    // Format corrections
    const correctionsText = corrections.length > 0
      ? '--- CORRECTIONS (these override your default knowledge) ---\n' +
        corrections.map(c => `CORRECTION: ${c.title}\n${c.content}`).join('\n\n') +
        '\n--- END CORRECTIONS ---'
      : '';

    return {
      knowledgeBlocks,
      fewShotExamples,
      corrections: correctionsText,
      totalEntries: knowledge.length + fewShots.length + corrections.length,
    };
  } catch (error) {
    console.error('Knowledge retrieval failed:', error);
    return { knowledgeBlocks: '', fewShotExamples: '', corrections: '', totalEntries: 0 };
  }
}
