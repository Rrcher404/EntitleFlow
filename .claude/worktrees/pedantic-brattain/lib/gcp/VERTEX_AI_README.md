# Vertex AI Integration for EntitleFlow

This document describes the Vertex AI/Gemini 2.0 Flash integration for EntitleFlow, which provides AI-powered comment categorization and review letter summarization capabilities.

## Overview

The Vertex AI integration uses Google Cloud's Gemini 2.0 Flash model to power three core AI features:

1. **Comment Classification** — Automatically categorize permit review comments into domain-specific categories
2. **Review Letter Summarization** — Extract key information from permit review letters
3. **Response Suggestions** — Generate professional responses to review comments

## Features

### 1. Comment Classification (`classifyComment`)

**Purpose:** Classify a single permit review comment into one of 10 predefined categories.

**Categories:**
- `parking_access` — Parking, accessibility, loading areas
- `stormwater` — Stormwater management, drainage, detention ponds
- `building_code` — Building standards, structural requirements, energy code
- `zoning` — Zoning compliance, setbacks, lot coverage, use restrictions
- `fire_safety` — Fire ratings, egress, emergency access, sprinklers
- `landscaping` — Landscaping, tree preservation, buffers
- `traffic` — Traffic impact, turning movements, sight distance
- `environmental` — Wetlands, environmental assessment, natural resources
- `general` — Administrative comments, document completeness
- `other` — Comments that don't fit other categories

**Usage:**
```typescript
const result = await classifyComment("This parking lot needs accessible spaces.");
// Returns:
// {
//   category: 'parking_access',
//   confidence: 0.95,
//   reasoning: 'Comment explicitly addresses parking accessibility requirements...'
// }
```

**Key Features:**
- Confidence scores (0.0-1.0) for classification reliability
- Detailed reasoning for the classification decision
- Domain-specific prompting for NC permit review context
- Automatic retry with exponential backoff for transient errors

### 2. Review Letter Summarization (`summarizeReviewLetter`)

**Purpose:** Extract structured information from a full permit review letter.

**Returns:**
```typescript
interface ReviewSummary {
  summary: string;              // 2-3 sentence overview
  totalItems: number;           // Count of all review items
  criticalItems: string[];      // Items that block approval
  actionItems: Array<{
    item: string;
    category: CommentCategory;
  }>;
  categories: Record<CommentCategory, number>; // Count per category
}
```

**Usage:**
```typescript
const summary = await summarizeReviewLetter(fullReviewLetterText);
// Returns structured data with:
// - Executive summary
// - Count of issues by category
// - Critical blockers
// - Specific action items with categories
```

**Key Features:**
- Extracts critical blockers that prevent approval
- Identifies specific action items for applicant response
- Categorizes issues by type for organization
- Counts items in each category for metrics

### 3. Response Suggestions (`suggestResponse`)

**Purpose:** Generate professional, domain-specific responses to review comments.

**Usage:**
```typescript
const response = await suggestResponse(
  "The stormwater management plan needs to address the northern detention pond overflow.",
  "stormwater"
);
// Returns: "We have revised the stormwater plan to include a secondary outlet for the northern detention pond, 
// sized to accommodate the 10-year storm event per NC Stormwater Design Manual requirements..."
```

**Key Features:**
- Professional and courteous tone
- NC land entitlement context
- Specific, technical responses
- Concrete solutions or clarifications

## API Endpoints

All endpoints require authentication (Supabase user session).

### POST /api/ai/classify
Classify a single comment.

**Request:**
```json
{
  "text": "Comment text here (1-5000 chars)"
}
```

**Response:**
```json
{
  "category": "parking_access",
  "confidence": 0.95,
  "reasoning": "..."
}
```

**Status Codes:**
- 200 — Success
- 400 — Invalid request
- 401 — Unauthorized (no session)
- 500 — Server error

### POST /api/ai/summarize
Summarize a review letter.

**Request:**
```json
{
  "text": "Full review letter text (1-50KB)"
}
```

**Response:**
```json
{
  "summary": "The review identifies 12 items requiring attention...",
  "totalItems": 12,
  "criticalItems": ["Parking requirement not met", "..."],
  "actionItems": [
    {
      "item": "Add 5 additional accessible parking spaces",
      "category": "parking_access"
    }
  ],
  "categories": {
    "parking_access": 3,
    "stormwater": 2,
    ...
  }
}
```

### POST /api/ai/suggest-response
Generate a response suggestion.

**Request:**
```json
{
  "commentText": "Review comment (1-5000 chars)",
  "category": "stormwater"
}
```

**Response:**
```json
{
  "response": "We have revised the stormwater plan..."
}
```

## Environment Configuration

Add these variables to your `.env.local`:

```bash
# GCP Configuration (required)
GCP_PROJECT_ID=gravityclaw-488910

# Vertex AI Location (optional, defaults to us-central1)
VERTEX_AI_LOCATION=us-central1

# GCP Service Account Credentials (required for GCP services)
# Option 1: Point to a key file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Option 2: Inline JSON (recommended for Vercel)
GCP_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### Local Development

For local development, set up GCP authentication:

```bash
# Download your service account key from Google Cloud Console
# Place it in your project directory
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Or set inline (less secure, for testing only)
export GCP_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

### Vercel Deployment

1. Go to Vercel project settings > Environment Variables
2. Add `GCP_PROJECT_ID` (typically `gravityclaw-488910`)
3. Add `GCP_SERVICE_ACCOUNT_KEY` as the full JSON string from your service account
4. Redeploy

## Implementation Details

### Architecture

**File Structure:**
```
lib/gcp/
├── vertex-ai.ts          # Core Vertex AI functions
├── config.ts             # GCP configuration helpers
├── storage.ts            # GCS integration
└── document-ai.ts        # Document AI integration

app/api/ai/
├── classify/route.ts     # Comment classification endpoint
├── summarize/route.ts    # Review letter summarization endpoint
└── suggest-response/route.ts  # Response suggestion endpoint
```

### Error Handling

All functions include automatic retry logic for transient errors:

- **Transient errors** (429, 503, 500, timeout, DEADLINE_EXCEEDED) are retried with exponential backoff
- **Permanent errors** (400, 404, etc.) are returned immediately
- **Max retries:** 3 attempts with delays: 1s, 2s, 4s

### Authentication

All API endpoints:
1. Verify Supabase user session
2. Return 401 if user is not authenticated
3. Process request with authenticated user context

### Rate Limiting

Vertex AI applies rate limits based on your GCP project tier:
- Free tier: ~60 requests per minute
- Standard tier: Much higher limits

The built-in retry logic helps handle temporary rate limiting.

## Type Safety

All functions are fully typed with TypeScript:

```typescript
type CommentCategory =
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

interface ClassificationResult {
  category: CommentCategory;
  confidence: number;
  reasoning: string;
}

interface ReviewSummary {
  summary: string;
  totalItems: number;
  criticalItems: string[];
  actionItems: Array<{ item: string; category: CommentCategory }>;
  categories: Record<CommentCategory, number>;
}
```

## Testing

### Unit Tests

Test the core functions directly:

```typescript
import { classifyComment, summarizeReviewLetter } from '@/lib/gcp/vertex-ai';

// Test classification
const classification = await classifyComment("Comment text...");
assert(classification.category === 'parking_access');
assert(classification.confidence > 0.8);

// Test summarization
const summary = await summarizeReviewLetter("Review letter...");
assert(summary.totalItems > 0);
assert(summary.categories.parking_access >= 0);
```

### Integration Tests

Test the API endpoints:

```bash
# Set up authentication (get auth token from Supabase)
curl -X POST http://localhost:3000/api/ai/classify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"text":"Comment about parking access requirements..."}'

# Response:
# {
#   "category": "parking_access",
#   "confidence": 0.95,
#   "reasoning": "..."
# }
```

## Performance Characteristics

**Vertex AI Gemini 2.0 Flash Model:**
- **Latency:** ~500ms-2s per request (including network)
- **Cost:** ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens
- **Model:** Gemini 2.0 Flash (fast, cost-effective)

**Typical Costs:**
- Comment classification: ~0.001 cents per request (200-500 tokens)
- Review letter summarization: ~0.01 cents per request (2000-5000 tokens)
- Response suggestion: ~0.005 cents per request (1000-2000 tokens)

## Troubleshooting

### "Unauthorized" Error

**Cause:** No valid GCP credentials found.

**Solution:**
1. Verify `GCP_PROJECT_ID` is set
2. Verify `GOOGLE_APPLICATION_CREDENTIALS` or `GCP_SERVICE_ACCOUNT_KEY` is set
3. Verify the service account has Vertex AI permissions

### "Invalid category returned"

**Cause:** Gemini returned a category not in the valid list.

**Solution:**
1. Check the prompt in `lib/gcp/vertex-ai.ts`
2. Try re-running the request (may be transient)
3. Check Vertex AI model status in Google Cloud Console

### "Max retries exceeded"

**Cause:** Transient errors persisted through all retry attempts.

**Solution:**
1. Check GCP project quota limits
2. Check internet connection
3. Try again after a delay

## Security Considerations

1. **Authentication:** All endpoints require Supabase user session
2. **Input Validation:** All inputs validated with Zod schemas
3. **Rate Limiting:** Implement additional rate limiting if needed at your load
4. **Credentials:** Never expose `GCP_SERVICE_ACCOUNT_KEY` in client code
5. **PII:** Be cautious with sensitive data in comments/letters

## Future Enhancements

1. **Batch Processing** — Process multiple comments in one request
2. **Fine-tuning** — Fine-tune Gemini on EntitleFlow-specific examples
3. **Caching** — Cache frequent classification results
4. **Webhooks** — Async processing for large review letters
5. **Custom Categories** — Allow organizations to define custom categories

## Support

For issues or questions:
1. Check this README and the troubleshooting section
2. Review Vertex AI logs in Google Cloud Console
3. Check EntitleFlow application logs
4. Contact GCP support for infrastructure issues
