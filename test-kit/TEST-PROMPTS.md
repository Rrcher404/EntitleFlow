# EntitleFlow — Test Prompts & Scenarios

## How to Use This Document

Each section below covers a feature area of the platform. Prompts are labeled with their **type** (Happy Path, Edge Case, Error, Stress) and the **expected behavior** so you can verify the platform responds correctly.

---

## 1. DOCUMENT UPLOAD PROMPTS

### Happy Path Tests

**DU-1: Standard PDF Upload**
- Upload: `01-site-plan-review-greensboro.pdf`
- Document Name: "Riverside Site Plan Review - 1st Round"
- Document Type: `correspondence`
- Associate with a project if one exists
- ✅ Expected: File uploads, appears in document list, shows file size and date

**DU-2: DOCX Upload**
- Upload: `09-response-letter-correspondence.docx`
- Document Name: "Response Letter to Greensboro Planning"
- Document Type: `correspondence`
- ✅ Expected: DOCX accepted, stored correctly, listed in documents

**DU-3: Image Upload (JPG)**
- Upload: `12-site-photo-riverside.jpg`
- Document Name: "Riverside Site Photo - NE View"
- Document Type: `photo`
- ✅ Expected: JPG accepted, thumbnail or preview available

**DU-4: Image Upload (PNG)**
- Upload: `13-boundary-survey-scan.png`
- Document Name: "Boundary Survey Scan - Riverside"
- Document Type: `survey`
- ✅ Expected: PNG accepted, listed with correct type

**DU-5: Multiple Document Types**
- Upload all 12 document types one by one, using the matching test file:
  - `site_plan` → 01-site-plan-review-greensboro.pdf
  - `civil_drawing` → 07-comprehensive-civil-review.pdf
  - `environmental_report` → 10-environmental-report.docx
  - `traffic_study` → 11-traffic-study-summary.docx
  - `stormwater_plan` → 04-environmental-review.pdf
  - `correspondence` → 09-response-letter-correspondence.docx
  - `approval_letter` → 05-approval-letter.pdf
  - `rejection_letter` → 08-rejection-letter-raleigh.pdf
  - `photo` → 12-site-photo-riverside.jpg
  - `survey` → 13-boundary-survey-scan.png
  - `other` → 15-tiny-test-image.png
- ✅ Expected: Each type saves correctly and displays the right label

### Edge Case Tests

**DU-6: Very Small File**
- Upload: `15-tiny-test-image.png` (tiny 100x100 image)
- ✅ Expected: Accepted without error, no minimum size issue

**DU-7: Upload Without Project Association**
- Upload any document without selecting a project or permit
- ✅ Expected: Upload succeeds — project/permit are optional fields

**DU-8: Duplicate File Name**
- Upload `01-site-plan-review-greensboro.pdf` twice with the same document name
- ✅ Expected: Either both are kept (with unique IDs) or a clear message about duplicate naming

**DU-9: Long File Name**
- Upload with name: "This is an extremely long document name that tests the character limit for the document name field in the upload form to make sure it handles overflow gracefully"
- ✅ Expected: Either truncates cleanly or shows a validation error

### Error Tests

**DU-10: Empty Upload (no file selected)**
- Click upload without attaching a file
- ✅ Expected: Validation error — "File is required"

**DU-11: Missing Document Name**
- Attach a file but leave the document name blank
- ✅ Expected: Validation error on the name field

---

## 2. AI SUMMARIZE PROMPTS

Use these text blocks with the `/api/ai/summarize` endpoint or the summarize feature in the UI.

### Happy Path Tests

**AI-S1: Standard Review Comments**
```
SITE PLAN REVIEW COMMENTS — 1st Review
Permit #SP-2026-0142
Project: Riverside Mixed-Use Development
Reviewer: Sarah Mitchell, AICP

Z-1 [CRITICAL]: The proposed building setback of 12 feet on the eastern property line does not meet the minimum 20-foot setback required under Section 30-8-11.2 for CD-CU zoning. Revise site plan to show compliant setbacks.

Z-2 [MAJOR]: Parking calculation shows 245 spaces but 268 required per Table 30-8-12.1. Provide revised calculations or reduce commercial SF.

Z-3 [MINOR]: Dumpster enclosure on Sheet C-4 missing required 6-foot masonry screening wall per Section 30-8-14.3.

SW-1 [CRITICAL]: Stormwater plan does not address post-construction runoff per Chapter 7. BMP design with N/P removal calculations required.

SW-2 [MAJOR]: Bioretention cell in NW corner appears undersized for 1-year, 24-hour storm per NCDEQ requirements.

T-1 [MAJOR]: TIA does not include Wendover Commons project (~350 PM peak trips). Revise for cumulative impacts.
```
- Context: projectName="Riverside Mixed-Use", permitNumber="SP-2026-0142", jurisdiction="Greensboro", reviewRound=1
- ✅ Expected: Summary with 6 total items, 2 critical, categories identified (Zoning, Stormwater, Transportation), high approval risk

**AI-S2: Building Code Comments**
```
BUILDING PERMIT REVIEW COMMENTS
Permit #BP-2026-0089

BC-1 [CRITICAL]: Type V-A construction cannot support 4-story mixed-use. Table 504.4 limits to 3 stories for Group M. Revise to Type III-A minimum.

BC-2 [CRITICAL]: Floor/ceiling assembly separating R-2 from M must be 2-hour per Section 508.4. Plans show 1-hour. Provide UL-listed 2-hour details.

BC-3 [MAJOR]: Accessible route slope is 1:8, exceeds ADA max 1:20. Provide ramp with handrails per Section 1010.

BC-4 [MAJOR]: Egress calculations don't include mezzanine occupant load. Recalculate per Section 1005.1.
```
- Context: projectName="Riverside Mixed-Use", jurisdiction="Greensboro"
- ✅ Expected: 4 items, 2 critical, building_code category, high risk assessment

**AI-S3: Fire Prevention (2nd Review)**
```
FIRE PREVENTION REVIEW — 2nd Review
Permit #FP-2026-0231

FP-1 [CRITICAL]: PREVIOUS COMMENT NOT ADDRESSED. Fire apparatus access road still shows 16-foot width. 20-foot minimum required per Section 503.2.1. This was noted in 1st review.

FP-2 [MAJOR]: Sprinkler hydraulic calculations show residual pressure of 18 psi. Minimum 25 psi required. Coordinate with water utility.

FP-3 [MAJOR]: Knox Box on east elevation but FDC on west. Relocate Knox Box within 10 feet of FDC per Policy 2024-03.
```
- Context: jurisdiction="Raleigh", reviewRound=2
- ✅ Expected: Should flag repeat comment (FP-1), note this is 2nd review, fire_safety category

### Edge Case Tests

**AI-S4: Approval (No Issues)**
```
Site plan for Elm Street Townhomes (SP-2025-0298) has been APPROVED. All previously identified comments have been adequately addressed. Conditions: commence within 12 months, pre-construction meeting required.
```
- ✅ Expected: 0 critical items, low approval risk, summary notes approval status

**AI-S5: Minimal Input**
```
No comments. Approved as submitted.
```
- ✅ Expected: Handles gracefully — 0 items, low risk

**AI-S6: Rejection (Not Technical Comments)**
```
Plan REJECTED — returned without review. Deficiencies: stormwater plan not included, TIA not included, plans not PE-sealed, application fee not received, notification affidavits missing.
```
- ✅ Expected: Should distinguish between rejection and technical review comments

**AI-S7: Dense Multi-Category (Stress Test)**
- Copy the full text content from `07-comprehensive-civil-review.pdf` (28 comments across 6 sheets)
- ✅ Expected: Correctly identifies all 28 comments, categorizes by sheet/discipline, counts 4 critical / 10 major / 14 minor

### Error Tests

**AI-S8: Empty Text**
```
(submit with empty text field)
```
- ✅ Expected: Validation error — text is required

**AI-S9: Non-Permit Content**
```
The quick brown fox jumps over the lazy dog. This is not a permit review document. It contains no technical comments or regulatory references.
```
- ✅ Expected: Either returns empty results or notes that no permit comments were detected

---

## 3. AI SUGGEST-RESPONSE PROMPTS

### Happy Path Tests

**AI-R1: Zoning Setback Comment**
- commentText: "The proposed building setback of 12 feet on the eastern property line does not meet the minimum 20-foot setback required under Section 30-8-11.2 for CD-CU zoning."
- category: "zoning"
- tone: "formal"
- jurisdiction: "Greensboro"
- ✅ Expected: Response acknowledges the setback issue, references the specific code section, proposes revision to 20 feet

**AI-R2: Stormwater BMP Comment**
- commentText: "Stormwater management plan does not address post-construction runoff requirements per Chapter 7. BMP design with nitrogen and phosphorus removal calculations required."
- category: "stormwater"
- tone: "technical"
- jurisdiction: "Greensboro"
- ✅ Expected: Technical response about BMP design, mentions N/P removal rates, references Chapter 7

**AI-R3: Fire Access (Repeat Comment)**
- commentText: "PREVIOUS COMMENT NOT ADDRESSED. Fire apparatus access road still shows 16-foot width. 20-foot minimum required per Section 503.2.1."
- category: "fire_safety"
- tone: "collaborative"
- jurisdiction: "Raleigh"
- ✅ Expected: Acknowledges the oversight, apologizes for repeat issue, confirms revision to 20 feet

**AI-R4: Accessible Route ADA Comment**
- commentText: "Accessible route from public sidewalk to building entrance does not meet ADA slope requirements (max 1:20 for accessible route, 1:12 for ramps). Sheet A-2 shows grade change of 30 inches over 20 feet (1:8 slope)."
- category: "building_code"
- tone: "formal"
- projectContext: "Mixed-use development with retail on ground floor and 18 residential units above. Challenging grade change between sidewalk and building entrance."
- ✅ Expected: Response addresses ramp design, references ADA Section 1010, proposes solution for grade challenge

**AI-R5: Environmental Buffer Violation**
- commentText: "Proposed grading plan shows land disturbance within the 50-foot riparian buffer of Horsepen Creek. Per Section 30-6-7, no disturbance is permitted within Zone 1 (0-30 feet)."
- category: "environmental"
- tone: "formal"
- jurisdiction: "Greensboro"
- ✅ Expected: Response addresses buffer revision, mentions Zone 1/Zone 2, may suggest variance path through NCDEQ

### Tone Variation Tests

**AI-R6: Same comment, three tones**
- commentText: "Parking calculation shows 245 spaces but 268 required. Provide revised calculations or reduce commercial SF."
- category: "zoning"
- Test with tone: "formal", then "technical", then "collaborative"
- ✅ Expected: Three noticeably different response styles. Formal = professional/deferential, Technical = data-focused/specific, Collaborative = partnership-oriented

### Edge Case Tests

**AI-R7: Vague Comment**
- commentText: "Plans need more detail."
- category: "general"
- ✅ Expected: Asks for clarification or provides a general response requesting specifics

**AI-R8: Approval Condition (Not a Deficiency)**
- commentText: "As-built survey to be submitted within 30 days of completion of site improvements."
- category: "general"
- ✅ Expected: Acknowledges the condition rather than "fixing" an issue

---

## 4. COMMENT THREAD PROMPTS

### Creating Comments

**CT-1: Create a top-level comment**
- Body: "Sheet C-3 shows retaining wall heights exceeding 4 feet without PE-sealed structural drawings. Please provide sealed wall design per NC Building Code Section 1807."
- Category: `building_code`
- Source: `jurisdiction`
- ✅ Expected: Comment created, appears in list, category badge visible

**CT-2: Reply to a comment**
- Find an existing comment and reply:
- Body: "We have engaged a structural engineer. Sealed retaining wall calculations and details will be included in the resubmittal package. Updated drawings on Sheet S-3."
- ✅ Expected: Reply appears nested under parent, threading works

**CT-3: Create comments across all categories**
- Create one comment for each category:
  - `parking_access`: "Parking lot layout does not show ADA van-accessible space. Revise per NCDOT requirements."
  - `stormwater`: "Bioretention cell drawdown time exceeds 72-hour maximum per NCDEQ manual."
  - `building_code`: "Egress width insufficient for calculated occupant load on 2nd floor."
  - `zoning`: "Proposed sign height exceeds maximum 6 feet per overlay district standards."
  - `fire_safety`: "Hydrant spacing exceeds 500-foot maximum. Add 2 additional hydrants."
  - `landscaping`: "Buffer yard on south property line does not meet Type C buffer requirements."
  - `traffic`: "Sight distance at proposed driveway obstructed by utility pole. Relocate or provide waiver."
  - `environmental`: "Wetland delineation report expired. Provide updated delineation or Corps confirmation."
  - `general`: "Submit 3 paper copies of revised plans to front desk upon resubmittal."
  - `other`: "Fee balance of $450 due before 2nd review can proceed."
- ✅ Expected: All categories work, each shows proper badge color

### Managing Comments

**CT-4: Resolve a comment**
- Find a comment and mark it resolved
- ✅ Expected: Status changes, resolution indicator visible, filtered correctly

**CT-5: Assign a comment**
- Assign a comment to a team member
- ✅ Expected: Assignment shows on comment, visible in team member's task list

**CT-6: Generate AI response for a comment**
- Select a comment and click "AI Response" or trigger the suggest-response
- ✅ Expected: AI-generated response appears with tone and confidence score

**CT-7: Filter and search**
- Filter by category (e.g., stormwater only)
- Filter by resolution status (unresolved only)
- Search for a specific term (e.g., "bioretention")
- ✅ Expected: Each filter works correctly, results update

---

## 5. PROJECT & PERMIT MANAGEMENT PROMPTS

### Projects

**PM-1: Create a new project**
- Name: "Battleground Business Park Phase III"
- Type: `commercial`
- Status: `active`
- Location: Greensboro, NC
- ✅ Expected: Project appears in list, correct type/status badges

**PM-2: Create project for each type**
- `residential`: "Elm Street Townhomes"
- `commercial`: "Capital Blvd Commerce Center"
- `mixed_use`: "Riverside Mixed-Use Development"
- `industrial`: "Airport Logistics Hub"
- `institutional`: "Wake County Library Expansion"
- `infrastructure`: "Wendover Ave Widening"
- ✅ Expected: All types create successfully, proper labels

### Permits

**PM-3: Create permits with status flow**
- Create a permit and walk it through: draft → submitted → under_review → revision_requested → resubmitted → approved
- ✅ Expected: Status timeline shows each transition, dates tracked

**PM-4: Link documents to permit**
- Associate uploaded test documents with a permit
- ✅ Expected: Documents appear on permit detail page

---

## 6. DASHBOARD & ANALYTICS PROMPTS

**DA-1: Dashboard KPIs**
- After creating projects/permits/documents, check dashboard
- ✅ Expected: Counts reflect what you've created

**DA-2: Analytics charts**
- Navigate to Analytics after creating data
- Check: Projects by status, Permits by status, Comments by category
- ✅ Expected: Charts render with your test data

**DA-3: Recent Activity feed**
- After performing actions (upload, create, resolve), check activity feed
- ✅ Expected: Recent actions appear chronologically

---

## 7. DEMO PORTAL PROMPTS

**DEMO-1: Browse demo without auth**
- Navigate to `/demo/dashboard` without logging in
- ✅ Expected: Demo loads with mock data, no auth required

**DEMO-2: Demo time range filter**
- Toggle between Today, 7d, 30d, 90d on demo dashboard
- ✅ Expected: Stats update for each range

**DEMO-3: Demo permits & comments**
- Navigate to demo permits, browse comment threads
- ✅ Expected: Mock permits visible with realistic comment threads

---

## 8. SETTINGS & TEAM PROMPTS

**ST-1: Update profile**
- Change display name, phone, job title
- ✅ Expected: Changes save and display correctly

**ST-2: Invite team member**
- Send an invitation email to a test address
- ✅ Expected: Invitation sent (or queued), appears in team list as pending

**ST-3: Notification preferences**
- Toggle notification settings on/off
- ✅ Expected: Preferences save correctly

---

## Quick Reference: Test File → Feature Mapping

| File | Upload Type | AI Summarize? | AI Suggest? |
|------|------------|---------------|-------------|
| 01-site-plan-review-greensboro.pdf | site_plan | ✅ Best test | ✅ Per comment |
| 02-building-code-review.pdf | correspondence | ✅ Yes | ✅ Per comment |
| 03-fire-prevention-review-raleigh.pdf | correspondence | ✅ 2nd review | ✅ Repeat comment |
| 04-environmental-review.pdf | environmental_report | ✅ Yes | ✅ Per comment |
| 05-approval-letter.pdf | approval_letter | ✅ Edge case | ❌ No comments |
| 06-minimal-review-letter.pdf | other | ✅ Edge case | ❌ No comments |
| 07-comprehensive-civil-review.pdf | civil_drawing | ✅ Stress test | ✅ 28 comments |
| 08-rejection-letter-raleigh.pdf | rejection_letter | ✅ Edge case | ❌ Not review |
| 09-response-letter-correspondence.docx | correspondence | ❌ It's a response | ❌ |
| 10-environmental-report.docx | environmental_report | ✅ Yes | ❌ |
| 11-traffic-study-summary.docx | traffic_study | ✅ Yes | ❌ |
| 12-site-photo-riverside.jpg | photo | ❌ Image | ❌ |
| 13-boundary-survey-scan.png | survey | ❌ Image | ❌ |
| 14-stormwater-bmp-photo.jpg | photo | ❌ Image | ❌ |
| 15-tiny-test-image.png | other | ❌ Edge case | ❌ |
