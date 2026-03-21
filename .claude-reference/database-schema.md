# Database Schema Reference

Last updated: 2026-03-21 (includes Q2 migration 00002)

## Tables

### organizations
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| name | TEXT NOT NULL | |
| slug | TEXT UNIQUE NOT NULL | |
| company_type | company_type enum | |
| logo_url | TEXT | |
| primary_jurisdiction | TEXT | |
| active_nc_jurisdictions | TEXT[] | |
| settings | JSONB | default '{}' |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | trigger |

### profiles (extends auth.users)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | references auth.users |
| organization_id | UUID NOT NULL | FK → organizations |
| full_name | TEXT NOT NULL | |
| email | TEXT NOT NULL | |
| avatar_url | TEXT | |
| role | user_role | default 'member' |
| job_title | TEXT | |
| phone | TEXT | |
| notification_preferences | JSONB | default email+in_app |
| onboarding_completed | BOOLEAN | default false |
| is_super_admin | BOOLEAN | default false (Q2) |
| last_seen_at | TIMESTAMPTZ | (Q2) |
| created_at, updated_at | TIMESTAMPTZ | |

### projects
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| organization_id | UUID NOT NULL | FK → organizations |
| project_number | TEXT UNIQUE | auto PRJ-YYYY-NNNN |
| name | TEXT NOT NULL | |
| description | TEXT | |
| address | TEXT | |
| city, county | TEXT | |
| jurisdiction | TEXT NOT NULL | |
| project_type | project_type enum | |
| status | project_status | default 'draft' |
| lead_id | UUID | FK → profiles |
| acreage | NUMERIC | |
| parcel_ids | TEXT[] | |
| zoning_district | TEXT | |
| estimated_value | NUMERIC | |
| target_completion_date | DATE | |
| latitude | DECIMAL(10,7) | (Q2 - for map view) |
| longitude | DECIMAL(10,7) | (Q2 - for map view) |
| metadata | JSONB | |
| created_at, updated_at | TIMESTAMPTZ | |

### permits
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| project_id | UUID NOT NULL | FK → projects |
| organization_id | UUID NOT NULL | FK → organizations |
| permit_number | TEXT UNIQUE | auto PRM-YYYY-NNNN |
| permit_type | permit_type NOT NULL | |
| title | TEXT NOT NULL | |
| description | TEXT | |
| jurisdiction | TEXT NOT NULL | |
| status | permit_status | default 'draft' |
| priority | priority_level | default 'normal' |
| assigned_reviewer | TEXT | |
| reviewer_email | TEXT | |
| submitted_at | TIMESTAMPTZ | |
| decision_date | TIMESTAMPTZ | |
| expiration_date | DATE | |
| fee_amount | NUMERIC | |
| fee_paid | BOOLEAN | default false |
| jurisdiction_portal_url | TEXT | |
| jurisdiction_reference_number | TEXT | |
| metadata | JSONB | |
| created_by | UUID | FK → profiles |
| created_at, updated_at | TIMESTAMPTZ | |

### comments
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| permit_id | UUID NOT NULL | FK → permits |
| organization_id | UUID NOT NULL | FK → organizations |
| author_id | UUID | FK → profiles |
| author_name | TEXT NOT NULL | |
| author_role | TEXT | |
| source | comment_source | default 'internal' |
| category | comment_category | |
| body | TEXT NOT NULL | |
| is_resolved | BOOLEAN | default false |
| resolved_by | UUID | FK → profiles |
| resolved_at | TIMESTAMPTZ | |
| parent_comment_id | UUID | FK → comments (self) |
| assigned_to | UUID | FK → profiles (Q2) |
| ai_suggested_response | TEXT | (Q2) |
| ai_confidence | DECIMAL(3,2) | (Q2) |
| parse_job_id | UUID | FK → parse_jobs (Q2) |
| metadata | JSONB | |
| created_at, updated_at | TIMESTAMPTZ | |

### documents
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| organization_id | UUID NOT NULL | FK → organizations |
| project_id | UUID | FK → projects |
| permit_id | UUID | FK → permits |
| comment_id | UUID | FK → comments |
| uploaded_by | UUID | FK → profiles |
| file_name | TEXT NOT NULL | |
| file_type | TEXT | MIME type |
| file_size | BIGINT | |
| storage_path | TEXT NOT NULL | GCS path |
| document_type | document_type enum | |
| version | INTEGER | default 1 |
| description | TEXT | |
| is_public | BOOLEAN | default false |
| parse_status | parse_job_status | (Q2) |
| parsed_at | TIMESTAMPTZ | (Q2) |
| auto_parse | BOOLEAN | default true (Q2) |
| created_at | TIMESTAMPTZ | |

### permit_status_history
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| permit_id | UUID NOT NULL | FK → permits |
| from_status | permit_status | nullable (first entry) |
| to_status | permit_status NOT NULL | |
| changed_by | UUID | FK → profiles |
| note | TEXT | |
| created_at | TIMESTAMPTZ | |

### activity_log
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| organization_id | UUID NOT NULL | FK → organizations |
| project_id | UUID | FK → projects |
| permit_id | UUID | FK → permits |
| actor_id | UUID | FK → profiles |
| action | activity_action NOT NULL | |
| description | TEXT | |
| metadata | JSONB | |
| created_at | TIMESTAMPTZ | |

### deadlines
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| organization_id | UUID NOT NULL | |
| project_id | UUID | FK → projects |
| permit_id | UUID | FK → permits |
| title | TEXT NOT NULL | |
| description | TEXT | |
| due_date | DATE NOT NULL | |
| status | deadline_status | default 'upcoming' |
| reminder_days_before | INTEGER[] | default {7,3,1} |
| assigned_to | UUID | FK → profiles |
| completed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### team_members (Q2)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| organization_id | UUID NOT NULL | FK → organizations |
| profile_id | UUID NOT NULL | FK → profiles |
| role | user_role | default 'member' |
| invited_by | UUID | FK → profiles |
| is_active | BOOLEAN | default true |
| created_at, updated_at | TIMESTAMPTZ | |
| UNIQUE | (organization_id, profile_id) | |

### team_invitations (Q2)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| organization_id | UUID NOT NULL | FK → organizations |
| email | TEXT NOT NULL | |
| role | user_role | default 'member' |
| invited_by | UUID NOT NULL | FK → profiles |
| token | TEXT UNIQUE | auto hex token |
| status | invitation_status | default 'pending' |
| expires_at | TIMESTAMPTZ | default NOW() + 7 days |
| accepted_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### comment_assignments (Q2)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| comment_id | UUID NOT NULL | FK → comments |
| assigned_to | UUID NOT NULL | FK → profiles |
| assigned_by | UUID NOT NULL | FK → profiles |
| assigned_at | TIMESTAMPTZ | |
| unassigned_at | TIMESTAMPTZ | |
| UNIQUE | (comment_id, assigned_to) | |

### notifications (Q2)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| recipient_id | UUID NOT NULL | FK → profiles |
| organization_id | UUID NOT NULL | FK → organizations |
| type | notification_type NOT NULL | |
| title | TEXT NOT NULL | |
| body | TEXT | |
| is_read | BOOLEAN | default false |
| read_at | TIMESTAMPTZ | |
| action_url | TEXT | |
| metadata | JSONB | |
| created_at | TIMESTAMPTZ | |

### notification_preferences (Q2)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| profile_id | UUID NOT NULL | FK → profiles |
| notification_type | notification_type NOT NULL | |
| in_app | BOOLEAN | default true |
| email | BOOLEAN | default true |
| email_digest | BOOLEAN | default false |
| UNIQUE | (profile_id, notification_type) | |

### parse_jobs (Q2)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| document_id | UUID NOT NULL | FK → documents |
| organization_id | UUID NOT NULL | FK → organizations |
| status | parse_job_status | default 'queued' |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |
| error_message | TEXT | |
| comments_created | INTEGER | default 0 |
| metadata | JSONB | |
| created_at, updated_at | TIMESTAMPTZ | |

### email_queue (Q2)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| organization_id | UUID | FK → organizations |
| raw_payload | JSONB NOT NULL | |
| permit_id | UUID | FK → permits |
| status | TEXT | default 'unmatched' |
| matched_by | UUID | FK → profiles |
| created_at | TIMESTAMPTZ | |

## Enums

| Enum | Values |
|------|--------|
| company_type | architecture_firm, civil_site_firm, developer_builder, permit_expeditor, consultant, other |
| user_role | owner, admin, member, viewer |
| project_type | residential, commercial, mixed_use, industrial, institutional, infrastructure |
| project_status | draft, active, on_hold, completed, archived |
| permit_type | site_plan_review, building_permit, zoning_variance, stormwater_review, grading_permit, demolition_permit, sign_permit, special_use_permit, subdivision_review, other |
| permit_status | draft, submitted, under_review, revision_requested, resubmitted, approved, approved_with_conditions, denied, withdrawn, expired |
| priority_level | low, normal, high, urgent |
| comment_source | internal, jurisdiction, imported |
| comment_category | parking_access, stormwater, building_code, zoning, fire_safety, landscaping, traffic, environmental, general, other |
| document_type | site_plan, architectural_drawing, civil_drawing, survey, environmental_report, traffic_study, stormwater_plan, photo, correspondence, approval_letter, rejection_letter, other |
| activity_action | project_created, permit_submitted, comment_added, status_changed, document_uploaded, reviewer_assigned, deadline_set, permit_approved, permit_denied, resubmittal_required, comment_resolved, comment_assigned, team_member_invited, team_member_joined, document_parsed, email_ingested |
| deadline_status | upcoming, due_soon, overdue, completed, cancelled |
| notification_type | comment_assigned, comment_resolved, permit_status_changed, deadline_approaching, document_uploaded, team_invitation, mention, ai_parse_complete, email_ingested |
| parse_job_status | queued, processing, completed, failed |
| invitation_status | pending, accepted, expired, revoked |

## Valid Permit Status Transitions

```
draft → submitted, withdrawn
submitted → under_review, withdrawn
under_review → revision_requested, approved, approved_with_conditions, denied
revision_requested → resubmitted, withdrawn
resubmitted → under_review, withdrawn
approved/approved_with_conditions/denied → withdrawn
```
