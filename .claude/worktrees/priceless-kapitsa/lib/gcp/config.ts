/**
 * GCP Configuration Helper
 * Handles auth for both local dev (GOOGLE_APPLICATION_CREDENTIALS) and
 * Vercel deployment (GCP_SERVICE_ACCOUNT_KEY JSON string)
 */

export interface GCPCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

/**
 * Get GCP credentials based on environment
 * - For local dev: reads from GOOGLE_APPLICATION_CREDENTIALS file path
 * - For Vercel: parses GCP_SERVICE_ACCOUNT_KEY JSON string
 * 
 * @returns Parsed credentials object or null if not available
 */
export function getGCPCredentials(): GCPCredentials | null {
  // First, try to get credentials from environment variable (Vercel)
  if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY);
    } catch (error) {
      console.error('Failed to parse GCP_SERVICE_ACCOUNT_KEY:', error);
      return null;
    }
  }

  // Second, check if GOOGLE_APPLICATION_CREDENTIALS is set (local dev)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      // In local dev, the file path is set, but the client library will handle it
      // We just return a signal that credentials are available
      return null; // Let the client library auto-detect
    } catch (error) {
      console.error('Failed to read GOOGLE_APPLICATION_CREDENTIALS:', error);
      return null;
    }
  }

  return null;
}

/**
 * Get the GCP project ID
 * @returns Project ID or null if not available
 */
export function getGCPProjectId(): string | null {
  return process.env.GCP_PROJECT_ID || null;
}

/**
 * Get Document AI processor configuration
 * @returns Object with processorId and location
 */
export function getDocumentAIConfig() {
  const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;
  const location = process.env.DOCUMENT_AI_LOCATION || 'us';

  if (!processorId) {
    throw new Error('DOCUMENT_AI_PROCESSOR_ID environment variable is required');
  }

  return {
    processorId,
    location,
  };
}
