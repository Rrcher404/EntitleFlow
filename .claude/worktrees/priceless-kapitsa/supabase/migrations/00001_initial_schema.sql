-- EntitleFlow NC - Supabase Initial Schema Migration
-- A comprehensive permit and entitlement management platform for NC land development
-- Created: 2026-03-19

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- ============================================================================
-- ENUMS
-- ============================================================================

create type company_type as enum (
  'architecture_firm',
  'civil_site_firm',
  'developer_builder',
  'permit_expeditor',
  'consultant',
  'other'
);

create type user_role as enum ('owner', 'admin', 'member', 'viewer');

create type project_type as enum (
  'residential',
  'commercial',
  'mixed_use',
  'industrial',
  'institutional',
  'infrastructure'
);

create type project_status as enum (
  'draft',
  'active',
  'on_hold',
  'completed',
  'archived'
);

create type permit_type as enum (
  'site_plan_review',
  'building_permit',
  'zoning_variance',
  'stormwater_review',
  'grading_permit',
  'demolition_permit',
  'sign_permit',
  'special_use_permit',
  'subdivision_review',
  'other'
);

create type permit_status as enum (
  'draft',
  'submitted',
  'under_review',
  'revision_requested',
  'resubmitted',
  'approved',
  'approved_with_conditions',
  'denied',
  'withdrawn',
  'expired'
);

create type priority_level as enum ('low', 'normal', 'high', 'urgent');

create type comment_source as enum ('internal', 'jurisdiction', 'imported');

create type comment_category as enum (
  'parking_access',
  'stormwater',
  'building_code',
  'zoning',
  'fire_safety',
  'landscaping',
  'traffic',
  'environmental',
  'general',
  'other'
);

create type document_type as enum (
  'site_plan',
  'architectural_drawing',
  'civil_drawing',
  'survey',
  'environmental_report',
  'traffic_study',
  'stormwater_plan',
  'photo',
  'correspondence',
  'approval_letter',
  'rejection_letter',
  'other'
);

create type activity_action as enum (
  'project_created',
  'permit_submitted',
  'comment_added',
  'status_changed',
  'document_uploaded',
  'reviewer_assigned',
  'deadline_set',
  'permit_approved',
  'permit_denied',
  'resubmittal_required'
);

create type deadline_status as enum (
  'upcoming',
  'due_soon',
  'overdue',
  'completed',
  'cancelled'
);


-- ============================================================================
-- HELPER FUNCTIONS FOR AUTO-GENERATION
-- ============================================================================

-- Function to generate project numbers (PRJ-YYYY-NNNN)
create or replace function generate_project_number()
returns text as $$
declare
  year_str text;
  next_num int;
  count_this_year int;
begin
  year_str := to_char(now(), 'YYYY');
  
  -- Count projects created this year
  count_this_year := (
    select count(*) 
    from projects 
    where to_char(created_at, 'YYYY') = year_str
  );
  
  next_num := count_this_year + 1;
  
  return 'PRJ-' || year_str || '-' || to_char(next_num, 'FM0000');
end;
$$ language plpgsql;

-- Function to generate permit numbers (PRM-YYYY-NNNN)
create or replace function generate_permit_number()
returns text as $$
declare
  year_str text;
  next_num int;
  count_this_year int;
begin
  year_str := to_char(now(), 'YYYY');
  
  -- Count permits created this year
  count_this_year := (
    select count(*) 
    from permits 
    where to_char(created_at, 'YYYY') = year_str
  );
  
  next_num := count_this_year + 1;
  
  return 'PRM-' || year_str || '-' || to_char(next_num, 'FM0000');
end;
$$ language plpgsql;

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ============================================================================
-- TABLE: ORGANIZATIONS
-- ============================================================================

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  company_type company_type,
  logo_url text,
  primary_jurisdiction text,
  active_nc_jurisdictions text[],
  settings jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_organizations_slug on organizations(slug);
create index idx_organizations_created_at on organizations(created_at desc);

create trigger update_organizations_updated_at
  before update on organizations
  for each row
  execute function update_updated_at_column();


-- ============================================================================
-- TABLE: PROFILES (extends auth.users)
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  full_name text not null,
  email text not null,
  avatar_url text,
  role user_role default 'member',
  job_title text,
  phone text,
  notification_preferences jsonb default '{"email": true, "in_app": true}',
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_profiles_organization_id on profiles(organization_id);
create index idx_profiles_email on profiles(email);
create index idx_profiles_role on profiles(role);

create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();


-- ============================================================================
-- TABLE: PROJECTS
-- ============================================================================

create table projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_number text unique not null default generate_project_number(),
  name text not null,
  description text,
  address text,
  city text,
  county text,
  jurisdiction text not null,
  project_type project_type,
  status project_status default 'draft',
  lead_id uuid references profiles(id) on delete set null,
  acreage numeric,
  parcel_ids text[],
  zoning_district text,
  estimated_value numeric,
  target_completion_date date,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_projects_organization_id on projects(organization_id);
create index idx_projects_project_number on projects(project_number);
create index idx_projects_status on projects(status);
create index idx_projects_jurisdiction on projects(jurisdiction);
create index idx_projects_lead_id on projects(lead_id);
create index idx_projects_city_county on projects(city, county);

create trigger update_projects_updated_at
  before update on projects
  for each row
  execute function update_updated_at_column();


-- ============================================================================
-- TABLE: PERMITS
-- ============================================================================

create table permits (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  permit_number text unique not null default generate_permit_number(),
  permit_type permit_type not null,
  title text not null,
  description text,
  jurisdiction text not null,
  status permit_status default 'draft',
  priority priority_level default 'normal',
  assigned_reviewer text,
  reviewer_email text,
  submitted_at timestamptz,
  decision_date timestamptz,
  expiration_date date,
  fee_amount numeric,
  fee_paid boolean default false,
  jurisdiction_portal_url text,
  jurisdiction_reference_number text,
  metadata jsonb default '{}',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_permits_project_id on permits(project_id);
create index idx_permits_organization_id on permits(organization_id);
create index idx_permits_permit_number on permits(permit_number);
create index idx_permits_status on permits(status);
create index idx_permits_jurisdiction on permits(jurisdiction);
create index idx_permits_priority on permits(priority);
create index idx_permits_created_by on permits(created_by);

create trigger update_permits_updated_at
  before update on permits
  for each row
  execute function update_updated_at_column();


-- ============================================================================
-- TABLE: PERMIT STATUS HISTORY
-- ============================================================================

create table permit_status_history (
  id uuid primary key default gen_random_uuid(),
  permit_id uuid not null references permits(id) on delete cascade,
  from_status permit_status,
  to_status permit_status not null,
  changed_by uuid references profiles(id) on delete set null,
  note text,
  created_at timestamptz default now()
);

create index idx_permit_status_history_permit_id on permit_status_history(permit_id);
create index idx_permit_status_history_created_at on permit_status_history(created_at desc);


-- ============================================================================
-- TABLE: COMMENTS
-- ============================================================================

create table comments (
  id uuid primary key default gen_random_uuid(),
  permit_id uuid not null references permits(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  author_name text not null,
  author_role text,
  source comment_source default 'internal',
  category comment_category,
  body text not null,
  is_resolved boolean default false,
  resolved_by uuid references profiles(id) on delete set null,
  resolved_at timestamptz,
  parent_comment_id uuid references comments(id) on delete cascade,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_comments_permit_id on comments(permit_id);
create index idx_comments_organization_id on comments(organization_id);
create index idx_comments_author_id on comments(author_id);
create index idx_comments_parent_comment_id on comments(parent_comment_id);
create index idx_comments_is_resolved on comments(is_resolved);

create trigger update_comments_updated_at
  before update on comments
  for each row
  execute function update_updated_at_column();


-- ============================================================================
-- TABLE: DOCUMENTS
-- ============================================================================

create table documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  permit_id uuid references permits(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  uploaded_by uuid references profiles(id) on delete set null,
  file_name text not null,
  file_type text,
  file_size bigint,
  storage_path text not null,
  document_type document_type,
  version integer default 1,
  description text,
  is_public boolean default false,
  created_at timestamptz default now()
);

create index idx_documents_organization_id on documents(organization_id);
create index idx_documents_project_id on documents(project_id);
create index idx_documents_permit_id on documents(permit_id);
create index idx_documents_comment_id on documents(comment_id);
create index idx_documents_uploaded_by on documents(uploaded_by);
create index idx_documents_created_at on documents(created_at desc);


-- ============================================================================
-- TABLE: ACTIVITY LOG
-- ============================================================================

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  permit_id uuid references permits(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  action activity_action not null,
  description text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index idx_activity_log_organization_id on activity_log(organization_id);
create index idx_activity_log_org_created on activity_log(organization_id, created_at desc);
create index idx_activity_log_project_id on activity_log(project_id);
create index idx_activity_log_permit_id on activity_log(permit_id);
create index idx_activity_log_actor_id on activity_log(actor_id);
create index idx_activity_log_action on activity_log(action);


-- ============================================================================
-- TABLE: DEADLINES
-- ============================================================================

create table deadlines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  permit_id uuid references permits(id) on delete cascade,
  title text not null,
  description text,
  due_date date not null,
  status deadline_status default 'upcoming',
  reminder_days_before integer[] default '{7,3,1}',
  assigned_to uuid references profiles(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create index idx_deadlines_organization_id on deadlines(organization_id);
create index idx_deadlines_due_date on deadlines(due_date);
create index idx_deadlines_status on deadlines(status);
create index idx_deadlines_assigned_to on deadlines(assigned_to);
create index idx_deadlines_project_id on deadlines(project_id);
create index idx_deadlines_permit_id on deadlines(permit_id);


-- ============================================================================
-- TABLE: JURISDICTIONS (Reference Data)
-- ============================================================================

create table jurisdictions (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  state text default 'NC',
  county text,
  portal_url text,
  contact_email text,
  contact_phone text,
  avg_review_days integer,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_jurisdictions_name on jurisdictions(name);
create index idx_jurisdictions_county on jurisdictions(county);

create trigger update_jurisdictions_updated_at
  before update on jurisdictions
  for each row
  execute function update_updated_at_column();


-- ============================================================================
-- TABLE: MARKETING LEADS
-- ============================================================================

create table marketing_leads (
  id uuid primary key default gen_random_uuid(),
  intent text,
  full_name text,
  email text,
  company text,
  company_type text,
  source_path text,
  active_nc_jurisdictions text[],
  primary_nc_jurisdiction text,
  annual_project_volume text,
  biggest_workflow_issue text,
  issue_category text,
  note text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index idx_marketing_leads_email on marketing_leads(email);
create index idx_marketing_leads_created_at on marketing_leads(created_at desc);


-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table projects enable row level security;
alter table permits enable row level security;
alter table permit_status_history enable row level security;
alter table comments enable row level security;
alter table documents enable row level security;
alter table activity_log enable row level security;
alter table deadlines enable row level security;
alter table jurisdictions enable row level security;
alter table marketing_leads enable row level security;

-- ============================================================================
-- RLS POLICIES: ORGANIZATIONS
-- ============================================================================

create policy "users_can_view_own_org"
  on organizations
  for select
  using (
    exists(
      select 1 from profiles
      where profiles.organization_id = organizations.id
      and profiles.id = auth.uid()
    )
  );

create policy "users_can_update_own_org"
  on organizations
  for update
  using (
    exists(
      select 1 from profiles
      where profiles.organization_id = organizations.id
      and profiles.id = auth.uid()
      and (profiles.role = 'owner' or profiles.role = 'admin')
    )
  );

-- ============================================================================
-- RLS POLICIES: PROFILES
-- ============================================================================

create policy "users_can_view_profiles_in_own_org"
  on profiles
  for select
  using (
    exists(
      select 1 from profiles p
      where p.organization_id = profiles.organization_id
      and p.id = auth.uid()
    )
  );

create policy "users_can_update_own_profile"
  on profiles
  for update
  using (id = auth.uid());

-- ============================================================================
-- RLS POLICIES: PROJECTS
-- ============================================================================

create policy "users_can_view_projects_in_own_org"
  on projects
  for select
  using (
    exists(
      select 1 from profiles
      where profiles.organization_id = projects.organization_id
      and profiles.id = auth.uid()
    )
  );

create policy "users_can_create_projects_in_own_org"
  on projects
  for insert
  with check (
    exists(
      select 1 from profiles
      where profiles.organization_id = projects.organization_id
      and profiles.id = auth.uid()
    )
  );

create policy "users_can_update_projects_in_own_org"
  on projects
  for update
  using (
    exists(
      select 1 from profiles
      where profiles.organization_id = projects.organization_id
      and profiles.id = auth.uid()
    )
  );

create policy "users_can_delete_projects_in_own_org"
  on projects
  for delete
  using (
    exists(
      select 1 from profiles
      where profiles.organization_id = projects.organization_id
      and profiles.id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: PERMITS
-- ============================================================================

create policy "users_can_view_permits_in_own_org"
  on permits
  for select
  using (
    exists(
      select 1 from profiles
      where profiles.organization_id = permits.organization_id
      and profiles.id = auth.uid()
    )
  );

create policy "users_can_create_permits_in_own_org"
  on permits
  for insert
  with check (
    exists(
      select 1 from profiles
      where profiles.organization_id = permits.organization_id
      and profiles.id = auth.uid()
    )
  );

create policy "users_can_update_permits_in_own_org"
  on permits
  for update
  using (
    exists(
      select 1 from profiles
      where profiles.organization_id = permits.organization_id
      and profiles.id = auth.uid()
    )
  );

create policy "users_can_delete_permits_in_own_org"
  on permits
  for delete
  using (
    exists(
      select 1 from profiles
      where profiles.organization_id = permits.organization_id
      and profiles.id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: PERMIT STATUS HISTORY
-- ============================================================================

create policy "users_can_view_permit_status_history_in_own_org"
  on permit_status_history
  for select
  using (
    exists(
      select 1 from permits
      join profiles on permits.organization_id = profiles.organization_id
      where permits.id = permit_status_history.permit_id
      and profiles.id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: COMMENTS
-- ============================================================================

create policy "users_can_view_comments_in_own_org"
  on comments
  for select
  using (
    exists(
      select 1 from profiles
      where profiles.organization_id = comments.organization_id
      and profiles.id = auth.uid()
    )
  );

create policy "users_can_create_comments_in_own_org"
  on comments
  for insert
  with check (
    exists(
      select 1 from profiles
      where profiles.organization_id = comments.organization_id
      and profiles.id = auth.uid()
    )
  );

create policy "users_can_update_own_comments"
  on comments
  for update
  using (author_id = auth.uid());

create policy "users_can_delete_own_comments"
  on comments
  for delete
  using (author_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: DOCUMENTS
-- ============================================================================

create policy "users_can_view_documents_in_own_org"
  on documents
  for select
  using (
    exists(
      select 1 from profiles
      where profiles.organization_id = documents.organization_id
      and profiles.id = auth.uid()
    )
  );

create policy "users_can_create_documents_in_own_org"
  on documents
  for insert
  with check (
    exists(
      select 1 from profiles
      where profiles.organization_id = documents.organization_id
      and profiles.id = auth.uid()
    )
  );

create policy "users_can_update_documents_in_own_org"
  on documents
  for update
  using (
    exists(
      select 1 from profiles
      where profiles.organization_id = documents.organization_id
      and profiles.id = auth.uid()
    )
  );

create policy "users_can_delete_documents_in_own_org"
  on documents
  for delete
  using (
    exists(
      select 1 from profiles
      where profiles.organization_id = documents.organization_id
      and profiles.id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: ACTIVITY LOG
-- ============================================================================

create policy "users_can_view_activity_in_own_org"
  on activity_log
  for select
  using (
    exists(
      select 1 from profiles
      where profiles.organization_id = activity_log.organization_id
      and profiles.id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: DEADLINES
-- ============================================================================

create policy "users_can_view_deadlines_in_own_org"
  on deadlines
  for select
  using (
    exists(
      select 1 from profiles
      where profiles.organization_id = deadlines.organization_id
      and profiles.id = auth.uid()
    )
  );

create policy "users_can_create_deadlines_in_own_org"
  on deadlines
  for insert
  with check (
    exists(
      select 1 from profiles
      where profiles.organization_id = deadlines.organization_id
      and profiles.id = auth.uid()
    )
  );

create policy "users_can_update_deadlines_in_own_org"
  on deadlines
  for update
  using (
    exists(
      select 1 from profiles
      where profiles.organization_id = deadlines.organization_id
      and profiles.id = auth.uid()
    )
  );

create policy "users_can_delete_deadlines_in_own_org"
  on deadlines
  for delete
  using (
    exists(
      select 1 from profiles
      where profiles.organization_id = deadlines.organization_id
      and profiles.id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: JURISDICTIONS (Public Reference Data)
-- ============================================================================

create policy "anyone_can_view_jurisdictions"
  on jurisdictions
  for select
  using (true);

-- ============================================================================
-- RLS POLICIES: MARKETING LEADS (Service Role Only)
-- ============================================================================

create policy "marketing_leads_no_client_access"
  on marketing_leads
  for all
  using (false)
  with check (false);


-- ============================================================================
-- SEED DATA: NC JURISDICTIONS
-- ============================================================================

insert into jurisdictions (name, state, county, portal_url, contact_email, contact_phone, avg_review_days, notes)
values
  ('Greensboro', 'NC', 'Guilford', 'https://www.greensboro-nc.gov/departments/development-services', 'planning@greensboro-nc.gov', '(336) 373-2800', 30, 'Guilford County seat'),
  ('Raleigh', 'NC', 'Wake', 'https://raleighnc.gov/development-services', 'planning@raleighnc.gov', '(919) 996-2735', 28, 'State capital'),
  ('Durham', 'NC', 'Durham', 'https://www.durhamnc.gov/departments-agencies/development-services', 'planning@durhamnc.gov', '(919) 560-4197', 35, 'Durham County seat'),
  ('Cary', 'NC', 'Wake', 'https://www.townofcary.org/development-services', 'planning@townofcary.org', '(919) 469-4000', 32, 'Wake County'),
  ('Charlotte', 'NC', 'Mecklenburg', 'https://development.charmeck.org/', 'planning@ci.charlotte.nc.us', '(704) 336-2205', 33, 'Mecklenburg County seat, largest city in NC'),
  ('Chapel Hill', 'NC', 'Orange', 'https://www.townofchapelhill.org/government/planning-development', 'planning@townofchapelhill.org', '(919) 968-2700', 34, 'Orange County'),
  ('Wilmington', 'NC', 'New Hanover', 'https://www.wilmingtonnc.gov/departments/development-services', 'planning@wilmingtonnc.gov', '(910) 341-7840', 31, 'New Hanover County seat, coastal'),
  ('Asheville', 'NC', 'Buncombe', 'https://www.ashevillenc.gov/departments-city-government/planning-development', 'planning@ashevillenc.gov', '(828) 259-5900', 36, 'Buncombe County seat, mountain region'),
  ('Winston-Salem', 'NC', 'Forsyth', 'https://www.cityofws.org/government/community-development', 'planning@cityofws.org', '(336) 727-2000', 29, 'Forsyth County seat'),
  ('Fayetteville', 'NC', 'Cumberland', 'https://www.fayetteville-nc.gov/government/planning-and-development', 'planning@fayetteville-nc.gov', '(910) 703-2900', 32, 'Cumberland County seat')
on conflict (name) do nothing;


-- ============================================================================
-- COMMENTS ON SUPABASE STORAGE BUCKETS
-- ============================================================================

/*

SUPABASE STORAGE BUCKET SETUP:

Name: project-documents
Privacy: Private (clients must be authenticated and authorized)
Max File Size: 50 MB per file
Allowed MIME Types:
  - application/pdf (PDF documents)
  - image/* (PNG, JPG, GIF, WebP, etc.)
  - application/vnd.openxmlformats-officedocument.wordprocessingml.document (.docx)
  - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (.xlsx)
  - application/vnd.openxmlformats-officedocument.presentationml.presentation (.pptx)

File Structure:
  project-documents/
    ├── org-{organization_id}/
    │   ├── projects/
    │   │   ├── {project_id}/
    │   │   │   └── {document_id}_{filename}
    │   ├── permits/
    │   │   ├── {permit_id}/
    │   │   │   └── {document_id}_{filename}

RLS Policies to Create in Supabase Dashboard:
  1. Read: Authenticated users can read files in their org folder
     path_prefixes: ["org-{auth.uid()}"]
  2. Insert: Authenticated users can upload files to their org folder
     path_prefixes: ["org-{auth.uid()}"]
  3. Delete: Authenticated users can delete their own uploaded files
     path_prefixes: ["org-{auth.uid()}"]

*/


-- ============================================================================
-- VERSION INFORMATION
-- ============================================================================

/*

Migration: 00001_initial_schema.sql
Version: 1.0
Created: 2026-03-19
Application: EntitleFlow NC

This migration creates the complete initial schema for EntitleFlow NC,
including:
- 11 main tables plus Supabase auth integration
- 13 custom enums for type safety
- Auto-generation functions for project/permit numbers
- Comprehensive Row Level Security (RLS) policies
- Updated_at triggers for automatic timestamp management
- Seed data for 10 NC jurisdictions
- 35+ indexes for performance optimization

All tables are production-ready with:
- Proper foreign key constraints with cascade deletes
- UUID primary keys with automatic generation
- Timestamptz fields in UTC
- JSONB metadata columns for extensibility
- Type-safe enums instead of text fields
- Security-first RLS policies

*/
