import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/documents/[id]/status
 * Returns the parse status of a document, including any active parse job details.
 * Used by the frontend to poll parsing progress after upload.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: documentId } = await params;

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile for org scoping
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Fetch document with parse status fields
    // Use `as any` to avoid strict column inference issues with generated types
    const { data: document, error: docError } = await (supabase
      .from('documents')
      .select('id, file_name, parse_status, parsed_at, auto_parse')
      .eq('id', documentId)
      .eq('organization_id', profile.organization_id)
      .single() as any);

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Fetch the latest parse job for this document (if any)
    const { data: parseJob, error: jobError } = await supabase
      .from('parse_jobs')
      .select('id, status, started_at, completed_at, comments_created, error_message, metadata')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      document_id: document.id,
      file_name: document.file_name,
      parse_status: parseJob?.status || document.parse_status || null,
      parsed_at: document.parsed_at,
      parse_job: parseJob
        ? {
            id: parseJob.id,
            status: parseJob.status,
            started_at: parseJob.started_at,
            completed_at: parseJob.completed_at,
            comments_created: parseJob.comments_created,
            error_message: parseJob.error_message,
          }
        : null,
    });
  } catch (error) {
    console.error('Document status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
