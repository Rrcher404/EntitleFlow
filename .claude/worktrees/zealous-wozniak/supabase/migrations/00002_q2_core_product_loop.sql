-- Migration: 00002_q2_core_product_loop.sql
-- Q1/Q2 2026 Core Product Loop Implementation
-- Adds team management, notifications, parse jobs, and email ingestion capabilities

-- ============================================================================
-- NEW ENUMS
-- ============================================================================

CREATE TYPE notification_type AS ENUM (
  'comment_assigned',
  'comment_resolved',
  'permit_status_changed',
  'deadline_approaching',
  'document_uploaded',
  'team_invitation',
  'mention',
  'ai_parse_complete',
  'email_ingested'
);

CREATE TYPE parse_job_status AS ENUM (
  'queued',
  'processing',
  'completed',
  'failed'
);

CREATE TYPE invitation_status AS ENUM (
  'pending',
  'accepted',
  'expired',
  'revoked'
);

-- ============================================================================
-- ADD NEW VALUES TO EXISTING ACTIVITY_ACTION ENUM
-- ============================================================================

ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'comment_resolved';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'comment_assigned';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'team_member_invited';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'team_member_joined';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'document_parsed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'email_ingested';

-- ============================================================================
-- NEW TABLES
-- ============================================================================

-- Team Members table for organization membership
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_organization_id
  ON team_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_members_profile_id
  ON team_members(profile_id);

-- Team Invitations table for pending team member invitations
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status invitation_status DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_invitations_token
  ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email
  ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_organization_id
  ON team_invitations(organization_id);

-- Comment Assignments table for tracking assigned comments
CREATE TABLE IF NOT EXISTS comment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  unassigned_at TIMESTAMPTZ,
  UNIQUE(comment_id, assigned_to)
);

CREATE INDEX IF NOT EXISTS idx_comment_assignments_comment_id
  ON comment_assignments(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_assignments_assigned_to
  ON comment_assignments(assigned_to);

-- Notifications table for user notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read_created
  ON notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_organization_id
  ON notifications(organization_id);

-- Notification Preferences table for user notification settings
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  in_app BOOLEAN DEFAULT TRUE,
  email BOOLEAN DEFAULT TRUE,
  email_digest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, notification_type)
);

-- Parse Jobs table for document parsing tasks
CREATE TABLE IF NOT EXISTS parse_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status parse_job_status NOT NULL DEFAULT 'queued',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  comments_created INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parse_jobs_status
  ON parse_jobs(status);
CREATE INDEX IF NOT EXISTS idx_parse_jobs_document_id
  ON parse_jobs(document_id);

-- Email Queue table for ingested emails
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  raw_payload JSONB NOT NULL,
  permit_id UUID REFERENCES permits(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'unmatched',
  matched_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COLUMN ADDITIONS TO EXISTING TABLES
-- ============================================================================

-- Add columns to comments table
ALTER TABLE IF EXISTS comments
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS ai_suggested_response TEXT,
  ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS parse_job_id UUID REFERENCES parse_jobs(id);

CREATE INDEX IF NOT EXISTS idx_comments_assigned_to
  ON comments(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_permit_resolved
  ON comments(permit_id, is_resolved);

-- Add columns to documents table
ALTER TABLE IF EXISTS documents
  ADD COLUMN IF NOT EXISTS parse_status parse_job_status,
  ADD COLUMN IF NOT EXISTS parsed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auto_parse BOOLEAN DEFAULT TRUE;

-- Add columns to profiles table
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Add columns to projects table
ALTER TABLE IF EXISTS projects
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7);

-- ============================================================================
-- UPDATE TRIGGERS FOR updated_at COLUMNS
-- ============================================================================

-- Create or replace the update_updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to team_members
DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to parse_jobs
DROP TRIGGER IF EXISTS update_parse_jobs_updated_at ON parse_jobs;
CREATE TRIGGER update_parse_jobs_updated_at
  BEFORE UPDATE ON parse_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE parse_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Team Members RLS Policies
-- Users can view team members in their organizations
CREATE POLICY team_members_select_policy
  ON team_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM team_members
      WHERE profile_id = auth.uid()
    )
  );

-- Admins can insert team members
CREATE POLICY team_members_insert_policy
  ON team_members FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM team_members
      WHERE profile_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Admins can update team members
CREATE POLICY team_members_update_policy
  ON team_members FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM team_members
      WHERE profile_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Admins can delete team members
CREATE POLICY team_members_delete_policy
  ON team_members FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM team_members
      WHERE profile_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Team Invitations RLS Policies
-- Public can view invitations by token
CREATE POLICY team_invitations_select_by_token_policy
  ON team_invitations FOR SELECT
  USING (true);

-- Admins can manage invitations
CREATE POLICY team_invitations_insert_policy
  ON team_invitations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM team_members
      WHERE profile_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY team_invitations_update_policy
  ON team_invitations FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM team_members
      WHERE profile_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY team_invitations_delete_policy
  ON team_invitations FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM team_members
      WHERE profile_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Comment Assignments RLS Policies
-- Organization members can view assignments
CREATE POLICY comment_assignments_select_policy
  ON comment_assignments FOR SELECT
  USING (
    comment_id IN (
      SELECT c.id FROM comments c
      JOIN permits p ON c.permit_id = p.id
      WHERE p.organization_id IN (
        SELECT organization_id FROM team_members
        WHERE profile_id = auth.uid()
      )
    )
  );

-- Members and above can create assignments
CREATE POLICY comment_assignments_insert_policy
  ON comment_assignments FOR INSERT
  WITH CHECK (
    comment_id IN (
      SELECT c.id FROM comments c
      JOIN permits p ON c.permit_id = p.id
      WHERE p.organization_id IN (
        SELECT organization_id FROM team_members
        WHERE profile_id = auth.uid() AND role IN ('member', 'admin', 'owner')
      )
    )
  );

-- Members and above can update assignments
CREATE POLICY comment_assignments_update_policy
  ON comment_assignments FOR UPDATE
  USING (
    comment_id IN (
      SELECT c.id FROM comments c
      JOIN permits p ON c.permit_id = p.id
      WHERE p.organization_id IN (
        SELECT organization_id FROM team_members
        WHERE profile_id = auth.uid() AND role IN ('member', 'admin', 'owner')
      )
    )
  );

-- Notifications RLS Policies
-- Users can only see their own notifications
CREATE POLICY notifications_select_policy
  ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

-- System can insert notifications
CREATE POLICY notifications_insert_policy
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications
CREATE POLICY notifications_update_policy
  ON notifications FOR UPDATE
  USING (recipient_id = auth.uid());

-- Notification Preferences RLS Policies
-- Users can only manage their own preferences
CREATE POLICY notification_preferences_select_policy
  ON notification_preferences FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY notification_preferences_insert_policy
  ON notification_preferences FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY notification_preferences_update_policy
  ON notification_preferences FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY notification_preferences_delete_policy
  ON notification_preferences FOR DELETE
  USING (profile_id = auth.uid());

-- Parse Jobs RLS Policies
-- Organization members can view parse jobs
CREATE POLICY parse_jobs_select_policy
  ON parse_jobs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM team_members
      WHERE profile_id = auth.uid()
    )
  );

-- Parse Jobs RLS Policies
-- System can insert/update parse jobs
CREATE POLICY parse_jobs_insert_policy
  ON parse_jobs FOR INSERT
  WITH CHECK (true);

CREATE POLICY parse_jobs_update_policy
  ON parse_jobs FOR UPDATE
  USING (true);

-- Email Queue RLS Policies
-- Organization members can view email queue
CREATE POLICY email_queue_select_policy
  ON email_queue FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM team_members
      WHERE profile_id = auth.uid()
    )
  );

-- Admins can update email queue entries
CREATE POLICY email_queue_update_policy
  ON email_queue FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM team_members
      WHERE profile_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- System can insert email queue entries
CREATE POLICY email_queue_insert_policy
  ON email_queue FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- UPDATE EXISTING COMMENTS RLS TO ALLOW ORG MEMBERS TO UPDATE
-- ============================================================================

-- Drop existing comments update policy if it exists
DROP POLICY IF EXISTS comments_update_policy ON comments;

-- New policy allows any org member to update comments (for resolve/assign)
CREATE POLICY comments_update_policy
  ON comments FOR UPDATE
  USING (
    permit_id IN (
      SELECT p.id FROM permits p
      WHERE p.organization_id IN (
        SELECT organization_id FROM team_members
        WHERE profile_id = auth.uid()
      )
    )
  );
