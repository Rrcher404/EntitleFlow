import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { parseEmailAddress, extractPermitNumber, classifyEmailCategory } from '@/lib/email/parser';
import { InboundEmailPayload, ParsedEmail } from '@/lib/email/types';

/**
 * POST /api/email/inbound
 * 
 * Webhook endpoint for receiving inbound emails.
 * Accepts emails from jurisdiction reviewers and other external sources.
 * 
 * Creates comment records and activity logs for tracking.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse incoming JSON payload
    const payload: InboundEmailPayload = await request.json();

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

    // Initialize Supabase client
    const supabase = await createServiceClient();

    // Check for deduplication using message_id if provided
    if (payload.message_id) {
      const { data: existingComment } = await supabase
        .from('comments')
        .select('id')
        .eq('metadata->message_id', payload.message_id)
        .limit(1)
        .single();

      if (existingComment) {
        return NextResponse.json(
          { message: 'Email already processed', comment_id: existingComment.id },
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
