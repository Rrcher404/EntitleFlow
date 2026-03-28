# Vertex AI Integration - Usage Examples

This document provides practical examples for using the Vertex AI integration in EntitleFlow.

## Backend Usage (Node.js/TypeScript)

### Example 1: Classify a Comment

```typescript
import { classifyComment } from '@/lib/gcp/vertex-ai';

async function processComment(commentText: string) {
  try {
    const result = await classifyComment(commentText);
    
    console.log(`Category: ${result.category}`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`Reasoning: ${result.reasoning}`);
    
    // Store in database
    await db.comments.update({
      id: commentId,
      category: result.category,
      confidence: result.confidence
    });
  } catch (error) {
    console.error('Classification failed:', error);
  }
}

// Usage
await processComment("The site plan does not show the required stormwater detention pond.");
// Output:
// Category: stormwater
// Confidence: 92.5%
// Reasoning: The comment specifically mentions stormwater detention pond requirements...
```

### Example 2: Summarize a Review Letter

```typescript
import { summarizeReviewLetter } from '@/lib/gcp/vertex-ai';
import fs from 'fs';

async function processReviewLetter(filePath: string) {
  try {
    // Read the review letter
    const letterText = fs.readFileSync(filePath, 'utf-8');
    
    // Summarize
    const summary = await summarizeReviewLetter(letterText);
    
    console.log(`Summary: ${summary.summary}`);
    console.log(`Total Items: ${summary.totalItems}`);
    console.log(`Critical Items: ${summary.criticalItems.length}`);
    
    // List critical items
    summary.criticalItems.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item}`);
    });
    
    // Show category breakdown
    console.log('\nCategory Breakdown:');
    Object.entries(summary.categories).forEach(([category, count]) => {
      if (count > 0) {
        console.log(`  ${category}: ${count}`);
      }
    });
    
    // Show action items
    console.log('\nAction Items:');
    summary.actionItems.forEach((action, i) => {
      console.log(`  ${i + 1}. [${action.category}] ${action.item}`);
    });
    
    return summary;
  } catch (error) {
    console.error('Summarization failed:', error);
  }
}

// Usage
const result = await processReviewLetter('./review-letter.txt');
```

### Example 3: Generate Response Suggestions

```typescript
import { suggestResponse } from '@/lib/gcp/vertex-ai';

async function generateResponse(commentText: string, category: string) {
  try {
    const suggestion = await suggestResponse(commentText, category);
    
    console.log('Suggested Response:');
    console.log(suggestion);
    
    return suggestion;
  } catch (error) {
    console.error('Response generation failed:', error);
  }
}

// Usage
const response = await generateResponse(
  "The traffic study does not address peak hour conditions on Elm Street.",
  "traffic"
);
// Output:
// We have updated the traffic study to include peak hour (7-9 AM and 4-6 PM) 
// analysis for Elm Street, showing that project traffic represents less than 3% 
// of the existing peak hour volume per NCDOT standards...
```

## Frontend/API Usage (fetch)

### Example 1: Classify via API

```typescript
// hooks/useClassifyComment.ts
import { useState } from 'react';

export function useClassifyComment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function classify(text: string) {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Classification failed');
      }
      
      const result = await response.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }
  
  return { classify, loading, error };
}

// Usage in component
function CommentClassifier() {
  const { classify, loading } = useClassifyComment();
  
  async function handleClassify(comment: string) {
    const result = await classify(comment);
    console.log(`Category: ${result.category}`);
    console.log(`Confidence: ${result.confidence}`);
  }
  
  return (
    <button onClick={() => handleClassify('Comment text...')} disabled={loading}>
      {loading ? 'Classifying...' : 'Classify'}
    </button>
  );
}
```

### Example 2: Summarize via API

```typescript
// hooks/useSummarizeReview.ts
export function useSummarizeReview() {
  const [loading, setLoading] = useState(false);

  async function summarize(letterText: string) {
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: letterText })
      });
      
      if (!response.ok) throw new Error('Summarization failed');
      
      const summary = await response.json();
      return summary;
    } finally {
      setLoading(false);
    }
  }
  
  return { summarize, loading };
}

// Usage in component
function ReviewSummarizer({ letterText }: { letterText: string }) {
  const { summarize, loading } = useSummarizeReview();
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  
  async function handleSummarize() {
    const result = await summarize(letterText);
    setSummary(result);
  }
  
  if (!summary) {
    return <button onClick={handleSummarize} disabled={loading}>
      {loading ? 'Summarizing...' : 'Summarize Review'}
    </button>;
  }
  
  return (
    <div className="space-y-4">
      <p className="font-semibold">{summary.summary}</p>
      
      <div>
        <h3 className="font-semibold">Critical Items ({summary.criticalItems.length})</h3>
        <ul className="list-disc pl-5">
          {summary.criticalItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h3 className="font-semibold">Action Items ({summary.actionItems.length})</h3>
        <ul className="list-disc pl-5">
          {summary.actionItems.map((action, i) => (
            <li key={i}>
              <span className="font-mono text-sm text-gray-600">[{action.category}]</span>
              {' '}{action.item}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(summary.categories).map(([cat, count]) => (
          count > 0 && (
            <div key={cat} className="text-center p-2 bg-gray-100 rounded">
              <div className="text-lg font-bold">{count}</div>
              <div className="text-xs text-gray-600">{cat.replace(/_/g, ' ')}</div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
```

### Example 3: Get Response Suggestion via API

```typescript
// hooks/useSuggestResponse.ts
export function useSuggestResponse() {
  const [loading, setLoading] = useState(false);

  async function suggest(commentText: string, category: string) {
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai/suggest-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentText, category })
      });
      
      if (!response.ok) throw new Error('Suggestion failed');
      
      const data = await response.json();
      return data.response;
    } finally {
      setLoading(false);
    }
  }
  
  return { suggest, loading };
}

// Usage in component
function ResponseDrafter({ comment, category }: { comment: string; category: string }) {
  const { suggest, loading } = useSuggestResponse();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [editable, setEditable] = useState(false);
  
  async function handleSuggest() {
    const text = await suggest(comment, category);
    setSuggestion(text);
  }
  
  return (
    <div className="space-y-3">
      <button 
        onClick={handleSuggest} 
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Generating...' : 'Get Suggestion'}
      </button>
      
      {suggestion && (
        <div>
          {!editable ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p>{suggestion}</p>
              <button 
                onClick={() => setEditable(true)}
                className="mt-3 text-sm text-blue-600 hover:underline"
              >
                Edit
              </button>
            </div>
          ) : (
            <textarea 
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="w-full p-3 border rounded"
              rows={5}
            />
          )}
        </div>
      )}
    </div>
  );
}
```

## Database Integration

### Example: Store Classifications

```typescript
// Save classification result to database
async function storeClassification(
  commentId: string,
  organizationId: string,
  classificationResult: ClassificationResult
) {
  const { data, error } = await supabase
    .from('comments')
    .update({
      category: classificationResult.category,
      metadata: {
        ai_classification: {
          confidence: classificationResult.confidence,
          reasoning: classificationResult.reasoning,
          classified_at: new Date().toISOString()
        }
      }
    })
    .eq('id', commentId)
    .eq('organization_id', organizationId);
  
  if (error) throw error;
  return data;
}
```

## Error Handling Patterns

### Pattern 1: Graceful Degradation

```typescript
async function classifyWithFallback(commentText: string): Promise<string> {
  try {
    const result = await classifyComment(commentText);
    return result.category;
  } catch (error) {
    console.error('AI classification failed, using fallback:', error);
    
    // Use keyword-based classification as fallback
    if (commentText.toLowerCase().includes('parking')) return 'parking_access';
    if (commentText.toLowerCase().includes('stormwater')) return 'stormwater';
    
    // Default to 'general' if no keywords match
    return 'general';
  }
}
```

### Pattern 2: Retry with Timeout

```typescript
async function classifyWithTimeout(
  commentText: string,
  timeoutMs: number = 10000
): Promise<ClassificationResult> {
  const timeoutPromise = new Promise<ClassificationResult>((_, reject) =>
    setTimeout(() => reject(new Error('Classification timeout')), timeoutMs)
  );
  
  return Promise.race([
    classifyComment(commentText),
    timeoutPromise
  ]);
}
```

## Batch Processing

```typescript
// Process multiple comments in parallel
async function classifyComments(commentTexts: string[]): Promise<ClassificationResult[]> {
  const promises = commentTexts.map(text => 
    classifyComment(text).catch(error => {
      console.error(`Failed to classify: ${error.message}`);
      return {
        category: 'other' as const,
        confidence: 0,
        reasoning: 'Classification failed'
      };
    })
  );
  
  return Promise.all(promises);
}

// Usage
const comments = ["Comment 1", "Comment 2", "Comment 3"];
const results = await classifyComments(comments);
// All comments processed in parallel, even if one fails
```

## Performance Tips

1. **Cache Results** — Store classifications in cache to avoid re-processing
2. **Batch Requests** — Process multiple comments together
3. **Use Confidence Scores** — Skip manual review for high-confidence results
4. **Timeout Handling** — Set reasonable timeouts for API calls
5. **Error Recovery** — Implement fallback strategies for failures

## Cost Estimation

Assuming typical usage:
- Comment classification: ~200-400 tokens = ~$0.00003-0.00006 per request
- Review summarization: ~2000-4000 tokens = ~$0.0003-0.0006 per request
- Response suggestion: ~1000-2000 tokens = ~$0.00015-0.0003 per request

Monthly estimate (1000 requests each):
- Classifications: ~$0.05
- Summarizations: ~$0.50
- Responses: ~$0.25
- **Total: ~$0.80/month** (very cost-effective)
