import { VertexAI } from '@google-cloud/vertexai';

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

interface ActionItem {
  item: string;
  category: CommentCategory;
}

interface ReviewSummary {
  summary: string;
  totalItems: number;
  criticalItems: string[];
  actionItems: ActionItem[];
  categories: Record<CommentCategory, number>;
}

// Maximum number of retries for transient errors
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Initialize Vertex AI client
function getVertexAIClient(): VertexAI {
  const projectId = process.env.GCP_PROJECT_ID || 'gravityclaw-488910';
  const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

  return new VertexAI({
    project: projectId,
    location,
  });
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with exponential backoff retry logic
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if the error is transient (rate limiting or temporary service error)
      const isTransient =
        lastError.message.includes('429') ||
        lastError.message.includes('503') ||
        lastError.message.includes('500') ||
        lastError.message.includes('timeout') ||
        lastError.message.includes('DEADLINE_EXCEEDED');

      if (!isTransient || attempt === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt);
      await sleep(delayMs);
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Classify a permit review comment into one of the predefined categories.
 * Uses Vertex AI Gemini 2.0 Flash model for fast, cost-effective inference.
 */
export async function classifyComment(commentText: string): Promise<ClassificationResult> {
  if (!commentText || commentText.trim().length === 0) {
    throw new Error('Comment text cannot be empty');
  }

  return withRetry(async () => {
    const vertexAI = getVertexAIClient();
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    const prompt = `You are an expert in North Carolina land entitlement and permit review processes. Your task is to classify the following comment from a permit review into one of these categories:

- parking_access: Comments about parking spaces, accessibility parking, loading areas
- stormwater: Comments about stormwater management, drainage, detention ponds, water quality
- building_code: Comments about building construction standards, structural requirements, energy code
- zoning: Comments about zoning compliance, setbacks, lot coverage, use restrictions
- fire_safety: Comments about fire ratings, egress, emergency access, sprinkler systems
- landscaping: Comments about landscaping, tree preservation, landscape buffer requirements
- traffic: Comments about traffic impact, turning movements, sight distance, internal circulation
- environmental: Comments about wetlands, environmental assessment, natural resources, mitigation
- general: General administrative comments, document completeness
- other: Comments that don't fit any category

PERMIT REVIEW COMMENT:
"${commentText}"

Respond with ONLY a valid JSON object (no markdown, no code blocks) with these exact fields:
{
  "category": "[one of the categories above]",
  "confidence": [0.0 to 1.0],
  "reasoning": "[1-2 sentence explanation of why you chose this category]"
}`;

    const response = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const responseText =
      response.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!responseText) {
      throw new Error('No response from Vertex AI');
    }

    // Parse the JSON response
    let parsed: Partial<ClassificationResult>;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      throw new Error(`Failed to parse Vertex AI response as JSON: ${responseText}`);
    }

    // Validate the response
    if (
      !parsed.category ||
      typeof parsed.confidence !== 'number' ||
      !parsed.reasoning
    ) {
      throw new Error(
        `Invalid response structure from Vertex AI: ${JSON.stringify(parsed)}`,
      );
    }

    // Ensure category is a valid CommentCategory
    const validCategories: CommentCategory[] = [
      'parking_access',
      'stormwater',
      'building_code',
      'zoning',
      'fire_safety',
      'landscaping',
      'traffic',
      'environmental',
      'general',
      'other',
    ];

    if (!validCategories.includes(parsed.category as CommentCategory)) {
      throw new Error(`Invalid category returned: ${parsed.category}`);
    }

    return {
      category: parsed.category as CommentCategory,
      confidence: Math.min(1, Math.max(0, parsed.confidence)),
      reasoning: parsed.reasoning,
    };
  });
}

/**
 * Summarize a permit review letter into key sections and action items.
 * Provides a high-level overview and identifies critical blockers.
 */
export async function summarizeReviewLetter(fullText: string): Promise<ReviewSummary> {
  if (!fullText || fullText.trim().length === 0) {
    throw new Error('Review letter text cannot be empty');
  }

  return withRetry(async () => {
    const vertexAI = getVertexAIClient();
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    const prompt = `You are an expert in North Carolina permit review processes. Analyze the following permit review letter and extract key information.

REVIEW LETTER:
"${fullText}"

Respond with ONLY a valid JSON object (no markdown, no code blocks) with these exact fields:
{
  "summary": "[2-3 sentence overview of the review letter's overall findings]",
  "totalItems": [total number of review items/comments],
  "criticalItems": ["[list of critical blockers that must be addressed before approval - use bullet form descriptions]"],
  "actionItems": [
    {
      "item": "[specific action required]",
      "category": "[one of: parking_access, stormwater, building_code, zoning, fire_safety, landscaping, traffic, environmental, general, other]"
    }
  ],
  "categories": {
    "parking_access": [count],
    "stormwater": [count],
    "building_code": [count],
    "zoning": [count],
    "fire_safety": [count],
    "landscaping": [count],
    "traffic": [count],
    "environmental": [count],
    "general": [count],
    "other": [count]
  }
}`;

    const response = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const responseText =
      response.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!responseText) {
      throw new Error('No response from Vertex AI');
    }

    // Parse the JSON response
    let parsed: Partial<ReviewSummary>;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      throw new Error(`Failed to parse Vertex AI response as JSON: ${responseText}`);
    }

    // Validate the response
    if (
      typeof parsed.summary !== 'string' ||
      typeof parsed.totalItems !== 'number' ||
      !Array.isArray(parsed.criticalItems) ||
      !Array.isArray(parsed.actionItems) ||
      typeof parsed.categories !== 'object'
    ) {
      throw new Error(
        `Invalid response structure from Vertex AI: ${JSON.stringify(parsed)}`,
      );
    }

    // Ensure categories object has the right structure
    const categories = (parsed.categories as Record<string, number>) || {};
    const validCategories: CommentCategory[] = [
      'parking_access',
      'stormwater',
      'building_code',
      'zoning',
      'fire_safety',
      'landscaping',
      'traffic',
      'environmental',
      'general',
      'other',
    ];

    const normalizedCategories: Record<CommentCategory, number> = {} as Record<
      CommentCategory,
      number
    >;
    for (const cat of validCategories) {
      normalizedCategories[cat] = (categories[cat] as number) || 0;
    }

    return {
      summary: parsed.summary,
      totalItems: parsed.totalItems,
      criticalItems: parsed.criticalItems as string[],
      actionItems: (parsed.actionItems as ActionItem[]) || [],
      categories: normalizedCategories,
    };
  });
}

/**
 * Generate a professional response suggestion for a given review comment.
 * Provides context-aware, permit-domain specific responses.
 */
export async function suggestResponse(
  commentText: string,
  category: string,
): Promise<string> {
  if (!commentText || commentText.trim().length === 0) {
    throw new Error('Comment text cannot be empty');
  }

  if (!category || category.trim().length === 0) {
    throw new Error('Category cannot be empty');
  }

  return withRetry(async () => {
    const vertexAI = getVertexAIClient();
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    const prompt = `You are an expert in North Carolina land entitlement and permit review responses. Generate a professional, specific, and technically accurate response to the following review comment.

COMMENT CATEGORY: ${category}

REVIEW COMMENT:
"${commentText}"

Guidelines:
- Keep the response professional and courteous
- Be specific and technical (avoid vague language)
- Focus on NC permit and entitlement context
- Provide concrete solutions or clarifications
- Keep response to 2-3 sentences maximum
- Address the specific concern raised

Respond with ONLY the response text (no JSON, no markdown formatting).`;

    const response = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const responseText =
      response.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!responseText) {
      throw new Error('No response from Vertex AI');
    }

    return responseText.trim();
  });
}
