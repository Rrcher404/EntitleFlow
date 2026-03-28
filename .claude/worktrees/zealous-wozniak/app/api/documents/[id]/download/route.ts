import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSignedUrl } from '@/lib/gcp/storage';

/**
 * GET /api/documents/[id]/download
 * Returns a signed download URL for a document
 * Validates that the user has access to the document (same organization)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 },
      );
    }

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

    // Get user organization
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

    // Fetch document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 },
      );
    }

    // Check organization access
    if (document.organization_id !== profile.organization_id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 },
      );
    }

    // Generate signed URL (valid for 60 minutes)
    const signedUrl = await getSignedUrl(document.storage_path, 60);

    return NextResponse.json(
      {
        downloadUrl: signedUrl,
        fileName: document.file_name,
        fileSize: document.file_size,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Download URL generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate download URL',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
