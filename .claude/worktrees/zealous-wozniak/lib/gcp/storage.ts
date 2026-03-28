import { Storage, type Bucket } from '@google-cloud/storage';

let gcsClient: Storage | null = null;
let gcsBucket: Bucket | null = null;

/**
 * Initialize and return the GCS client singleton
 */
function getGCSClient(): Storage {
  if (gcsClient) return gcsClient;

  const projectId = process.env.GCP_PROJECT_ID;
  if (!projectId) {
    throw new Error('GCP_PROJECT_ID environment variable is required');
  }

  // Support both GOOGLE_APPLICATION_CREDENTIALS file path and GCP_SERVICE_ACCOUNT_KEY JSON string
  const credentials = process.env.GCP_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY)
    : undefined;

  gcsClient = new Storage({
    projectId,
    ...(credentials && { credentials }),
    // If GOOGLE_APPLICATION_CREDENTIALS is set, the client will auto-detect it
  });

  return gcsClient;
}

/**
 * Get the GCS bucket instance
 */
export function getBucket(): Bucket {
  if (gcsBucket) return gcsBucket;

  const bucketName = process.env.GCS_BUCKET_NAME || 'entitleflow-documents';
  const client = getGCSClient();
  gcsBucket = client.bucket(bucketName);

  return gcsBucket;
}

/**
 * Upload a file to GCS
 * @param orgId Organization ID (used in path)
 * @param fileName Original file name
 * @param fileBuffer File contents as Buffer
 * @param mimeType MIME type of the file
 * @returns GCS storage path (e.g., "org-123/1234567890-filename.pdf")
 */
export async function uploadFile(
  orgId: string,
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string,
): Promise<string> {
  if (!orgId || !fileName || !fileBuffer || !mimeType) {
    throw new Error('orgId, fileName, fileBuffer, and mimeType are required');
  }

  // Generate unique name with timestamp to avoid collisions
  const timestamp = Date.now();
  const storagePath = `${orgId}/${timestamp}-${fileName}`;

  const bucket = getBucket();
  const file = bucket.file(storagePath);

  try {
    await file.save(fileBuffer, {
      metadata: {
        contentType: mimeType,
      },
    });

    return storagePath;
  } catch (error) {
    console.error('GCS upload error:', error);
    throw new Error(`Failed to upload file to GCS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a signed download URL for a file
 * @param storagePath GCS storage path
 * @param expiresInMinutes URL expiration time in minutes (default: 60)
 * @returns Signed download URL
 */
export async function getSignedUrl(
  storagePath: string,
  expiresInMinutes: number = 60,
): Promise<string> {
  if (!storagePath) {
    throw new Error('storagePath is required');
  }

  const bucket = getBucket();
  const file = bucket.file(storagePath);

  try {
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });

    return url;
  } catch (error) {
    console.error('GCS signed URL error:', error);
    throw new Error(
      `Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Delete a file from GCS
 * @param storagePath GCS storage path
 */
export async function deleteFile(storagePath: string): Promise<void> {
  if (!storagePath) {
    throw new Error('storagePath is required');
  }

  const bucket = getBucket();
  const file = bucket.file(storagePath);

  try {
    await file.delete();
  } catch (error) {
    // Treat "file not found" as non-fatal
    if (
      error instanceof Error &&
      (error.message.includes('No such object') || error.message.includes('404'))
    ) {
      console.warn(`File not found in GCS: ${storagePath}`);
      return;
    }
    console.error('GCS delete error:', error);
    throw new Error(
      `Failed to delete file from GCS: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
