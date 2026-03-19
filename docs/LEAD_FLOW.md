# Lead & Walkthrough Request Flow

## Overview
EntitleFlow collects two types of marketing leads: walkthrough requests (companies with immediate workflow problems) and early-access signups (companies interested in future platform access). Both flows share a common API endpoint and storage mechanism.

## Form Locations & Pages

### Walkthrough Request Form
- **Component**: `components/forms/walkthrough-form.tsx`
- **Page**: `/walkthrough` (under `app/(marketing)/walkthrough/page.tsx`)
- **Purpose**: For companies with active, pressing workflow issues who want to discuss solutions with founders
- **Call-to-action**: "Request a walkthrough"

### Early Access Form
- **Component**: `components/forms/early-access-form.tsx`
- **Page**: `/early-access` (under `app/(marketing)/early-access/page.tsx`)
- **Purpose**: For companies interested in platform updates and pilot access
- **Call-to-action**: "Join early access"

---

## Data Collection

### Walkthrough Form Fields
1. **Full name** - `fullName` (string, 2+ chars required)
2. **Work email** - `email` (valid email required)
3. **Company** - `company` (string, 2+ chars required)
4. **Company type** - `companyType` (dropdown: Architecture firm, Civil/site firm, Developer/builder, Permit expeditor/consultant, Other)
5. **Active NC jurisdictions** - `activeNcJurisdictions` (textarea, comma or newline separated, 2+ chars)
6. **Annual project volume** - `annualProjectVolume` (dropdown: 1-10, 11-25, 26-50, 50+ active projects)
7. **Biggest workflow issue** - `biggestWorkflowIssue` (textarea, 10+ chars required)
8. **Primary issue category** - `issueCategory` (enum: comments, resubmittals, status visibility, portal sprawl, other)
9. **Source path** - `sourcePath` (hidden, passed from page context)
10. **Intent** - `intent` (hidden, literal: "walkthrough")

**Schema**: `walkthroughLeadSchema` in `lib/leads/schema.ts`

### Early Access Form Fields
1. **Full name** - `fullName` (string, 2+ chars required)
2. **Work email** - `email` (valid email required)
3. **Company** - `company` (string, 2+ chars required)
4. **Company type** - `companyType` (dropdown: same as walkthrough)
5. **Primary NC jurisdiction** - `primaryNcJurisdiction` (string, 2+ chars required)
6. **Optional note** - `note` (textarea, max 1000 chars, optional)
7. **Source path** - `sourcePath` (hidden, passed from page context)
8. **Intent** - `intent` (hidden, literal: "early-access")

**Schema**: `earlyAccessLeadSchema` in `lib/leads/schema.ts`

---

## API Endpoint & Validation

### POST `/api/leads`
**File**: `app/api/leads/route.ts`

**Validation Flow**:
1. Parse incoming JSON payload
2. Validate against `marketingLeadSchema` (discriminated union on `intent` field)
3. If validation fails: Return 400 with error message
4. If valid: Pass to `createMarketingLead()` service function

**Request Example**:
```json
{
  "intent": "walkthrough",
  "fullName": "Taylor Morgan",
  "email": "taylor@firm.com",
  "company": "Blue Ridge Civil",
  "companyType": "Civil / site firm",
  "activeNcJurisdictions": "Greensboro, Raleigh, Wake County",
  "annualProjectVolume": "11-25 active projects",
  "biggestWorkflowIssue": "We lose track of reviewer comments across departments",
  "issueCategory": "comments",
  "sourcePath": "/walkthrough"
}
```

**Response Success** (200):
```json
{
  "ok": true,
  "leadId": "550e8400-e29b-41d4-a716-446655440000",
  "nextStep": "book-walkthrough" or "await-follow-up"
}
```

**Response Error** (400 or 500):
```json
{
  "error": "Enter a valid work email."
}
```

---

## Data Storage & Processing

### Supabase Table: `marketing_leads`

**Walkthrough Lead Row Structure**:
```
id                         (uuid, auto-generated)
intent                     (text: "walkthrough")
full_name                  (text)
email                      (text, lowercase)
company                    (text)
company_type              (text)
source_path               (text, e.g., "/walkthrough")
active_nc_jurisdictions   (array of text, split from comma/newline input)
primary_nc_jurisdiction   (null for walkthrough)
annual_project_volume     (text, e.g., "11-25 active projects")
biggest_workflow_issue    (text)
issue_category            (text)
note                      (null for walkthrough)
metadata                  (jsonb: { rawJurisdictionText: original input })
created_at                (timestamp, auto)
updated_at                (timestamp, auto)
```

**Early Access Lead Row Structure**:
```
id                         (uuid, auto-generated)
intent                     (text: "early-access")
full_name                  (text)
email                      (text, lowercase)
company                    (text)
company_type              (text)
source_path               (text, e.g., "/early-access")
active_nc_jurisdictions   (empty array for early-access)
primary_nc_jurisdiction   (text)
annual_project_volume     (null for early-access)
biggest_workflow_issue    (null for early-access)
issue_category            (null for early-access)
note                       (text or null)
metadata                  (jsonb: {})
created_at                (timestamp, auto)
updated_at                (timestamp, auto)
```

**Key Processing** (`lib/leads/service.ts`):
- Trims and normalizes all string fields
- Converts email to lowercase
- Parses jurisdiction list using comma or newline delimiters
- Stores raw jurisdiction input in metadata for walkthrough leads
- Differentiates data shape based on `intent` field
- Returns `leadId` and `nextStep` indicator upon success

---

## Post-Submission Experience

### After Walkthrough Form Submission
1. **Success State**: `FormSuccessState` component displays
   - Title: "Walkthrough request received"
   - Message: Describes the next step (founder-led session)
   - Primary CTA: "Pick a walkthrough time" → `NEXT_PUBLIC_CALENDLY_URL` or fallback to Calendly domain
   - Secondary CTA: "See launch pricing" → `/pricing`
2. **Form resets** (clears user input fields, keeps defaults)
3. **Analytics event fires**: `walkthrough_form_submit` with `{ sourcePath, companyType }`

### After Early Access Form Submission
1. **Success State**: `FormSuccessState` component displays
   - Title: "You joined early access"
   - Message: Describes joining the waitlist and pilot availability
   - Primary CTA: (none, optional design choice)
   - Secondary CTA: "Need help sooner? Request a walkthrough" → `/walkthrough`
2. **Form fully resets**
3. **Analytics event fires**: `early_access_form_submit` with `{ sourcePath, companyType }`

---

## Analytics Events

### Event: `walkthrough_form_submit`
**Fired**: When walkthrough form successfully submits
**Properties**:
- `sourcePath` (string): Page from which form was submitted (e.g., "/walkthrough", "/product")
- `companyType` (string): Selected company type (e.g., "Civil / site firm")

**Use**: Track which pages drive the most walkthrough interest, and which company types are most interested.

### Event: `early_access_form_submit`
**Fired**: When early access form successfully submits
**Properties**:
- `sourcePath` (string): Page from which form was submitted
- `companyType` (string): Selected company type

**Use**: Track early access signup sources and company segments.

### Event: `calendly_handoff_click`
**Fired**: When user clicks the "Pick a walkthrough time" CTA (in success state)
**Properties**: (none specified in current implementation)

**Use**: Track conversion from form submission to actual scheduling attempt.

**Implementation**: Event name passed to `FormSuccessState` as `nextStepEventName` prop; triggered on CTA click.

### Tracking Implementation
- **Library**: `lib/analytics.ts` exports `trackEvent(name, properties)`
- **Provider**: Uses Vercel Analytics (`@vercel/analytics`)
- **Type**: `AnalyticsEventName` in `lib/types`

---

## Viewing Leads in Supabase Dashboard

### Access
1. Navigate to [Supabase Console](https://app.supabase.com)
2. Select the project
3. Go to **SQL Editor** or **Table Editor**
4. Select table: **`marketing_leads`**

### Querying Leads
**All leads**:
```sql
SELECT * FROM marketing_leads ORDER BY created_at DESC;
```

**Walkthrough requests only**:
```sql
SELECT * FROM marketing_leads WHERE intent = 'walkthrough' ORDER BY created_at DESC;
```

**Early access signups only**:
```sql
SELECT * FROM marketing_leads WHERE intent = 'early-access' ORDER BY created_at DESC;
```

**By company type**:
```sql
SELECT * FROM marketing_leads WHERE company_type = 'Civil / site firm' ORDER BY created_at DESC;
```

**By NC jurisdiction** (walkthrough):
```sql
SELECT * FROM marketing_leads 
WHERE intent = 'walkthrough' AND active_nc_jurisdictions @> ARRAY['Raleigh']
ORDER BY created_at DESC;
```

### Dashboard Filters
- Use Supabase's built-in table filters to segment by `intent`, `company_type`, `issue_category`, or date range
- Sort by `created_at` to see newest leads first

---

## Development Notes

- **Form state management**: React Hook Form + Zod validation
- **Client-side**: All form logic is client-side (`"use client"`)
- **Server-side**: Lead insertion uses Supabase admin client for security
- **Error handling**: User-friendly error messages displayed in red banner; server errors return HTTP 500
- **Success UX**: Forms stay on page but show success state; no page navigation
- **Environment variables**: `NEXT_PUBLIC_CALENDLY_URL` for scheduling link (with fallback)

