/**
 * Email type definitions for EntitleFlow email integration
 */

export interface InboundEmailPayload {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: EmailAttachment[];
  date?: string;
  message_id?: string;
}

export interface EmailAttachment {
  filename: string;
  content_type: string;
  size: number;
  url?: string;
}

export interface OutboundEmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
  permit_id?: string;
  project_id?: string;
}

export interface ParsedEmail {
  from_name: string;
  from_email: string;
  subject: string;
  body: string;
  permit_number: string | null;
  category: string;
  attachments: EmailAttachment[];
  message_id?: string;
}

export type CommentCategory = 
  | 'general'
  | 'stormwater'
  | 'zoning'
  | 'building_code'
  | 'fire_safety'
  | 'environmental'
  | 'traffic'
  | 'utilities'
  | 'historical_preservation'
  | 'accessibility'
  | 'drainage'
  | 'other';

export interface EmailServiceConfig {
  provider: 'google_workspace' | 'resend' | 'sendgrid' | 'aws_ses' | 'mailgun';
  apiKey?: string;
  fromEmail: string;
  fromName?: string;
}

export interface SendEmailResponse {
  success: boolean;
  send_attempt_id: string;
  from: string;
  to: string;
  subject: string;
  message: string;
  timestamp?: string;
}

export interface ProcessEmailResponse {
  success: boolean;
  comment_id: string;
  permit_id: string | null;
  organization_id: string | null;
  source: 'internal' | 'jurisdiction' | 'imported';
  message: string;
}
