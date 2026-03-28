import { CommentCategory } from './types';

/**
 * Email parsing utilities for EntitleFlow
 */

/**
 * Parse email address from "Name <email@domain.com>" format
 * Handles various formats:
 * - "John Doe <john@example.com>"
 * - "john@example.com"
 * - "<john@example.com>"
 */
export function parseEmailAddress(raw: string): { name: string; email: string } {
  const angleRegex = /^(.+?)\s*<(.+?)>$/;
  const match = raw.match(angleRegex);

  if (match) {
    return {
      name: match[1].trim(),
      email: match[2].trim().toLowerCase()
    };
  }

  // If no angle brackets, assume it's just an email
  const email = raw.trim().toLowerCase();
  
  // Extract name from email if possible (before @)
  const parts = email.split('@');
  const nameFromEmail = parts[0]
    .replace(/[._-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    name: nameFromEmail || 'Unknown',
    email: email
  };
}

/**
 * Extract permit number from text using PRM-YYYY-NNNN pattern
 * Examples:
 * - "PRM-2026-0001"
 * - "PRM-2025-1234"
 */
export function extractPermitNumber(text: string): string | null {
  const permitRegex = /\bPRM-\d{4}-\d{4}\b/;
  const match = text.match(permitRegex);
  return match ? match[0] : null;
}

/**
 * Classify email comment into a category based on keywords
 * Uses subject and body text for keyword matching
 */
export function classifyEmailCategory(subject: string, body: string): CommentCategory {
  const combinedText = `${subject} ${body}`.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    stormwater: ['stormwater', 'storm water', 'runoff', 'drainage', 'erosion control', 'sediment'],
    zoning: ['zoning', 'setback', 'lot coverage', 'use variance', 'conditional use', 'nonconforming'],
    building_code: ['building code', 'construction', 'structural', 'foundation', 'framing', 'mechanical'],
    fire_safety: ['fire', 'egress', 'exit', 'sprinkler', 'alarm', 'life safety'],
    environmental: ['environmental', 'environmental review', 'nepa', 'ceqa', 'mitigation', 'habitat'],
    traffic: ['traffic', 'transportation', 'trip generation', 'parking', 'circulation', 'access'],
    utilities: ['utility', 'utilities', 'water', 'sewer', 'electric', 'gas', 'service'],
    historical_preservation: ['historic', 'historic preservation', 'historic district', 'landmark'],
    accessibility: ['ada', 'accessibility', 'accessible', 'handicap', 'ada compliance'],
    drainage: ['drainage', 'drainage plan', 'storm drain', 'pipe', 'ditch']
  };

  // Calculate category scores
  const scores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    scores[category] = 0;
    for (const keyword of keywords) {
      if (combinedText.includes(keyword)) {
        scores[category]++;
      }
    }
  }

  // Find category with highest score
  const topCategory = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)[0];

  return (topCategory ? topCategory[0] : 'general') as CommentCategory;
}

/**
 * Strip HTML tags and decode entities from HTML content
 * Converts to plain text for storage
 */
export function stripHtmlTags(html: string): string {
  // Remove script and style tags completely
  let text = html.replace(/<script[^>]*>.*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>.*?<\/style>/gi, '');

  // Remove HTML comments
  text = text.replace(/<!--.*?-->/gi, '');

  // Convert line breaks and paragraphs
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n');
  text = text.replace(/<\/div>/gi, '\n');

  // Remove all other HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = decodeHtmlEntities(text);

  // Clean up extra whitespace
  text = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');

  return text;
}

/**
 * Decode HTML entities like &nbsp; &amp; &lt; etc
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™'
  };

  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }

  // Handle numeric entities
  decoded = decoded.replace(/&#(\d+);/g, (_match, code) => {
    return String.fromCharCode(parseInt(code, 10));
  });

  decoded = decoded.replace(/&#x([a-fA-F0-9]+);/g, (_match, code) => {
    return String.fromCharCode(parseInt(code, 16));
  });

  return decoded;
}

/**
 * Extract email signature from body text
 * Common patterns: "Best regards", "Thanks", "--", etc.
 */
export function extractEmailSignature(body: string): { body: string; signature: string } {
  const signaturePatterns = [
    /^-{2,}\s*$/m,  // -- separator
    /^thanks[,:]?\s*$/im,
    /^best\s+regards[,:]?\s*$/im,
    /^kind\s+regards[,:]?\s*$/im,
    /^yours[,:]?\s*$/im,
    /^cheers[,:]?\s*$/im
  ];

  for (const pattern of signaturePatterns) {
    const index = body.search(pattern);
    if (index !== -1) {
      return {
        body: body.substring(0, index).trim(),
        signature: body.substring(index).trim()
      };
    }
  }

  return { body, signature: '' };
}

/**
 * Validate and normalize email address
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Check if email looks like an automated/system message
 */
export function isSystemEmail(fromEmail: string, subject: string): boolean {
  const systemPatterns = [
    /'no-reply'|'noreply'|'no_reply'/i,
    /'mailer-daemon'/i,
    /'postmaster'/i,
    /'delivery-failed'/i,
    /'auto-reply'/i,
    /'out of office'/i
  ];

  const combined = `${fromEmail} ${subject}`.toLowerCase();
  return systemPatterns.some(pattern => combined.match(pattern));
}
