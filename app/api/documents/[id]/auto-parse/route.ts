import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';
import { getSignedUrl } from '@/lib/gcp/storage';
import { createNotification } from '@/lib/notifications';
import type { Database } from '@/lib/database.types';

type CommentInsert = Database['public']['Tables']['comments']['Insert'];

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
    const { data: document, error: docError } = await adminClient
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

    // Update document parse_status to 'processing' immediately for UI feedback
    try {
      await adminClient
        .from('documents')
        .update({ parse_status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', documentId);
    } catch (statusError) {
      console.warn('Failed to set processing status:', statusError);
    }

    // Create parse_job record in the database
    const parseJobId = crypto.randomUUID();
    try {
      await adminClient
        .from('parse_jobs')
        .insert({
          id: parseJobId,
          document_id: documentId,
          organization_id: profile.organization_id,
          status: 'processing',
          started_at: new Date().toISOString(),
          comments_created: 0,
        });
    } catch (jobError) {
      console.warn('Failed to create parse_job record:', jobError);
      // Non-fatal — continue parsing even if job tracking fails
    }

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
      // Mark parse as failed
      try {
        await adminClient.from('documents').update({ parse_status: 'failed' }).eq('id', documentId);
        await adminClient.from('parse_jobs').update({ status: 'failed', error_message: 'Failed to download document', completed_at: new Date().toISOString() }).eq('id', parseJobId);
      } catch (_downloadError) { /* non-fatal */ }
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to download document',
          parse_job_id: parseJobId,
        },
        { status: 500 },
      );
    }

    // Parse with Document AI
    const extractedComments: Array<{ text: string; confidence?: number }> = [];
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
      // Update parse_job and document to failed status
      const failureMsg = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      try {
        await adminClient.from('documents').update({ parse_status: 'failed' }).eq('id', documentId);
        await adminClient.from('parse_jobs').update({ status: 'failed', error_message: failureMsg, completed_at: new Date().toISOString() }).eq('id', parseJobId);
      } catch (_parseJobError) { /* non-fatal */ }
      return NextResponse.json(
        {
          success: false,
          error: 'Document parsing failed',
          parse_job_id: parseJobId,
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
          const { data: permits } = await adminClient
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

          const { error: insertError } = await adminClient
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

    // Update document parse_status to 'completed' and record parsed_at
    try {
      await adminClient
        .from('documents')
        .update({
          parse_status: 'completed',
          parsed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);
    } catch (updateError) {
      console.error('Failed to update document status:', updateError);
    }

    // Update parse_job record to completed
    try {
      await adminClient
        .from('parse_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          comments_created: commentsCreated,
          updated_at: new Date().toISOString(),
        })
        .eq('id', parseJobId);
    } catch (jobError) {
      console.warn('Failed to update parse_job:', jobError);
    }

    // Log activity
    try {
      await adminClient
        .from('activity_log')
        .insert({
          organization_id: profile.organization_id,
          action: 'document_parsed',
          description: `Document parsed with ${commentsCreated} comments extracted`,
          actor_id: user.id,
        });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    // Notify the uploader that parsing is complete
    try {
      await createNotification({
        recipientId: user.id,
        organizationId: profile.organization_id,
        type: 'ai_parse_complete',
        title: 'AI parsing complete',
        body: `${commentsCreated} comment${commentsCreated === 1 ? '' : 's'} extracted from "${document.file_name}" and ready for review.`,
        actionUrl: document.permit_id ? `/app/permits/${document.permit_id}` : `/app/documents`,
        metadata: {
          document_id: documentId,
          file_name: document.file_name,
          comments_created: commentsCreated,
        },
      });
    } catch (notifError) {
      console.error('Failed to send parse notification:', notifError);
    }

    return NextResponse.json(
      {
        success: true,
        parse_job_id: parseJobId,
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
