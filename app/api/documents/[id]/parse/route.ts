import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { parsePermitDocument } from '@/lib/gcp/document-ai';
import { getBucket } from '@/lib/gcp/storage';
import { createNotification } from '@/lib/notifications';

/**
 * POST /api/documents/[id]/parse
 * Triggers Document AI parsing on an uploaded document and creates comment records
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    // Resolve params
    const { id: documentId } = await params;

    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile for organization_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get admin client
    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json({ error: 'Database client unavailable' }, { status: 500 });
    }

    // Fetch document record
    const { data: document, error: docError } = await adminClient
      .from('documents')
      .select()
      .eq('id', documentId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (docError || !document) {
      console.error('Document fetch error:', docError);
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Verify file can be accessed
    if (!document.storage_path) {
      return NextResponse.json({ error: 'Document has no storage path' }, { status: 400 });
    }

    // Download file from GCS
    let fileBuffer: Buffer;
    try {
      const bucket = getBucket();
      const file = bucket.file(document.storage_path);
      const [contents] = await file.download();
      fileBuffer = contents;
    } catch (error) {
      console.error('Failed to download file from GCS:', error);
      return NextResponse.json(
        { error: 'Failed to download document from storage' },
        { status: 500 },
      );
    }

    // Parse document with Document AI
    let parsedDocument;
    try {
      parsedDocument = await parsePermitDocument(fileBuffer, document.file_type || 'application/pdf');
    } catch (error) {
      console.error('Document AI parsing error:', error);
      return NextResponse.json(
        {
          error: 'Failed to parse document',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 },
      );
    }

    // Create comment records from extracted comments
    const createdComments: Array<Record<string, unknown>> = [];
    for (const extractedComment of parsedDocument.comments) {
      // Ensure permit_id is set
      if (!document.permit_id) {
        console.warn('Document has no permit_id, skipping comment creation');
        continue;
      }

      const metadataObject = {
        source: 'document_ai_parse',
        documentId,
        pageNumber: extractedComment.pageNumber,
        confidence: extractedComment.confidence,
        extractedAt: new Date().toISOString(),
      };

      const commentRecord = {
        organization_id: profile.organization_id,
        permit_id: document.permit_id,
        author_name: 'Document AI Parser',
        author_role: 'system',
        body: extractedComment.content,
        category: extractedComment.category as "parking_access" | "stormwater" | "building_code" | "zoning" | "fire_safety" | "landscaping" | "traffic" | "environmental" | "general" | "other" | null,
        source: 'imported' as const,
        is_resolved: false,
        metadata: JSON.parse(JSON.stringify(metadataObject)),
      };

      const { data: createdComment, error: createError } = await adminClient!
        .from('comments')
        .insert(commentRecord)
        .select()
        .single();

      if (createError) {
        console.error('Failed to create comment:', createError);
        // Continue creating other comments even if one fails
        continue;
      }

      if (createdComment) {
        createdComments.push(createdComment);
      }
    }

    // Log activity
    try {
      await adminClient!.from('activity_log').insert({
        organization_id: profile.organization_id,
        action: 'document_parsed',
        description: `Document "${document.file_name}" parsed with Document AI. Extracted ${createdComments.length} comments.`,
        actor_id: user.id,
        permit_id: document.permit_id,
        project_id: document.project_id,
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
        title: 'Document parsing complete',
        body: `"${document.file_name}" has been parsed. ${createdComments.length} comment${createdComments.length === 1 ? '' : 's'} extracted and ready for review.`,
        actionUrl: document.permit_id ? `/app/permits/${document.permit_id}` : `/app/documents`,
        metadata: {
          document_id: documentId,
          file_name: document.file_name,
          comments_created: createdComments.length,
          permit_id: document.permit_id,
        },
      });
    } catch (notifError) {
      console.error('Failed to send parse notification:', notifError);
    }

    return NextResponse.json(
      {
        success: true,
        document: {
          id: documentId,
          fileName: document.file_name,
          storePath: document.storage_path,
        },
        parsedResult: {
          fullText: parsedDocument.fullText.substring(0, 500) + '...', // First 500 chars only for response
          pages: parsedDocument.pages,
          extractedCommentsCount: parsedDocument.comments.length,
          createdCommentsCount: createdComments.length,
          metadata: parsedDocument.metadata,
        },
        createdComments,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
