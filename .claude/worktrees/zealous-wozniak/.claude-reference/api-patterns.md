# API Route Patterns

Last updated: 2026-03-21

## Standard Auth Pattern (every API route)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Auth check
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get profile for org context
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, role, full_name')
      .eq('id', user.id)
      .single();
    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // 3. Use admin client for writes
    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json({ error: 'Database client unavailable' }, { status: 500 });
    }

    // 4. Business logic...
    const { data, error } = await (adminClient as any)
      .from('table_name')
      .insert({ ... })
      .select()
      .single();

    // 5. Activity log (non-fatal)
    try {
      await (adminClient as any).from('activity_log').insert({ ... });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

## Dynamic Route Params (Next.js 16)

Params are a Promise — must await:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  // ...
}
```

## Existing API Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/documents/upload` | POST | Upload files to GCS + DB record |
| `/api/documents/[id]/parse` | POST | Document AI parse → comments |
| `/api/documents/[id]/download` | GET | Signed URL for download |
| `/api/documents/[id]/auto-parse` | POST | Zero-touch parse pipeline (Q2) |
| `/api/ai/summarize` | POST | Vertex AI summarize review letter |
| `/api/ai/suggest-response` | POST | AI-generated permit response |
| `/api/ai/classify` | POST | Comment category classification |
| `/api/email/inbound` | POST | Webhook for forwarded emails |
| `/api/email/send` | POST | Outbound email (stub, needs provider) |
| `/api/geocode` | GET | Server-side Google Maps geocoding |
| `/api/leads` | POST | Marketing lead capture |
| `/api/admin/*` | Various | Admin panel endpoints (require super_admin) |
| `/api/comments` | GET, POST | Comment CRUD (Q1 implementation) |
| `/api/comments/[id]` | GET, PATCH, DELETE | Single comment operations |
| `/api/comments/[id]/resolve` | POST | Mark comment resolved |
| `/api/comments/[id]/assign` | POST | Assign comment to team member |
| `/api/comments/[id]/ai-response` | POST | Get AI suggestion for comment |
| `/api/comments/bulk` | POST | Bulk resolve/assign/unresolve |

## Error Response Convention

```typescript
// 400 Bad Request — validation failures
{ error: 'Missing required fields: file, fileName, documentType' }

// 401 Unauthorized — no auth
{ error: 'Unauthorized' }

// 403 Forbidden — wrong org or insufficient role
{ error: 'Forbidden' }

// 404 Not Found — resource doesn't exist
{ error: 'User profile not found' }

// 413 Payload Too Large — file size
{ error: 'File size exceeds 100MB limit' }

// 500 Server Error — unexpected
{ error: 'Internal server error', details: 'message' }
```

## Admin Routes Pattern

```typescript
import { verifyAdmin } from '@/lib/admin/auth';

const { profile, error } = await verifyAdmin();
if (error) return NextResponse.json({ error }, { status: 401 });
```
