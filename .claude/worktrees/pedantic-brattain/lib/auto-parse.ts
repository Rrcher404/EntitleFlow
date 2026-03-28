/**
 * Auto-parse helper utilities
 * Trigger and manage document parsing pipeline
 */

/**
 * Trigger auto-parse for a document
 * Called after document upload to initiate Document AI pipeline
 * Non-blocking - returns immediately after triggering async parse
 */
export async function triggerAutoParse(documentId: string): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/documents/${documentId}/auto-parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error(`Auto-parse trigger failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Auto-parse trigger failed:', error);
    // Non-fatal - parsing can be triggered manually later
  }
}
