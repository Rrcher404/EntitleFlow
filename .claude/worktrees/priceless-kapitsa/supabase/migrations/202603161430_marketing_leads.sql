create extension if not exists pgcrypto;

create table if not exists public.marketing_leads (
  id uuid primary key default gen_random_uuid(),
  intent text not null check (intent in ('walkthrough', 'early-access')),
  full_name text not null,
  email text not null,
  company text not null,
  company_type text not null,
  active_nc_jurisdictions text[] not null default '{}',
  primary_nc_jurisdiction text,
  annual_project_volume text,
  biggest_workflow_issue text,
  issue_category text,
  note text,
  source_path text not null,
  status text not null default 'new',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists marketing_leads_intent_idx on public.marketing_leads (intent);
create index if not exists marketing_leads_created_at_idx on public.marketing_leads (created_at desc);
