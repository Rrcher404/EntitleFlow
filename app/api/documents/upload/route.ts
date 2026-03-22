import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { uploadFile, getSignedUrl } from '@/lib/gcp/storage';
import { createOrganizationNotification } from '@/lib/notifications';
import type { Database } from '@/lib/database.types';

type DocumentInsert = Database['public']['Tables']['documents']['Insert'];

/**
 * POST /api/documents/upload
 * Uploads a file to GCS and creates a document record in the database
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
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

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const fileName = formData.get('fileName') as string | null;
    const documentType = formData.get('documentType') as string | null;
    const projectId = formData.get('projectId') as string | null;
    const permitId = formData.get('permitId') as string | null;
    const description = formData.get('description') as string | null;
    const isPublic = formData.get('isPublic') === 'true';

    // Validate required fields
    if (!file || !fileName || !documentType) {
      return NextResponse.json(
        { error: 'Missing required fields: file, fileName, documentType' },
        { status: 400 },
      );
    }

    // Validate file size (max 100MB)
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 100MB limit' },
        { status: 413 },
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to GCS
    const storagePath = await uploadFile(
      profile.organization_id,
      fileName,
      fileBuffer,
      file.type,
    );

    // Insert document record in database
    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: 'Database client unavailable' },
        { status: 500 },
      );
    }

    const documentRecord: DocumentInsert = {
      organization_id: profile.organization_id,
      project_id: projectId || null,
      permit_id: permitId || null,
      file_name: fileName,
      storage_path: storagePath,
      file_size: file.size,
      file_type: file.type,
      document_type: (documentType as Database['public']['Enums']['document_type']) || 'other',
      uploaded_by: user.id,
      description: description || fileName,
      is_public: isPublic,
      version: 1,
    };

    const { data: insertedDoc, error: insertError } = await (adminClient as any)
      .from('documents')
      .insert(documentRecord)
      .select()
      .single();

    if (insertError || !insertedDoc) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 },
      );
    }

    // Generate signed URL for download
    let signedUrl: string | null = null;
    try {
      signedUrl = await getSignedUrl(storagePath, 60);
    } catch (error) {
      console.error('Failed to generate signed URL:', error);
      // Continue without signed URL - it can be generated on demand
    }

    // Log activity
    try {
      await (adminClient as any)
        .from('activity_log')
        .insert({
          organization_id: profile.organization_id,
          action: 'document_uploaded',
          description: `${fileName} uploaded`,
          actor_id: user.id,
        });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    // Notify team members about the upload
    try {
      await createOrganizationNotification({
        organizationId: profile.organization_id,
        type: 'document_uploaded',
        title: 'New document uploaded',
        body: `${fileName} was uploaded${permitId ? ' to a permit' : ''}`,
        actionUrl: permitId ? `/app/permits/${permitId}` : `/app/documents`,
        metadata: {
          document_id: insertedDoc.id,
          file_name: fileName,
          permit_id: permitId,
        },
        excludeUserId: user.id,
      });
    } catch (notifError) {
      console.error('Failed to send upload notification:', notifError);
    }

    return NextResponse.json(
      {
        success: true,
        document: insertedDoc,
        downloadUrl: signedUrl,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
