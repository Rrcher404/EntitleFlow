-- ============================================================================
-- Migration 00007: Admin Dashboard, RBAC Permissions, License Management
-- ============================================================================
-- This migration builds the admin dashboard, RBAC permission system, license
-- management, user tracking, and file management infrastructure.
--
-- Key additions:
-- - License types and definitions
-- - Granular permission system with role-based permissions
-- - User permission overrides for granular control
-- - User activity tracking and audit logs
-- - Company groups for organizational structure
-- - Password reset configuration
-- - Enhanced enums for activity tracking
-- ============================================================================

-- ============================================================================
-- 1. LICENSE TYPE ENUM AND LICENSE DEFINITIONS TABLE
-- ============================================================================

CREATE TYPE license_type AS ENUM ('admin', 'project_manager', 'contributor', 'guest_viewer');

CREATE TABLE license_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_type license_type NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  max_projects int,
  max_permits_per_project int,
  can_upload boolean DEFAULT true,
  can_download boolean DEFAULT true,
  can_delete_files boolean DEFAULT false,
  can_create_projects boolean DEFAULT false,
  can_create_subprojects boolean DEFAULT false,
  can_manage_team boolean DEFAULT false,
  can_access_admin_panel boolean DEFAULT false,
  can_export_data boolean DEFAULT false,
  can_reset_passwords boolean DEFAULT false,
  price_monthly_cents int NOT NULL DEFAULT 0,
  price_annual_cents int NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default license definitions
INSERT INTO license_definitions (
  license_type, display_name, description, max_projects, max_permits_per_project,
  can_upload, can_download, can_delete_files, can_create_projects, can_create_subprojects,
  can_manage_team, can_access_admin_panel, can_export_data, can_reset_passwords,
  price_monthly_cents, price_annual_cents
) VALUES
  (
    'admin',
    'Admin',
    'Full administrative access with team management and system control',
    NULL, NULL,
    true, true, true, true, true,
    true, true, true, true,
    9900, 99000
  ),
  (
    'project_manager',
    'Project Manager',
    'Can manage projects, upload/download documents, and export data',
    NULL, NULL,
    true, true, true, true, true,
    false, false, true, false,
    4900, 49000
  ),
  (
    'contributor',
    'Contributor',
    'Can upload and download within assigned projects',
    NULL, NULL,
    true, true, false, false, false,
    false, false, false, false,
    2900, 29000
  ),
  (
    'guest_viewer',
    'Guest Viewer',
    'Read-only access to assigned projects and permits',
    NULL, NULL,
    false, false, false, false, false,
    false, false, false, false,
    0, 0
  );

-- ============================================================================
-- 2. PERMISSION SYSTEM
-- ============================================================================

CREATE TYPE permission_action AS ENUM (
  'project.create', 'project.read', 'project.update', 'project.delete',
  'subproject.create', 'subproject.read', 'subproject.update', 'subproject.delete',
  'permit.create', 'permit.read', 'permit.update', 'permit.delete',
  'document.upload', 'document.download', 'document.delete', 'document.read',
  'comment.create', 'comment.read', 'comment.update', 'comment.delete', 'comment.resolve',
  'team.invite', 'team.remove', 'team.update_role',
  'admin.access', 'admin.manage_users', 'admin.manage_settings', 'admin.view_audit',
  'analytics.view', 'analytics.export',
  'password.reset_others'
);

-- Role-based default permissions mapping
CREATE TABLE role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_type license_type NOT NULL,
  permission permission_action NOT NULL,
  UNIQUE(license_type, permission)
);

-- Insert default role permissions for admin
INSERT INTO role_permissions (license_type, permission) VALUES
  ('admin', 'project.create'), ('admin', 'project.read'), ('admin', 'project.update'), ('admin', 'project.delete'),
  ('admin', 'subproject.create'), ('admin', 'subproject.read'), ('admin', 'subproject.update'), ('admin', 'subproject.delete'),
  ('admin', 'permit.create'), ('admin', 'permit.read'), ('admin', 'permit.update'), ('admin', 'permit.delete'),
  ('admin', 'document.upload'), ('admin', 'document.download'), ('admin', 'document.delete'), ('admin', 'document.read'),
  ('admin', 'comment.create'), ('admin', 'comment.read'), ('admin', 'comment.update'), ('admin', 'comment.delete'), ('admin', 'comment.resolve'),
  ('admin', 'team.invite'), ('admin', 'team.remove'), ('admin', 'team.update_role'),
  ('admin', 'admin.access'), ('admin', 'admin.manage_users'), ('admin', 'admin.manage_settings'), ('admin', 'admin.view_audit'),
  ('admin', 'analytics.view'), ('admin', 'analytics.export'),
  ('admin', 'password.reset_others');

-- Insert default role permissions for project_manager
INSERT INTO role_permissions (license_type, permission) VALUES
  ('project_manager', 'project.create'), ('project_manager', 'project.read'), ('project_manager', 'project.update'), ('project_manager', 'project.delete'),
  ('project_manager', 'subproject.create'), ('project_manager', 'subproject.read'), ('project_manager', 'subproject.update'), ('project_manager', 'subproject.delete'),
  ('project_manager', 'permit.create'), ('project_manager', 'permit.read'), ('project_manager', 'permit.update'), ('project_manager', 'permit.delete'),
  ('project_manager', 'document.upload'), ('project_manager', 'document.download'), ('project_manager', 'document.delete'), ('project_manager', 'document.read'),
  ('project_manager', 'comment.create'), ('project_manager', 'comment.read'), ('project_manager', 'comment.update'), ('project_manager', 'comment.delete'), ('project_manager', 'comment.resolve'),
  ('project_manager', 'analytics.view'), ('project_manager', 'analytics.export');

-- Insert default role permissions for contributor
INSERT INTO role_permissions (license_type, permission) VALUES
  ('contributor', 'project.read'),
  ('contributor', 'subproject.read'),
  ('contributor', 'permit.read'), ('contributor', 'permit.update'),
  ('contributor', 'document.upload'), ('contributor', 'document.download'), ('contributor', 'document.read'),
  ('contributor', 'comment.create'), ('contributor', 'comment.read'), ('contributor', 'comment.update'), ('contributor', 'comment.resolve'),
  ('contributor', 'analytics.view');

-- Insert default role permissions for guest_viewer
INSERT INTO role_permissions (license_type, permission) VALUES
  ('guest_viewer', 'project.read'),
  ('guest_viewer', 'subproject.read'),
  ('guest_viewer', 'permit.read'),
  ('guest_viewer', 'document.read'),
  ('guest_viewer', 'comment.read'),
  ('guest_viewer', 'analytics.view');

-- User permission overrides (company admins can grant/revoke per user)
CREATE TABLE user_permission_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  permission permission_action NOT NULL,
  granted boolean NOT NULL,
  granted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, permission)
);

-- ============================================================================
-- 3. ADD LICENSE COLUMNS TO PROFILES
-- ============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS license_type license_type DEFAULT 'contributor',
  ADD COLUMN IF NOT EXISTS licensed_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS license_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- ============================================================================
-- 4. EXTEND ORGANIZATIONS TABLE
-- ============================================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS storage_used_bytes bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS storage_limit_bytes bigint DEFAULT 10737418240,
  ADD COLUMN IF NOT EXISTS max_file_size_bytes bigint DEFAULT 157286400,
  ADD COLUMN IF NOT EXISTS max_users int DEFAULT 25,
  ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'starter',
  ADD COLUMN IF NOT EXISTS billing_email text,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- ============================================================================
-- 5. PASSWORD RESET CONFIGURATION
-- ============================================================================

CREATE TABLE password_reset_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  reset_link_duration_hours int DEFAULT 24,
  force_reset_schedule_days int,
  min_password_length int DEFAULT 8,
  require_uppercase boolean DEFAULT true,
  require_number boolean DEFAULT true,
  require_special_char boolean DEFAULT false,
  last_force_reset_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 6. USER ACTIVITY TRACKING
-- ============================================================================

CREATE TABLE user_activity_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  resource_name text,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_user_activity_tracking_org_created
  ON user_activity_tracking(organization_id, created_at DESC);

CREATE INDEX idx_user_activity_tracking_profile_created
  ON user_activity_tracking(profile_id, created_at DESC);

CREATE INDEX idx_user_activity_tracking_action
  ON user_activity_tracking(action);

CREATE INDEX idx_user_activity_tracking_resource
  ON user_activity_tracking(resource_type, resource_id);

-- ============================================================================
-- 7. ADMIN AUDIT LOG (Enhanced)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  details jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_admin_audit_log_org_created
  ON admin_audit_log(organization_id, created_at DESC);

CREATE INDEX idx_admin_audit_log_admin_created
  ON admin_audit_log(admin_id, created_at DESC);

-- ============================================================================
-- 8. COMPANY GROUPS (Organizational Structure)
-- ============================================================================

CREATE TABLE company_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  parent_group_id uuid REFERENCES company_groups(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_company_groups_org_id
  ON company_groups(organization_id);

CREATE INDEX idx_company_groups_parent_id
  ON company_groups(parent_group_id);

-- Group membership
CREATE TABLE company_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES company_groups(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, profile_id)
);

CREATE INDEX idx_company_group_members_group_id
  ON company_group_members(group_id);

CREATE INDEX idx_company_group_members_profile_id
  ON company_group_members(profile_id);

-- ============================================================================
-- 9. EXTEND ACTIVITY_ACTION ENUM
-- ============================================================================

ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'user_login';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'user_logout';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'password_reset';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'password_changed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'license_assigned';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'license_changed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'permission_changed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'file_downloaded';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'data_exported';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'admin_panel_accessed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'settings_changed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'group_created';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'group_updated';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'team_member_removed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'team_member_role_changed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'team_invitation_sent';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'team_invitation_accepted';

-- ============================================================================
-- 10. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE license_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- license_definitions: readable by all authenticated users
CREATE POLICY license_definitions_read
  ON license_definitions FOR SELECT
  TO authenticated
  USING (true);

-- role_permissions: readable by all authenticated users
CREATE POLICY role_permissions_read
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

-- user_permission_overrides: org-scoped access
CREATE POLICY user_permission_overrides_read_own
  ON user_permission_overrides FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY user_permission_overrides_insert_admin
  ON user_permission_overrides FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
    )
  );

CREATE POLICY user_permission_overrides_update_admin
  ON user_permission_overrides FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
    )
  );

CREATE POLICY user_permission_overrides_delete_admin
  ON user_permission_overrides FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
    )
  );

-- password_reset_config: admins in the org can read/write
CREATE POLICY password_reset_config_read_admin
  ON password_reset_config FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
    )
  );

CREATE POLICY password_reset_config_insert_admin
  ON password_reset_config FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
    )
  );

CREATE POLICY password_reset_config_update_admin
  ON password_reset_config FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
    )
  );

-- user_activity_tracking: org-scoped read for admins, insert for all
CREATE POLICY user_activity_tracking_read_org
  ON user_activity_tracking FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND (
      profile_id = auth.uid() OR
      organization_id IN (
        SELECT organization_id FROM profiles
        WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
      )
    )
  );

CREATE POLICY user_activity_tracking_insert_all
  ON user_activity_tracking FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- company_groups: org-scoped
CREATE POLICY company_groups_read_org
  ON company_groups FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY company_groups_insert_admin
  ON company_groups FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
    )
  );

CREATE POLICY company_groups_update_admin
  ON company_groups FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
    )
  );

CREATE POLICY company_groups_delete_admin
  ON company_groups FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
    )
  );

-- company_group_members: org-scoped
CREATE POLICY company_group_members_read_org
  ON company_group_members FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM company_groups
      WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY company_group_members_insert_admin
  ON company_group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT id FROM company_groups
      WHERE organization_id IN (
        SELECT organization_id FROM profiles
        WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
      )
    )
  );

CREATE POLICY company_group_members_delete_admin
  ON company_group_members FOR DELETE
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM company_groups
      WHERE organization_id IN (
        SELECT organization_id FROM profiles
        WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
      )
    )
  );

-- admin_audit_log: super_admin only via service role (no client access)
CREATE POLICY admin_audit_log_no_client_access
  ON admin_audit_log FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- 11. HELPER FUNCTIONS
-- ============================================================================

-- Function to check user permission
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id uuid,
  p_permission permission_action
) RETURNS boolean AS $$
DECLARE
  v_license_type license_type;
  v_has_default boolean;
  v_override_granted boolean;
BEGIN
  -- Get user's license type
  SELECT license_type INTO v_license_type
  FROM profiles WHERE id = p_user_id;
  
  IF v_license_type IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check for explicit override first
  SELECT granted INTO v_override_granted
  FROM user_permission_overrides
  WHERE profile_id = p_user_id AND permission = p_permission;
  
  IF v_override_granted IS NOT NULL THEN
    RETURN v_override_granted;
  END IF;
  
  -- Fall back to default role permissions
  SELECT EXISTS(
    SELECT 1 FROM role_permissions
    WHERE license_type = v_license_type AND permission = p_permission
  ) INTO v_has_default;
  
  RETURN v_has_default;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is organization admin
CREATE OR REPLACE FUNCTION is_org_admin(p_user_id uuid, p_org_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM profiles
    WHERE id = p_user_id
    AND organization_id = p_org_id
    AND (role = 'admin' OR is_super_admin = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 12. TRIGGERS FOR UPDATED_AT COLUMNS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER license_definitions_updated_at
  BEFORE UPDATE ON license_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER password_reset_config_updated_at
  BEFORE UPDATE ON password_reset_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER company_groups_updated_at
  BEFORE UPDATE ON company_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 13. TRIGGER TO UPDATE ORGANIZATION STORAGE WHEN DOCUMENTS CHANGE
-- ============================================================================

CREATE OR REPLACE FUNCTION update_organization_storage()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id uuid;
  v_size_change bigint;
BEGIN
  -- Get organization_id from the document's project
  -- This assumes documents have a project_id or similar reference
  -- Adjust based on actual document schema
  IF TG_TABLE_NAME = 'documents' THEN
    IF TG_OP = 'INSERT' THEN
      -- For inserts, add to storage
      UPDATE organizations
      SET storage_used_bytes = storage_used_bytes + COALESCE(NEW.file_size, 0)
      WHERE id IN (
        SELECT organization_id FROM projects
        WHERE id = NEW.project_id
      );
    ELSIF TG_OP = 'DELETE' THEN
      -- For deletes, subtract from storage
      UPDATE organizations
      SET storage_used_bytes = storage_used_bytes - COALESCE(OLD.file_size, 0)
      WHERE id IN (
        SELECT organization_id FROM projects
        WHERE id = OLD.project_id
      );
    ELSIF TG_OP = 'UPDATE' AND NEW.file_size != OLD.file_size THEN
      -- For updates, adjust the difference
      v_size_change := COALESCE(NEW.file_size, 0) - COALESCE(OLD.file_size, 0);
      UPDATE organizations
      SET storage_used_bytes = storage_used_bytes + v_size_change
      WHERE id IN (
        SELECT organization_id FROM projects
        WHERE id = NEW.project_id
      );
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to documents table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'documents'
  ) THEN
    CREATE TRIGGER documents_storage_update
      AFTER INSERT OR DELETE OR UPDATE ON documents
      FOR EACH ROW
      EXECUTE FUNCTION update_organization_storage();
  END IF;
END $$;

-- ============================================================================
-- End Migration 00007
-- ============================================================================
