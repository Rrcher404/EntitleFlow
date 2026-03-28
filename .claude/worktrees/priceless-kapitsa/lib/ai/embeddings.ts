/**
 * EntitleFlow AI — Embedding Generation
 *
 * Generates text embeddings using Vertex AI's textembedding-gecko model.
 * Used for semantic search in the FlowE knowledge base.
 *
 * Uses GCP credits (no additional cost beyond Vertex AI usage).
 * Falls back gracefully if Vertex AI is unavailable.
 */

import { getSupabaseAdminClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
}

// ---------------------------------------------------------------------------
// Embedding Generation
// ---------------------------------------------------------------------------

/**
 * Generate a text embedding using Vertex AI textembedding-gecko.
 * Returns a 768-dimensional vector.
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult | null> {
  try {
    const { VertexAI } = await import('@google-cloud/vertexai');
    const projectId = process.env.GCP_PROJECT_ID || 'gravityclaw-488910';
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

    const vertexAI = new VertexAI({ project: projectId, location });

    // Use the prediction API for embeddings
    const model = 'textembedding-gecko@003';
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;

    // Use the REST API directly since the SDK doesn't have a clean embedding method
    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();

    const response = await client.request({
      url: endpoint,
      method: 'POST',
      data: {
        instances: [{ content: text }],
      },
    });

    const predictions = (response.data as any)?.predictions;
    if (!predictions || predictions.length === 0) {
      console.error('No embedding returned from Vertex AI');
      return null;
    }

    const embedding = predictions[0].embeddings?.values;
    if (!embedding) {
      console.error('Embedding values not found in response');
      return null;
    }

    return {
      embedding,
      dimensions: embedding.length,
    };
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    return null;
  }
}

/**
 * Generate embeddings for a batch of texts.
 * More efficient than calling generateEmbedding() in a loop.
 */
export async function generateBatchEmbeddings(
  texts: string[]
): Promise<(EmbeddingResult | null)[]> {
  try {
    const projectId = process.env.GCP_PROJECT_ID || 'gravityclaw-488910';
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

    const model = 'textembedding-gecko@003';
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;

    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();

    const response = await client.request({
      url: endpoint,
      method: 'POST',
      data: {
        instances: texts.map((text) => ({ content: text })),
      },
    });

    const predictions = (response.data as any)?.predictions;
    if (!predictions) return texts.map(() => null);

    return predictions.map((pred: any) => {
      const embedding = pred.embeddings?.values;
      if (!embedding) return null;
      return { embedding, dimensions: embedding.length };
    });
  } catch (error) {
    console.error('Failed to generate batch embeddings:', error);
    return texts.map(() => null);
  }
}

// ---------------------------------------------------------------------------
// Knowledge Base Embedding Management
// ---------------------------------------------------------------------------

/**
 * Generate and store an embedding for a single knowledge entry.
 */
export async function embedKnowledgeEntry(entryId: string): Promise<boolean> {
  const adminClient = getSupabaseAdminClient();
  if (!adminClient) return false;

  try {
    // Fetch the entry
    const { data: entry, error } = await (adminClient as any)
      .from('flowe_knowledge')
      .select('title, content, example_question')
      .eq('id', entryId)
      .single();

    if (error || !entry) return false;

    // Combine title + content for embedding (include example question for few-shot entries)
    const textToEmbed = [entry.title, entry.content, entry.example_question]
      .filter(Boolean)
      .join(' ');

    const result = await generateEmbedding(textToEmbed);
    if (!result) return false;

    // Store the embedding
    const { error: updateError } = await (adminClient as any)
      .from('flowe_knowledge')
      .update({
        embedding: `[${result.embedding.join(',')}]`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId);

    if (updateError) {
      console.error('Failed to store embedding:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to embed knowledge entry:', error);
    return false;
  }
}

/**
 * Generate embeddings for all knowledge entries that don't have one yet.
 * Call this as a batch job after seeding the knowledge base.
 */
export async function embedAllKnowledge(): Promise<{ processed: number; succeeded: number }> {
  const adminClient = getSupabaseAdminClient();
  if (!adminClient) return { processed: 0, succeeded: 0 };

  try {
    const { data: entries, error } = await (adminClient as any)
      .from('flowe_knowledge')
      .select('id, title, content, example_question')
      .eq('is_active', true)
      .is('embedding', null)
      .limit(50); // Process in batches of 50

    if (error || !entries || entries.length === 0) {
      return { processed: 0, succeeded: 0 };
    }

    // Generate embeddings in batch
    const texts = entries.map((e: any) =>
      [e.title, e.content, e.example_question].filter(Boolean).join(' ')
    );

    const embeddings = await generateBatchEmbeddings(texts);

    let succeeded = 0;

    // Store each embedding
    for (let i = 0; i < entries.length; i++) {
      const embedding = embeddings[i];
      if (!embedding) continue;

      const { error: updateError } = await (adminClient as any)
        .from('flowe_knowledge')
        .update({
          embedding: `[${embedding.embedding.join(',')}]`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', entries[i].id);

      if (!updateError) succeeded++;
    }

    return { processed: entries.length, succeeded };
  } catch (error) {
    console.error('Failed to embed all knowledge:', error);
    return { processed: 0, succeeded: 0 };
  }
}
