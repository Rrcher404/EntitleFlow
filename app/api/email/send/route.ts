import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';
import { OutboundEmailPayload } from '@/lib/email/types';

const FROM_EMAIL = 'reviews@entitleflow.com';

/**
 * POST /api/email/send
 * 
 * API route for sending emails from the platform.
 * Currently a placeholder that logs intent; in production would integrate with:
 * - Google Workspace SMTP
 * - Resend
 * - SendGrid
 * - AWS SES
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse incoming payload
    const payload: OutboundEmailPayload = await request.json();

    // Validate required fields
    if (!payload.to || !payload.subject || !payload.text) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, text' },
        { status: 400 }
      );
    }

    // Validate email address format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.to)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // Initialize Supabase admin client for database operations
    const adminSupabase = getSupabaseAdminClient();
    if (!adminSupabase) {
      console.error('Supabase admin client not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Determine organization_id for logging
    let organizationId: string | null = null;

    if (payload.permit_id) {
      const { data: permit } = await adminSupabase
        .from('permits')
        .select('organization_id')
        .eq('id', payload.permit_id)
        .limit(1)
        .single();

      if (permit) {
        organizationId = permit.organization_id;
      }
    }

    // TODO: In production, integrate with actual email service here
    // Example for Resend:
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: FROM_EMAIL,
    //     to: payload.to,
    //     subject: payload.subject,
    //     html: payload.html || payload.text,
    //   }),
    // });

    // For now, log the send intent
    const sendAttemptId = crypto.randomUUID();

    if (organizationId) {
      await adminSupabase
        .from('activity_log')
        .insert({
          organization_id: organizationId,
          project_id: payload.project_id || null,
          permit_id: payload.permit_id || null,
          action: 'email_sent',
          description: `Email sent to ${payload.to}: "${payload.subject}"`,
          metadata: {
            send_attempt_id: sendAttemptId,
            recipient: payload.to,
            from: FROM_EMAIL,
            subject: payload.subject,
            status: 'queued'
          }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- metadata fields not in generated types
        } as any);
    }

    return NextResponse.json(
      {
        success: true,
        send_attempt_id: sendAttemptId,
        from: FROM_EMAIL,
        to: payload.to,
        subject: payload.subject,
        message: 'Email queued for sending'
      },
      { status: 202 }
    );

  } catch (error) {
    console.error('Outbound email error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error processing email send request' },
      { status: 500 }
    );
  }
}
