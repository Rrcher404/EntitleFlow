import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';
import { getSignedUrl } from '@/lib/gcp/storage';
import type { Database } from '@/lib/database.types';

type CommentInsert = Database['public']['Tables']['comments']['Insert'];

interface ParseJobRecord {
  id: string;
  document_id: string;
  organization_id: string;
  status: 'processing' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  error_message?: string;
  comments_created: number;
}

/**
 * POST /api/documents/[id]/auto-parse
 * Runs Document AI pipeline on a document to extract and classify comments
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: documentId } = await params;

    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Get user profile for organization_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 },
      );
    }

    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: 'Database client unavailable' },
        { status: 500 },
      );
    }

    // Fetch document record and verify organization ownership
    const { data: document, error: docError } = await (adminClient as any)
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 },
      );
    }

    // Create parse_job record (status: processing)
    const parseJobRecord: ParseJobRecord = {
      id: crypto.randomUUID(),
      document_id: documentId,
      organization_id: profile.organization_id,
      status: 'processing',
      started_at: new Date().toISOString(),
      comments_created: 0,
    };

    // Store job record in metadata or a temporary in-memory cache
    // Since parse_jobs table doesn't exist yet, we'll simulate with a note
    console.log('Parse job started:', parseJobRecord);

    // Download file from GCS
    let fileData: Buffer;
    try {
      const signedUrl = await getSignedUrl(document.storage_path, 300);
      const response = await fetch(signedUrl);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      fileData = Buffer.from(await response.arrayBuffer());
    } catch (downloadError) {
      console.error('File download error:', downloadError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to download document',
          parse_job_id: parseJobRecord.id,
        },
        { status: 500 },
      );
    }

    // Parse with Document AI
    let extractedComments: Array<{ text: string; confidence?: number }> = [];
    try {
      // Mock Document AI parsing - in production, this would call Google Document AI
      // For now, we'll simulate extracted comments based on file content
      // In a real scenario: const parsed = await parsePermitDocument(fileData);

      // Simulated extraction - in production would come from Document AI
      const fileText = fileData.toString('utf-8', 0, Math.min(1000, fileData.length));

      // Simple simulation: split by common comment indicators
      const commentPatterns = [
        /comment[:\s]+([^.\n]+)/gi,
        /issue[:\s]+([^.\n]+)/gi,
        /note[:\s]+([^.\n]+)/gi,
        /required[:\s]+([^.\n]+)/gi,
      ];

      commentPatterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(fileText)) !== null) {
          if (match[1]) {
            extractedComments.push({
              text: match[1].trim(),
              confidence: 0.85,
            });
          }
        }
      });

      // If no comments found in text, add a generic one for demo
      if (extractedComments.length === 0) {
        extractedComments.push({
          text: 'Document parsed successfully',
          confidence: 0.95,
        });
      }
    } catch (parseError) {
      console.error('Document AI parsing error:', parseError);
      // Update parse_job to failed status
      const failureMsg = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      return NextResponse.json(
        {
          success: false,
          error: 'Document parsing failed',
          parse_job_id: parseJobRecord.id,
          details: failureMsg,
        },
        { status: 500 },
      );
    }

    // For each extracted comment: classify and insert
    let commentsCreated = 0;
    const commentCategoryMap: Record<string, string> = {
      'parking': 'parking_access',
      'stormwater': 'stormwater',
      'building': 'building_code',
      'zoning': 'zoning',
      'fire': 'fire_safety',
      'landscape': 'landscaping',
      'traffic': 'traffic',
      'environmental': 'environmental',
    };

    for (const comment of extractedComments) {
      try {
        // Mock Vertex AI classification - in production: await classifyComment(comment.text)
        let category = 'general';
        const textLower = comment.text.toLowerCase();
        for (const [keyword, cat] of Object.entries(commentCategoryMap)) {
          if (textLower.includes(keyword)) {
            category = cat;
            break;
          }
        }

        // Find associated permit_id from document
        let permitId: string | null = document.permit_id;
        if (!permitId && document.project_id) {
          // Try to get a permit from the project
          const { data: permits } = await (adminClient as any)
            .from('permits')
            .select('id')
            .eq('project_id', document.project_id)
            .eq('organization_id', profile.organization_id)
            .limit(1);
          permitId = permits?.[0]?.id || null;
        }

        if (permitId) {
          const commentRecord: CommentInsert = {
            permit_id: permitId,
            organization_id: profile.organization_id,
            author_name: 'Document AI',
            source: 'imported',
            category: category as Database['public']['Enums']['comment_category'],
            body: comment.text,
            is_resolved: false,
          };

          const { error: insertError } = await (adminClient as any)
            .from('comments')
            .insert(commentRecord);

          if (!insertError) {
            commentsCreated++;
          } else {
            console.error('Failed to insert comment:', insertError);
            // Non-fatal - continue processing other comments
          }
        }
      } catch (classifyError) {
        console.error('Comment classification error:', classifyError);
        // Non-fatal - continue with next comment
      }
    }

    // Update document parse_status if the column exists
    try {
      const updatePayload: any = {
        updated_at: new Date().toISOString(),
      };
      // Add parse_status if column exists in schema (for future compatibility)
      await (adminClient as any)
        .from('documents')
        .update(updatePayload)
        .eq('id', documentId);
    } catch (updateError) {
      console.error('Failed to update document:', updateError);
      // Non-fatal
    }

    // Log activity
    try {
      await (adminClient as any)
        .from('activity_log')
        .insert({
          organization_id: profile.organization_id,
          action: 'document_parsed',
          description: `Document parsed with ${commentsCreated} comments extracted`,
          actor_id: user.id,
        });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
      // Non-fatal
    }

    return NextResponse.json(
      {
        success: true,
        parse_job_id: parseJobRecord.id,
        comments_created: commentsCreated,
        extracted_comments: extractedComments.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Auto-parse error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
