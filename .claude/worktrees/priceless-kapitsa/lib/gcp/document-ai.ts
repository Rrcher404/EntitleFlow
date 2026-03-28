/**
 * Document AI Parser for permit review documents
 * Handles OCR and form parsing of PDFs and images
 */

import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import type { protos } from '@google-cloud/documentai';
import { getGCPCredentials, getDocumentAIConfig, getGCPProjectId } from './config';

export type CommentCategory =
  | 'parking_access'
  | 'stormwater'
  | 'building_code'
  | 'zoning'
  | 'fire_safety'
  | 'landscaping'
  | 'traffic'
  | 'environmental'
  | 'general'
  | 'other';

export interface ExtractedComment {
  content: string;
  category: CommentCategory;
  pageNumber: number;
  confidence: number;
}

export interface DocumentMetadata {
  permitNumber?: string;
  reviewDate?: string;
  reviewerName?: string;
  jurisdiction?: string;
}

export interface ParsedPermitDocument {
  fullText: string;
  pages: number;
  comments: ExtractedComment[];
  metadata: DocumentMetadata;
}

/**
 * Categorize comment text based on keyword matching
 */
export function categorizeComment(text: string): CommentCategory {
  const lowerText = text.toLowerCase();

  // Define keyword patterns for each category
  const categories: Record<CommentCategory, RegExp> = {
    stormwater: /drainage|stormwater|runoff|erosion|bmp|basin|storm|water quality/i,
    zoning: /setback|far|density|variance|zoning|overlay|lot coverage|height|bulk/i,
    building_code:
      /ibc|building code|egress|ada|accessibility|structural|fire protection|occupancy/i,
    fire_safety:
      /fire|sprinkler|hydrant|fire marshal|fire code|fire rating|fire separation/i,
    parking_access:
      /parking|driveway|ada space|loading|access|circulation|handicap|accessible/i,
    landscaping:
      /buffer|tree|landscape|screening|canopy|vegetation|planting|groundcover/i,
    traffic:
      /traffic|tia|trip|intersection|signal|dot|transportation|crosswalk|circulation/i,
    environmental:
      /wetland|endangered|nepa|environmental|contamination|remediation|habitat|epa/i,
    general: /comment|note|issue|concern|observation|review/i,
    other: /.*/i, // Catch-all
  };

  // Check each category in order (excluding 'other' and 'general')
  for (const [category, pattern] of Object.entries(categories)) {
    if (category !== 'other' && category !== 'general') {
      if (pattern.test(lowerText)) {
        return category as CommentCategory;
      }
    }
  }

  // Check general as second-to-last fallback
  if (categories.general.test(lowerText)) {
    return 'general';
  }

  return 'other';
}

/**
 * Split full document text into individual comments
 * Assumes numbered items like "1. Comment text" or similar patterns
 */
function extractComments(fullText: string, pageCount: number): ExtractedComment[] {
  const comments: ExtractedComment[] = [];

  // Split by common comment delimiters: numbered items, bullet points, or consecutive line breaks
  const lines = fullText.split('\n').filter((line) => line.trim());

  let currentComment = '';
  let pageNumber = 1;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect numbered items (1., 2., etc.)
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      // Save previous comment if exists
      if (currentComment.trim()) {
        comments.push({
          content: currentComment.trim(),
          category: categorizeComment(currentComment),
          pageNumber,
          confidence: 0.85,
        });
      }
      currentComment = numberedMatch[2];
      continue;
    }

    // Detect bullet points
    if (trimmed.match(/^[\-\*\•]\s+/)) {
      if (currentComment.trim()) {
        comments.push({
          content: currentComment.trim(),
          category: categorizeComment(currentComment),
          pageNumber,
          confidence: 0.85,
        });
      }
      currentComment = trimmed.replace(/^[\-\*\•]\s+/, '');
      continue;
    }

    // Detect page breaks or section headers
    if (
      trimmed.toLowerCase().includes('page') ||
      trimmed.toLowerCase().includes('---') ||
      trimmed.length === 0
    ) {
      if (currentComment.trim()) {
        comments.push({
          content: currentComment.trim(),
          category: categorizeComment(currentComment),
          pageNumber,
          confidence: 0.85,
        });
        currentComment = '';
      }
      pageNumber = Math.min(pageNumber + 1, pageCount);
      continue;
    }

    // Accumulate text for current comment
    if (currentComment) {
      currentComment += ' ' + trimmed;
    } else {
      currentComment = trimmed;
    }
  }

  // Save final comment
  if (currentComment.trim()) {
    comments.push({
      content: currentComment.trim(),
      category: categorizeComment(currentComment),
      pageNumber,
      confidence: 0.85,
    });
  }

  return comments;
}

/**
 * Extract metadata from document text
 */
function extractMetadata(fullText: string): DocumentMetadata {
  const metadata: DocumentMetadata = {};

  // Extract permit number (common formats: PERMIT #, Permit No., etc.)
  const permitMatch = fullText.match(/permit\s+(?:no\.|#)?\s*([A-Z0-9\-]+)/i);
  if (permitMatch) {
    metadata.permitNumber = permitMatch[1];
  }

  // Extract review date (common formats: MM/DD/YYYY, YYYY-MM-DD, Month DD, YYYY)
  const dateMatch = fullText.match(
    /(?:date|reviewed|reviewed on):\s*([A-Za-z]+ \d{1,2},? \d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i,
  );
  if (dateMatch) {
    metadata.reviewDate = dateMatch[1];
  }

  // Extract reviewer name (common formats: "Reviewed by:", "Reviewer:", etc.)
  const reviewerMatch = fullText.match(
    /(?:reviewed by|reviewer|reviewed by:)\s*([A-Za-z\s]+?)(?:\n|$|,)/i,
  );
  if (reviewerMatch) {
    metadata.reviewerName = reviewerMatch[1].trim();
  }

  // Extract jurisdiction (common formats: "City of...", "County of...", etc.)
  const jurisdictionMatch = fullText.match(
    /(?:jurisdiction|city|county|municipality):\s*([A-Za-z\s]+?)(?:\n|$|,)/i,
  );
  if (jurisdictionMatch) {
    metadata.jurisdiction = jurisdictionMatch[1].trim();
  }

  return metadata;
}

let documentAIClient: DocumentProcessorServiceClient | null = null;

/**
 * Get or create the Document AI client
 */
function getDocumentAIClient(): DocumentProcessorServiceClient {
  if (!documentAIClient) {
    const credentials = getGCPCredentials();
    documentAIClient = new DocumentProcessorServiceClient({
      ...(credentials && { credentials }),
      // If no credentials object, the client will auto-detect GOOGLE_APPLICATION_CREDENTIALS
    });
  }
  return documentAIClient;
}

/**
 * Parse a permit document using Document AI
 * @param fileBuffer File contents as Buffer
 * @param mimeType MIME type of the file (e.g., 'application/pdf', 'image/jpeg')
 * @returns Parsed permit document with extracted comments
 */
export async function parsePermitDocument(
  fileBuffer: Buffer,
  mimeType: string,
): Promise<ParsedPermitDocument> {
  const projectId = getGCPProjectId();
  if (!projectId) {
    throw new Error('GCP_PROJECT_ID environment variable is required');
  }

  const { processorId, location } = getDocumentAIConfig();
  const client = getDocumentAIClient();

  // Construct the request
  const name = client.processorPath(projectId, location, processorId);

  const request: protos.google.cloud.documentai.v1.IProcessRequest = {
    name,
    rawDocument: {
      content: fileBuffer,
      mimeType,
    },
  };

  try {
    // Process the document
    const [response] = await client.processDocument(request);

    if (!response.document) {
      throw new Error('No document returned from Document AI');
    }

    const document = response.document;

    // Extract full text
    const fullText = document.text || '';

    // Count pages
    const pages = document.pages?.length || 1;

    // Extract comments from the document text
    const comments = extractComments(fullText, pages);

    // Extract metadata from the document
    const metadata = extractMetadata(fullText);

    return {
      fullText,
      pages,
      comments,
      metadata,
    };
  } catch (error) {
    console.error('Document AI processing error:', error);
    throw new Error(
      `Failed to parse permit document: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
