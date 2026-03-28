# EntitleFlow — Comprehensive Test Plan

**Version:** 1.0
**Date:** March 23, 2026
**Platform:** EntitleFlow (entitleflow.com)

---

## Test Environment Setup

Before beginning, ensure you have:
1. A registered account on the platform (or access to the demo portal for unauthenticated tests)
2. The test-kit folder with all 15 test files available for upload
3. Access to browser dev tools (Network tab) for API response inspection

## Test Execution Order

Run these in order — later tests depend on data created in earlier ones.

---

## Phase 1: Authentication & Access (5 min)

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| AUTH-1 | Login with valid credentials | Navigate to /login, enter email/password | Redirect to /app/dashboard |
| AUTH-2 | Protected route redirect | Try accessing /app/dashboard while logged out | Redirect to /login |
| AUTH-3 | Demo portal access | Navigate to /demo/dashboard without auth | Loads mock data, no login required |
| AUTH-4 | Session persistence | Login, close tab, reopen /app/dashboard | Still authenticated |

---

## Phase 2: Project Creation (10 min)

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| PROJ-1 | Create "Riverside Mixed-Use" | Name: Riverside Mixed-Use Development, Type: mixed_use, Status: active | Project created, appears in list |
| PROJ-2 | Create "Battleground Business Park" | Name: Battleground Business Park Phase III, Type: commercial, Status: active | Project created |
| PROJ-3 | Create "Lawndale Acres" | Name: Lawndale Acres Subdivision, Type: residential, Status: draft | Draft project created |
| PROJ-4 | Create "Capital Blvd Commerce" | Name: Capital Blvd Commerce Center, Type: commercial, Status: active | Project created |
| PROJ-5 | Verify dashboard count | Check dashboard KPI for project count | Shows 4 projects |

---

## Phase 3: Permit Creation (10 min)

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| PERM-1 | Create site plan permit | Under Riverside project: SP-2026-0142, status: under_review | Permit linked to project |
| PERM-2 | Create building permit | Under Riverside project: BP-2026-0089, status: under_review | Permit linked |
| PERM-3 | Create fire prevention permit | Under Capital Blvd: FP-2026-0231, status: revision_requested | Shows revision status |
| PERM-4 | Create environmental permit | Under Lawndale: ENV-2026-0067, status: under_review | Permit linked |
| PERM-5 | Status workflow test | Move PERM-1 through: draft → submitted → under_review | Timeline shows transitions |
| PERM-6 | Approval flow | Create new permit, move to approved | Approved status badge shows |

---

## Phase 4: Document Upload (20 min)

| ID | File | Type | Associate With | Expected |
|----|------|------|----------------|----------|
| DOC-1 | 01-site-plan-review-greensboro.pdf | site_plan | PERM-1 | PDF uploads, linked to permit |
| DOC-2 | 02-building-code-review.pdf | correspondence | PERM-2 | PDF uploads |
| DOC-3 | 03-fire-prevention-review-raleigh.pdf | correspondence | PERM-3 | 2nd review doc uploads |
| DOC-4 | 04-environmental-review.pdf | environmental_report | PERM-4 | PDF uploads |
| DOC-5 | 05-approval-letter.pdf | approval_letter | None | Uploads without permit |
| DOC-6 | 06-minimal-review-letter.pdf | other | None | Minimal file uploads |
| DOC-7 | 07-comprehensive-civil-review.pdf | civil_drawing | PROJ-2 | Large doc uploads |
| DOC-8 | 08-rejection-letter-raleigh.pdf | rejection_letter | None | Rejection doc uploads |
| DOC-9 | 09-response-letter-correspondence.docx | correspondence | PERM-1 | DOCX format accepted |
| DOC-10 | 10-environmental-report.docx | environmental_report | PERM-4 | DOCX format accepted |
| DOC-11 | 11-traffic-study-summary.docx | traffic_study | PERM-1 | DOCX format accepted |
| DOC-12 | 12-site-photo-riverside.jpg | photo | PROJ-1 | JPG image accepted |
| DOC-13 | 13-boundary-survey-scan.png | survey | PROJ-1 | PNG image accepted |
| DOC-14 | 14-stormwater-bmp-photo.jpg | photo | PROJ-1 | JPG image accepted |
| DOC-15 | 15-tiny-test-image.png | other | None | Tiny file accepted |

**After all uploads:** Verify document list shows all 15, verify dashboard doc count = 15

---

## Phase 5: AI Summarize (15 min)

| ID | Input Source | Context | Key Checks |
|----|-------------|---------|------------|
| AIS-1 | Text from doc 01 (site plan review) | Greensboro, Riverside, Round 1 | 8 comments found, 2 critical, categories correct |
| AIS-2 | Text from doc 02 (building code) | Greensboro, Riverside | 6 comments, 2 critical, building_code category |
| AIS-3 | Text from doc 03 (fire review) | Raleigh, Capital Blvd, Round 2 | Flags repeat comment, 1 critical |
| AIS-4 | Text from doc 04 (environmental) | Greensboro, Lawndale | 5 comments, 2 critical, environmental category |
| AIS-5 | Text from doc 05 (approval) | Greensboro | 0 critical, low risk, notes approval |
| AIS-6 | Text from doc 06 (minimal) | None | Handles near-empty input gracefully |
| AIS-7 | Full text from doc 07 (28 comments) | Greensboro, Battleground | Stress test: 28 items, correct severity counts |
| AIS-8 | Text from doc 08 (rejection) | Raleigh | Distinguishes rejection from technical review |
| AIS-9 | Empty string | None | Returns validation error |
| AIS-10 | Non-permit text | None | Returns empty or "no comments found" |

---

## Phase 6: AI Suggest-Response (15 min)

| ID | Comment Text | Category | Tone | Key Checks |
|----|-------------|----------|------|------------|
| AIR-1 | Z-1 setback comment | zoning | formal | References Section 30-8-11.2, proposes 20ft |
| AIR-2 | SW-1 stormwater BMP | stormwater | technical | Technical BMP language, N/P removal |
| AIR-3 | FP-1 repeat fire access | fire_safety | collaborative | Acknowledges repeat, apologizes |
| AIR-4 | BC-3 ADA slope | building_code | formal | ADA-specific guidance, ramp solution |
| AIR-5 | E-2 buffer violation | environmental | formal | Buffer zone reference, NCDEQ variance path |
| AIR-6 | Z-2 parking (formal) | zoning | formal | Professional tone |
| AIR-7 | Z-2 parking (technical) | zoning | technical | Data/numbers focused |
| AIR-8 | Z-2 parking (collaborative) | zoning | collaborative | Partnership language |
| AIR-9 | "Plans need more detail" | general | formal | Handles vague input |
| AIR-10 | Approval condition text | general | formal | Acknowledges condition, not deficiency |

---

## Phase 7: Comment Threads (15 min)

| ID | Action | Details | Expected |
|----|--------|---------|----------|
| CMT-1 | Create jurisdiction comment | Body from Z-1, category: zoning, source: jurisdiction | Comment appears with badge |
| CMT-2 | Create internal comment | Body: "Team — we need structural engineer input on this", source: internal | Internal source label |
| CMT-3 | Reply to CMT-1 | Response acknowledging setback revision | Nested reply visible |
| CMT-4 | Create comment per category | One for each of 10 categories (see TEST-PROMPTS.md CT-3) | All category badges display |
| CMT-5 | Resolve a comment | Mark CMT-1 as resolved | Green checkmark/resolved badge |
| CMT-6 | Assign a comment | Assign CMT-2 to team member | Assignment shows on comment |
| CMT-7 | AI response on comment | Trigger AI suggest for CMT-1 | Response with confidence score |
| CMT-8 | Filter by category | Filter stormwater only | Only stormwater comments show |
| CMT-9 | Filter by resolution | Filter unresolved only | Resolved comments hidden |
| CMT-10 | Search comments | Search "bioretention" | Matching comments appear |

---

## Phase 8: Dashboard & Analytics (5 min)

| ID | Check | Expected |
|----|-------|----------|
| DASH-1 | Project count KPI | Matches created projects |
| DASH-2 | Permit count KPI | Matches created permits |
| DASH-3 | Document count KPI | Shows 15 |
| DASH-4 | Recent activity feed | Shows recent uploads and actions |
| DASH-5 | Analytics: Projects by status | Chart shows active/draft breakdown |
| DASH-6 | Analytics: Comments by category | Chart shows distribution |
| DASH-7 | Analytics: Resolution rate | Shows resolved vs open |

---

## Phase 9: Settings & Team (5 min)

| ID | Action | Expected |
|----|--------|----------|
| SET-1 | Update display name | Saves and displays new name |
| SET-2 | Update phone number | Saves correctly |
| SET-3 | Toggle notifications | Preferences save |
| SET-4 | Invite team member | Invitation sent/queued |

---

## Phase 10: Demo Portal (5 min)

| ID | Action | Expected |
|----|--------|----------|
| DEMO-1 | Load demo dashboard | Mock data renders, no auth |
| DEMO-2 | Toggle time ranges | Stats update per range |
| DEMO-3 | Browse demo permits | Mock permits with comments visible |
| DEMO-4 | Browse demo analytics | Charts render with mock data |

---

## Bug Tracking Template

When you find an issue, log it with:

```
BUG ID: [TEST-ID]-BUG-[N]
Severity: Critical / Major / Minor / Cosmetic
Feature: [Document Upload / AI Summarize / Comments / etc.]
Steps to Reproduce:
  1. ...
  2. ...
  3. ...
Expected: [what should happen]
Actual: [what actually happened]
Screenshot: [if applicable]
Browser: [Chrome/Safari/Firefox + version]
```

---

## Test Summary Checklist

- [ ] Phase 1: Auth (4 tests)
- [ ] Phase 2: Projects (5 tests)
- [ ] Phase 3: Permits (6 tests)
- [ ] Phase 4: Document Upload (15 tests)
- [ ] Phase 5: AI Summarize (10 tests)
- [ ] Phase 6: AI Suggest-Response (10 tests)
- [ ] Phase 7: Comment Threads (10 tests)
- [ ] Phase 8: Dashboard & Analytics (7 tests)
- [ ] Phase 9: Settings & Team (4 tests)
- [ ] Phase 10: Demo Portal (4 tests)

**Total: 75 test scenarios**
