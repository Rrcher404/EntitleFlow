/**
 * lib/email/notify.ts
 *
 * Internal notification emails sent FROM EntitleFlow TO team inboxes.
 * Uses Resend REST API (zero-dependency, serverless-friendly).
 *
 * Two notification channels:
 *   • WalkthroughRequests@entitleflow.com  — website form submissions
 *   • Licenses@entitleflow.com             — license change requests from company admins
 *
 * If RESEND_API_KEY is not set, notifications are logged to console
 * but do not block the calling operation (fire-and-forget).
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_ADDRESS = 'EntitleFlow Platform <notifications@entitleflow.com>';

// ─── Destination Inboxes ──────────────────────────────────────
export const NOTIFY_WALKTHROUGH = 'WalkthroughRequests@entitleflow.com';
export const NOTIFY_LICENSES = 'Licenses@entitleflow.com';

// ─── Types ────────────────────────────────────────────────────

interface NotifyPayload {
  to: string;
  subject: string;
  html: string;
}

interface ResendResponse {
  id?: string;
  message?: string;
}

// ─── Core sender ──────────────────────────────────────────────

async function sendNotification(payload: NotifyPayload): Promise<{ sent: boolean; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(
      `[email/notify] RESEND_API_KEY not set — would send to ${payload.to}: "${payload.subject}"`
    );
    return { sent: false };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });

    const data: ResendResponse = await res.json();

    if (!res.ok) {
      console.error(`[email/notify] Resend error (${res.status}):`, data);
      return { sent: false };
    }

    return { sent: true, id: data.id };
  } catch (err) {
    console.error('[email/notify] Failed to send notification:', err);
    return { sent: false };
  }
}

// ─── Walkthrough Request Notification ─────────────────────────

interface WalkthroughNotifyData {
  leadId: string;
  fullName: string;
  email: string;
  company: string;
  companyType: string;
  jurisdictions: string;
  annualVolume: string;
  biggestIssue: string;
  issueCategory: string;
  sourcePath: string;
}

export async function notifyWalkthroughRequest(data: WalkthroughNotifyData) {
  const subject = `🟢 New Walkthrough Request — ${data.company} (${data.fullName})`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1B3B2D;">
      <div style="background: #1B3B2D; color: #f6f5f0; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 18px;">New Walkthrough Request</h2>
        <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">Lead ID: ${data.leadId}</p>
      </div>
      <div style="background: #f6f5f0; padding: 24px; border: 1px solid #e0ddd5; border-top: none; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #6b7a6f; width: 140px; vertical-align: top;">Contact</td>
            <td style="padding: 8px 12px;">${data.fullName}<br/><a href="mailto:${data.email}" style="color: #25a18e;">${data.email}</a></td>
          </tr>
          <tr style="background: #eeedea;">
            <td style="padding: 8px 12px; font-weight: 600; color: #6b7a6f; vertical-align: top;">Company</td>
            <td style="padding: 8px 12px;">${data.company} <span style="color: #6b7a6f;">(${data.companyType})</span></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #6b7a6f; vertical-align: top;">NC Jurisdictions</td>
            <td style="padding: 8px 12px;">${data.jurisdictions}</td>
          </tr>
          <tr style="background: #eeedea;">
            <td style="padding: 8px 12px; font-weight: 600; color: #6b7a6f; vertical-align: top;">Annual Volume</td>
            <td style="padding: 8px 12px;">${data.annualVolume} projects</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #6b7a6f; vertical-align: top;">Biggest Issue</td>
            <td style="padding: 8px 12px;">
              <span style="display: inline-block; background: #25a18e; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-bottom: 4px;">${data.issueCategory}</span><br/>
              ${data.biggestIssue}
            </td>
          </tr>
          <tr style="background: #eeedea;">
            <td style="padding: 8px 12px; font-weight: 600; color: #6b7a6f; vertical-align: top;">Source</td>
            <td style="padding: 8px 12px;">${data.sourcePath}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e0ddd5; font-size: 12px; color: #6b7a6f;">
          Sent from EntitleFlow Platform • <a href="https://entitleflow.com" style="color: #25a18e;">entitleflow.com</a>
        </div>
      </div>
    </div>
  `;

  return sendNotification({ to: NOTIFY_WALKTHROUGH, subject, html });
}

// ─── Early Access Notification ────────────────────────────────

interface EarlyAccessNotifyData {
  leadId: string;
  fullName: string;
  email: string;
  company: string;
  companyType: string;
  primaryJurisdiction: string;
  note?: string;
  sourcePath: string;
}

export async function notifyEarlyAccessRequest(data: EarlyAccessNotifyData) {
  const subject = `🔵 New Early Access Request — ${data.company} (${data.fullName})`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1B3B2D;">
      <div style="background: #1B3B2D; color: #f6f5f0; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 18px;">New Early Access Request</h2>
        <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">Lead ID: ${data.leadId}</p>
      </div>
      <div style="background: #f6f5f0; padding: 24px; border: 1px solid #e0ddd5; border-top: none; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #6b7a6f; width: 140px; vertical-align: top;">Contact</td>
            <td style="padding: 8px 12px;">${data.fullName}<br/><a href="mailto:${data.email}" style="color: #25a18e;">${data.email}</a></td>
          </tr>
          <tr style="background: #eeedea;">
            <td style="padding: 8px 12px; font-weight: 600; color: #6b7a6f; vertical-align: top;">Company</td>
            <td style="padding: 8px 12px;">${data.company} <span style="color: #6b7a6f;">(${data.companyType})</span></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #6b7a6f; vertical-align: top;">Primary Jurisdiction</td>
            <td style="padding: 8px 12px;">${data.primaryJurisdiction}</td>
          </tr>
          ${data.note ? `
          <tr style="background: #eeedea;">
            <td style="padding: 8px 12px; font-weight: 600; color: #6b7a6f; vertical-align: top;">Note</td>
            <td style="padding: 8px 12px;">${data.note}</td>
          </tr>` : ''}
          <tr style="${data.note ? '' : 'background: #eeedea;'}">
            <td style="padding: 8px 12px; font-weight: 600; color: #6b7a6f; vertical-align: top;">Source</td>
            <td style="padding: 8px 12px;">${data.sourcePath}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e0ddd5; font-size: 12px; color: #6b7a6f;">
          Sent from EntitleFlow Platform • <a href="https://entitleflow.com" style="color: #25a18e;">entitleflow.com</a>
        </div>
      </div>
    </div>
  `;

  return sendNotification({ to: NOTIFY_WALKTHROUGH, subject, html });
}

// ─── License Change Request Notification ──────────────────────

interface LicenseChangeNotifyData {
  requestId: string;
  organizationName: string;
  organizationId: string;
  requestedByName: string;
  requestedByEmail: string;
  targetUserName: string;
  targetUserEmail: string;
  currentLicense: string;
  requestedLicense: string;
  billingTerm: string;
  requiresPrepayment: boolean;
  requestNotes?: string;
}

export async function notifyLicenseChangeRequest(data: LicenseChangeNotifyData) {
  const subject = `⚡ License Change Request — ${data.organizationName}: ${data.targetUserName} (${data.currentLicense} → ${data.requestedLicense})`;

  const prepaymentBadge = data.requiresPrepayment
    ? '<span style="display: inline-block; background: #e74c3c; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Requires Prepayment</span>'
    : '<span style="display: inline-block; background: #25a18e; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Standard Billing</span>';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1B3B2D;">
      <div style="background: #1B3B2D; color: #f6f5f0; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 18px;">License Change Request</h2>
        <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">${data.organizationName} • Request #${data.requestId.slice(0, 8)}</p>
      </div>
      <div style="background: #f6f5f0; padding: 24px; border: 1px solid #e0ddd5; border-top: none; border-radius: 0 0 8px 8px;">

        <div style="background: white; border: 1px solid #e0ddd5; border-radius: 6px; padding: 16px; margin-bottom: 16px; text-align: center;">
          <span style="font-size: 14px; color: #6b7a6f;">License Change</span><br/>
          <span style="font-size: 18px; font-weight: 600;">
            <span style="color: #6b7a6f;">${formatLicenseType(data.currentLicense)}</span>
            <span style="color: #25a18e; margin: 0 8px;">→</span>
            <span style="color: #1B3B2D;">${formatLicenseType(data.requestedLicense)}</span>
          </span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #6b7a6f; width: 140px; vertical-align: top;">Organization</td>
            <td style="padding: 8px 12px;">${data.organizationName}</td>
          </tr>
          <tr style="background: #eeedea;">
            <td style="padding: 8px 12px; font-weight: 600; color: #6b7a6f; vertical-align: top;">Requested By</td>
            <td style="padding: 8px 12px;">${data.requestedByName}<br/><a href="mailto:${data.requestedByEmail}" style="color: #25a18e;">${data.requestedByEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #6b7a6f; vertical-align: top;">Target User</td>
            <td style="padding: 8px 12px;">${data.targetUserName}<br/><a href="mailto:${data.targetUserEmail}" style="color: #25a18e;">${data.targetUserEmail}</a></td>
          </tr>
          <tr style="background: #eeedea;">
            <td style="padding: 8px 12px; font-weight: 600; color: #6b7a6f; vertical-align: top;">Billing</td>
            <td style="padding: 8px 12px;">${formatBillingTerm(data.billingTerm)}<br/>${prepaymentBadge}</td>
          </tr>
          ${data.requestNotes ? `
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #6b7a6f; vertical-align: top;">Notes</td>
            <td style="padding: 8px 12px;">${data.requestNotes}</td>
          </tr>` : ''}
        </table>

        <div style="margin-top: 20px; text-align: center;">
          <a href="https://entitleflow.com/admin/license-requests"
             style="display: inline-block; background: #25a18e; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Review in Admin Dashboard
          </a>
        </div>

        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e0ddd5; font-size: 12px; color: #6b7a6f;">
          Sent from EntitleFlow Platform • <a href="https://entitleflow.com" style="color: #25a18e;">entitleflow.com</a>
        </div>
      </div>
    </div>
  `;

  return sendNotification({ to: NOTIFY_LICENSES, subject, html });
}

// ─── Helpers ──────────────────────────────────────────────────

function formatLicenseType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatBillingTerm(term: string): string {
  switch (term) {
    case 'monthly':
      return 'Monthly billing';
    case 'prepaid':
      return 'Prepaid contract';
    case 'contract_allowance':
      return 'Contract allowance (quarterly changes)';
    default:
      return term;
  }
}
