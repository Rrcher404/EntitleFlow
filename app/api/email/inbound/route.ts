import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { parseEmailAddress, extractPermitNumber, classifyEmailCategory, stripHtmlTags } from '@/lib/email/parser';
import { InboundEmailPayload, ParsedEmail } from '@/lib/email/types';

/**
 * POST /api/email/inbound
 *
 * Webhook endpoint for receiving inbound emails.
 * Accepts emails from:
 *   - Google Apps Script (forwards from reviews@entitleflow.com)
 *   - Any future email forwarding service
 *
 * Authentication: requires INBOUND_EMAIL_SECRET header or query param.
 * Creates comment records and activity logs for tracking.
 */
export async function POST(request: NextRequest) {
  try {
    // ── Auth: verify webhook secret ──────────────────────────
    const secret = process.env.INBOUND_EMAIL_SECRET;
    if (secret) {
      const headerToken = request.headers.get('x-webhook-secret');
      const queryToken = request.nextUrl.searchParams.get('secret');
      if (headerToken !== secret && queryToken !== secret) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Parse incoming JSON payload (supports both raw and Apps Script format)
    const raw = await request.json();

    // Normalise: Apps Script sends { from, to, subject, body, htmlBody, messageId, date }
    const payload: InboundEmailPayload = {
      from: raw.from,
      to: raw.to,
      subject: raw.subject,
      text: raw.text ?? raw.body ?? (raw.htmlBody ? stripHtmlTags(raw.htmlBody) : ''),
      html: raw.html ?? raw.htmlBody,
      attachments: raw.attachments ?? [],
      date: raw.date,
      message_id: raw.message_id ?? raw.messageId,
    };

    // Validate required fields
    if (!payload.from || !payload.to || !payload.subject || !payload.text) {
      return NextResponse.json(
        { error: 'Missing required email fields: from, to, subject, text' },
        { status: 400 }
      );
    }

    // Parse email address
    const { name: fromName, email: fromEmail } = parseEmailAddress(payload.from);

    // Extract permit number from subject
    const permitNumber = extractPermitNumber(payload.subject);

    // Classify email category
    const category = classifyEmailCategory(payload.subject, payload.text);

    // Prepare parsed email object
    const parsedEmail: ParsedEmail = {
      from_name: fromName,
      from_email: fromEmail,
      subject: payload.subject,
      body: payload.text,
      permit_number: permitNumber,
      category: category,
      attachments: payload.attachments || [],
      message_id: payload.message_id
    };

    // Initialize Supabase admin client (service role, no cookies)
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      console.error('Supabase admin client not configured — missing SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Check for deduplication using message_id if provided
    if (payload.message_id) {
      const { data: existingRows } = await (supabase
        .from('comments')
        .select('id')
        .filter('metadata->>message_id', 'eq', payload.message_id)
        .limit(1) as unknown as Promise<{ data: { id: string }[] | null }>);

      if (existingRows && existingRows.length > 0) {
        return NextResponse.json(
          { message: 'Email already processed', comment_id: existingRows[0].id },
          { status: 200 }
        );
      }
    }

    // Determine organization_id and permit_id
    let organizationId: string | null = null;
    let permitId: string | null = null;

    // Strategy 1: Match by permit number in subject
    if (permitNumber) {
      const { data: permit } = await supabase
        .from('permits')
        .select('id, organization_id')
        .eq('permit_number', permitNumber)
        .limit(1)
        .single();

      if (permit) {
        organizationId = permit.organization_id;
        permitId = permit.id;
      }
    }

    // Strategy 2: Match by sender email (reviewer_email field)
    if (!permitId && fromEmail) {
      const { data: permit } = await supabase
        .from('permits')
        .select('id, organization_id')
        .eq('reviewer_email', fromEmail)
        .limit(1)
        .single();

      if (permit) {
        organizationId = permit.organization_id;
        permitId = permit.id;
      }
    }

    // If no organization found, try to find from domain of to address
    if (!organizationId) {
      const domain = payload.to.split('@')[1];
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('email_domain', domain)
        .limit(1)
        .single();

      if (org) {
        organizationId = org.id;
      }
    }

    // Prepare metadata
    const metadata: Record<string, any> = {
      message_id: payload.message_id,
      date: payload.date,
      original_to: payload.to,
      has_attachments: (payload.attachments?.length || 0) > 0
    };

    if (payload.attachments && payload.attachments.length > 0) {
      metadata.attachments = payload.attachments.map(att => ({
        filename: att.filename,
        content_type: att.content_type,
        size: att.size,
        url: att.url
      }));
    }

    // Determine comment source
    const source = permitId ? 'jurisdiction' : 'imported';

    // Create comment record
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        permit_id: permitId,
        organization_id: organizationId,
        author_name: fromName,
        author_email: fromEmail,
        body: parsedEmail.body,
        source: source,
        category: category,
        is_resolved: false,
        metadata: metadata
      })
      .select('id')
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      return NextResponse.json(
        { error: 'Failed to create comment record' },
        { status: 500 }
      );
    }

    // Log activity
    if (organizationId) {
      await supabase
        .from('activity_log')
        .insert({
          organization_id: organizationId,
          project_id: null,
          permit_id: permitId,
          action: 'comment_added',
          description: `Email comment from ${fromEmail}: "${payload.subject}"`,
          metadata: {
            comment_id: comment.id,
            source: source,
            category: category,
            message_id: payload.message_id
          }
        });
    }

    // Handle attachments if present
    if (payload.attachments && payload.attachments.length > 0 && permitId && organizationId) {
      const attachmentRecords = payload.attachments.map(att => ({
        organization_id: organizationId,
        permit_id: permitId,
        name: att.filename,
        file_path: att.url || `email/${comment.id}/${att.filename}`,
        file_size: att.size,
        mime_type: att.content_type,
        document_type: 'email_attachment',
        uploaded_by: fromEmail,
        metadata: {
          email_message_id: payload.message_id,
          comment_id: comment.id
        }
      }));

      await supabase
        .from('documents')
        .insert(attachmentRecords);
    }

    return NextResponse.json(
      {
        success: true,
        comment_id: comment.id,
        permit_id: permitId,
        organization_id: organizationId,
        source: source,
        message: `Email processed successfully as ${source} comment`
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Inbound email error:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error processing email' },
      { status: 500 }
    );
  }
}
