# EntitleFlow Test Scenarios

This document provides 15 comprehensive test scenarios for manual QA testing. Each scenario includes step-by-step instructions, expected outcomes, and validation criteria.

## Scenario 1: Upload Document and Verify Parsing

**Objective**: Test document upload functionality and comment extraction from TRC review letter.

**Prerequisites**:
- User logged in as Project Manager (David Chen)
- Project created: "Riverside Mixed-Use Development"
- Empty comment list

**Steps**:
1. Navigate to project > Documents > Upload
2. Select file: `greensboro-trc-review-letter.txt`
3. Select document type: "TRC Review Letter"
4. Submit upload
5. Wait for parsing to complete
6. View extracted comments list

**Expected Outcomes**:
- Document uploads successfully without errors
- Parsing completes within 30 seconds
- System extracts 25 comments from document
- Each comment displays:
  - Comment number/ID
  - Department (e.g., "Transportation", "Stormwater")
  - Comment text (full or truncated preview)
  - Classification (MAJOR, STANDARD, or MINOR)
  - Reviewer name (if present)
- Comments grouped by department in default view
- Total comment count shows "25 comments from Greensboro TRC"

**Validation Checklist**:
- [ ] Upload dialog appears
- [ ] File upload succeeds without timeout
- [ ] Comment count matches expected (25)
- [ ] All departments represented (7 total: Transportation, Stormwater, Zoning, Fire/Life Safety, Landscape, Water/Sewer, Environmental, Planning)
- [ ] Comment text accurately captured (spot check 3-4 comments)
- [ ] Classification accuracy (spot check MAJOR vs STANDARD vs MINOR tags)
- [ ] Timestamps applied to comments

**Notes**: This is the foundation test. All subsequent scenarios depend on successful document parsing.

---

## Scenario 2: Assign Comments to Team Members

**Objective**: Test team member assignment logic and role-based filtering.

**Prerequisites**:
- Document uploaded (Scenario 1 complete)
- Team members invited and active (from team-members.json)
- At least 5 comments in system

**Steps**:
1. Open first Transportation comment (Comment T-1)
2. Click "Assign" button
3. Filter by role: select "Traffic Engineer"
4. Select team member: Jennifer Rodriguez
5. Add internal note: "Priority: high - driveway spacing issue"
6. Click "Confirm Assignment"
7. Repeat for next 4 comments:
   - T-2: Jennifer Rodriguez (Traffic Engineer)
   - S-1: Robert Williams (Stormwater Engineer)
   - L-1: Marcus Thompson (Landscape Architect)
   - Z-1: David Chen (Project Manager)

**Expected Outcomes**:
- Assignment dropdown filters team members by role
- Only appropriate roles shown (e.g., "Traffic Engineer" for T-1)
- Assignment saves with timestamp
- Comment status changes to "Assigned"
- Assignee name displays on comment card
- Internal note appears in comment detail view
- Team member receives notification (email/in-app based on preference)

**Validation Checklist**:
- [ ] Role-based filtering works correctly
- [ ] Only matching roles displayed in dropdown
- [ ] Assignment saves immediately
- [ ] Comment card shows assignee avatar and name
- [ ] Status bar updates to "Assigned"
- [ ] Internal note visible in comment details
- [ ] Notification sent to assigned team member
- [ ] PM can view all assignments in "My Team" tab

**Notes**: Verify notification delivery by checking team member's notification inbox or email.

---

## Scenario 3: Resolve Comments with Internal Notes

**Objective**: Test comment resolution workflow and note tracking.

**Prerequisites**:
- Comments assigned (Scenario 2 complete)
- Assigned team members have logged in

**Steps**:
1. Log in as Sarah Mitchell (Civil Engineer)
2. Navigate to "My Assignments"
3. Open assigned comment (e.g., S-1 about BMP design)
4. Click "Add Response"
5. Enter response text:
   "Recalculated bioretention basin per NC DWI 2022 Manual. Basin increased to 2.4 acres. Calculations attached. Ready for TRC follow-up."
6. Attach calculation file (or note: "[ATTACHMENT: BMP_Calc_Rev2.pdf]")
7. Add internal note: "Engineering sign-off required before submitting"
8. Mark status: "Responded - Pending Review"
9. Click "Save"
10. (As PM) Review response and approve

**Expected Outcomes**:
- Response text saves with timestamp and author name
- Attachments link appears in comment
- Internal note visible only to team (not in external correspondence)
- Comment status progresses: "Assigned" → "Responded - Pending Review" → "Approved"
- PM receives notification of pending review
- Comment card shows "Last Updated" timestamp
- Response history shows all updates with dates

**Validation Checklist**:
- [ ] Response text character limit appropriate (suggest 500-5000 chars)
- [ ] Attachments save and link properly
- [ ] Internal notes do not appear in generated response letter
- [ ] Status transitions are logical and sequential
- [ ] Timestamp accuracy (verify against system clock)
- [ ] PM notification triggered on "Pending Review" status
- [ ] Resolution confidence score shows (auto-generated from text analysis)
- [ ] Cross-discipline linking suggested if applicable

**Notes**: Test both "quick approve" (PM can approve in response list) and "detailed review" (PM opens comment detail to approve).

---

## Scenario 4: Generate AI Response for a Comment

**Objective**: Test AI response generation using FlowE/Claude integration.

**Prerequisites**:
- At least one unresponded comment in system
- AI generation enabled in project settings
- Project context loaded (location, project type, etc.)

**Steps**:
1. Open unresponded comment (e.g., Z-2 about parking ratio)
2. Click "Generate Response" button
3. Review AI-generated draft:
   ```
   "Applicant has reduced parking from 450 to 210 spaces per City's
   1.75 sp/unit standard for mixed-income housing. Parking demand study
   shows project will utilize on-street parking and future transit. Revised
   Parking Plan provided on Sheet P-1."
   ```
4. Edit draft text (modify 1-2 sentences)
5. Click "Accept & Insert" to populate response field
6. Add internal note: "AI-generated response, lightly edited"
7. Save response

**Expected Outcomes**:
- AI generates contextually appropriate response matching comment
- Generated text matches tone of response template
- Response includes project-specific details (numbers, sheet references)
- Code/regulation citations may be included if relevant
- Draft appears in modal/popup for review before insertion
- User can edit, regenerate, or discard draft
- Final response is marked as "AI-assisted" in metadata
- Response saves with both user edit history and AI generation timestamp

**Validation Checklist**:
- [ ] AI response generation completes within 10 seconds
- [ ] Generated text is grammatically correct and professional
- [ ] Response is specific to comment (not generic)
- [ ] Tone matches NC regulatory style
- [ ] Code references are accurate (if included)
- [ ] Generated text length is 100-300 words (appropriate for comment response)
- [ ] User can easily edit generated text
- [ ] Response metadata shows "AI-assisted generation"
- [ ] No hallucinated references or incorrect code citations

**Notes**: Save AI-generated responses as training data for future model improvements. Flag any hallucinations or incorrect information.

---

## Scenario 5: Generate Resubmittal Plan

**Objective**: Test AI-generated resubmittal plan that ranks and prioritizes comments.

**Prerequisites**:
- At least 15 comments in system with mixed status (some resolved, some pending)
- Project in active review status

**Steps**:
1. Navigate to project dashboard
2. Click "Generate Resubmittal Plan" button
3. AI analyzes comments and generates plan:
   - Ranks comments by criticality (MAJOR first, then STANDARD, then MINOR)
   - Groups by department/discipline
   - Identifies dependencies (e.g., stormwater comment affects parking comment)
   - Estimates effort and timeline for resolution
4. Review generated plan summary (1-page overview)
5. Review detailed ranking with dependency map
6. Export plan as PDF or share with team

**Expected Outcomes**:
- Plan generates within 15 seconds
- Top-level ranking clearly shows MAJOR items first (4-5 items typically)
- Dependencies clearly identified and explained
- Suggested resolution sequence provided
- Effort estimates realistic (1-3 days per comment typical)
- Cross-discipline impacts highlighted
- Plan includes contingencies and escalation criteria
- PDF export includes all details with signatures/approval blocks

**Validation Checklist**:
- [ ] MAJOR comments rank before STANDARD before MINOR
- [ ] Dependencies identified (e.g., S-1 impacts Z-2 on parking)
- [ ] Suggested sequence is logical and achievable
- [ ] Effort estimates are reasonable (expert review)
- [ ] Timeline is realistic (critical path calculated)
- [ ] Department heads identified for escalation
- [ ] Plan references specific comment numbers
- [ ] Risk assessment included (what could cause delays)
- [ ] PDF export includes all sections without formatting errors

**Notes**: Cross-reference against actual project engineering. Effort estimates should be validated by team leads.

---

## Scenario 6: Generate Response Letter

**Objective**: Test comprehensive response letter generation from all comment responses.

**Prerequisites**:
- All comments have responses (resolved or pending)
- Response letter template loaded
- Project details complete (location, permit #, applicant, etc.)

**Steps**:
1. Navigate to project > Documents > Generate Response Letter
2. Select comments to include (filter by status: all, or only "Approved")
3. Configure letter options:
   - Include comment references: Yes
   - Include plan sheet references: Yes
   - Include applicant logo: Yes
   - Signature block: [PM Name], Project Manager
4. Preview generated letter (5+ pages expected)
5. Review for accuracy:
   - All comments addressed
   - Responses grouped by department
   - Plan sheet references correct
   - No orphaned comments
   - Professional formatting
6. Export as PDF or Word
7. Add digital signature placeholder

**Expected Outcomes**:
- Letter generates in under 30 seconds
- Letter includes:
  - Proper letterhead (applicant info)
  - Addressing block (City planner name/address)
  - Re: line with project details
  - Introduction paragraph
  - Body organized by department (Transportation, Stormwater, Zoning, etc.)
  - Each comment with full response text
  - Attachments/exhibits list
  - Signature block
- Formatting professional and consistent
- Page breaks logical (department groupings maintained)
- No formatting errors or missing sections
- PDF export preserves formatting
- Word export maintains editability

**Validation Checklist**:
- [ ] All comments included in letter body
- [ ] Proper department grouping and headers
- [ ] Comment numbering matches original TRC letter (T-1, S-1, etc.)
- [ ] Plan sheet references match revised plans (e.g., "Sheet C-1")
- [ ] Code citations accurate (spot check 3)
- [ ] Professional formatting (fonts, margins, spacing)
- [ ] Page breaks don't split comment/response pairs
- [ ] Signature block includes date and space for signature
- [ ] PDF export matches screen preview
- [ ] Word export is fully editable
- [ ] Exhibits/attachments list complete

**Notes**: This is critical for client approval. Verify formatting with actual response letters from municipalities.

---

## Scenario 7: Test Notification Delivery

**Objective**: Verify that notifications are sent appropriately and contain correct information.

**Prerequisites**:
- Team members invited and active with notification preferences set
- Multiple comments assigned in system
- Email/SMS configured for testing

**Steps**:
1. Create new comment and assign to team member A
2. Verify email notification received (check inbox, check timestamp)
3. Edit comment and assign to team member B
4. Verify team member A receives "comment reassigned" notification
5. Team member A responds to comment
6. Verify PM receives "response pending review" notification
7. PM approves response
8. Verify original comment creator receives approval notification
9. Check notification history in system:
   - All notifications logged with timestamps
   - Notification status tracked (sent, read, archived)
   - Delivery method correct (email, in-app, SMS)

**Expected Outcomes**:
- Notifications sent immediately upon trigger event
- Email notifications include:
  - Project name and link
  - Comment summary
  - Assigned team member name (if applicable)
  - Deadline (if set)
  - Action button ("View in EntitleFlow")
- In-app notifications appear in notification center
- SMS (if enabled) includes essential info only (character limit)
- Notification history shows all events with delivery confirmation
- Users can manage notification preferences per project/type

**Validation Checklist**:
- [ ] Notifications sent within 30 seconds of trigger
- [ ] Email subject line clear and actionable
- [ ] Email content includes project context
- [ ] Link in email works and loads correct comment
- [ ] In-app notification appears immediately
- [ ] Notification count badge updates
- [ ] Read/unread status toggles correctly
- [ ] User can archive or delete notifications
- [ ] SMS (if enabled) includes critical info
- [ ] Notification history audit trail complete
- [ ] Delivery failures are logged and reported

**Notes**: Test with real email accounts. Check spam folders. Verify SMS character count and formatting.

---

## Scenario 8: Team Invite and Accept Flow

**Objective**: Test adding new team members and permission/access setup.

**Prerequisites**:
- User logged in as Project Manager
- New team member email address: test-eng@example.com

**Steps**:
1. Navigate to project > Team > Invite Members
2. Enter new team member:
   - Email: test-eng@example.com
   - Role: Civil Engineer (select from dropdown)
   - Assign existing comments: Select 3-4 engineering comments
   - Permission level: Member (can view assigned, create responses)
3. Click "Send Invite"
4. Verify invite email received by new team member
5. New team member clicks invite link (or logs in and accepts from inbox)
6. System shows team member as "Pending" → "Active" when accepted
7. New team member logs in and views:
   - Assigned comments visible
   - Only their assigned comments visible (not all)
   - Can create response to assigned comment
   - Cannot access other team members' assigned comments
8. PM views team roster:
   - New member shows as "Active"
   - Role shows correctly
   - Assigned comment count displays
   - Can revoke access if needed

**Expected Outcomes**:
- Invite email contains:
  - Unique invite link
  - Project name and description
  - Assigned role explanation
  - Number of assigned comments
  - Deadline (if applicable)
- New team member can access only assigned content (role-based)
- Permissions enforced:
  - Member: view assigned, comment, create responses
  - Admin: view all, assign, approve, manage team
  - Viewer: read-only access (if applicable)
- Team roster updated in real-time
- Audit log records invite sent and accepted
- Permission changes applied immediately

**Validation Checklist**:
- [ ] Invite email generated correctly
- [ ] Invite link works and doesn't expire during test
- [ ] New member sees correct role on login
- [ ] Permission levels enforced (test each level)
- [ ] Team member can access only assigned comments
- [ ] Cannot view or edit other team members' work
- [ ] PM can view full team roster with status
- [ ] Revoke access immediately disables access
- [ ] Audit trail shows all team events
- [ ] Notification sent to PM when invite accepted

**Notes**: Test both "new user" (creates account on accept) and "existing user" (already has EntitleFlow account) scenarios.

---

## Scenario 9: Comment Filtering and Search

**Objective**: Test filtering and searching comments by various criteria.

**Prerequisites**:
- At least 15-20 comments in system with varied status, departments, and assignments
- Multiple team members with different assignments

**Steps**:
1. Navigate to Comments view
2. Test filter combinations:
   - Filter by Department: Select "Transportation"
     → Result: Only T-1, T-2, T-3, T-4, T-5 display
   - Filter by Status: "Assigned"
     → Result: Only comments with "Assigned" status display
   - Filter by Assignee: Select "Jennifer Rodriguez"
     → Result: Only her assigned comments display
   - Filter by Classification: "MAJOR"
     → Result: Only MAJOR comments display
   - Combine filters: Department=Stormwater AND Status=Responded
     → Result: S-1, S-2, S-3, S-4, S-5 filtered to only "Responded" ones
3. Test search:
   - Search "driveway spacing"
     → Result: T-1 and possibly T-2 (search across comment text)
   - Search "BMP"
     → Result: S-1 and other stormwater comments mentioning BMP
   - Search "NCGS"
     → Result: All comments with code references
   - Search "#T-3"
     → Result: Specific comment by ID
4. Test saved filter views:
   - Save filter: "PM To Review" (Status=Responded, Status≠Approved)
   - View list, verify filter applied
   - Verify saved filters available in dropdown for future use

**Expected Outcomes**:
- Filters apply immediately without page reload
- Filter combinations work correctly (AND logic)
- Search returns results in relevance order
- Search highlights matching terms in results
- Result count updates dynamically
- Filters show count of matching items
- Saved filter views persist across sessions
- Clear filters button resets all selections
- Filter state survives page refresh

**Validation Checklist**:
- [ ] Single filter works correctly for each criterion
- [ ] Multiple filters combine with AND logic
- [ ] Search is case-insensitive
- [ ] Search finds partial matches (e.g., "drive" matches "driveway")
- [ ] Search includes comment text, number, and metadata
- [ ] Result count accurate for each filter combination
- [ ] Save filter function works
- [ ] Saved filters appear in dropdown menu
- [ ] Can delete saved filters
- [ ] Performance acceptable (sub-second filtering for 100+ comments)

**Notes**: Test performance with large comment sets. Verify search doesn't match on irrelevant terms.

---

## Scenario 10: Bulk Operations

**Objective**: Test bulk actions on multiple comments at once.

**Prerequisites**:
- At least 8-10 comments in system, mixed status
- Multiple team members active

**Steps**:
1. Navigate to Comments list view
2. Select 3 unassigned comments (checkboxes)
3. Bulk action: "Assign to Team Member"
   - Assign all 3 to Robert Williams (Stormwater Engineer)
   - Verify all 3 status changed to "Assigned"
4. Select 5 comments with status "Responded"
5. Bulk action: "Approve Selected"
   - Add bulk note: "Approved by PM on [date]"
   - Verify status changed to "Approved"
   - Verify bulk note appears in each comment
6. Select 4 comments (mix of departments)
7. Bulk action: "Add Tag"
   - Add tag: "client-sensitive"
   - Verify tag appears on all 4 comments
8. Bulk action: "Generate Response Letter Preview"
   - Select 6 "Responded" comments
   - Generate preview of letter with only those comments
   - Verify letter includes only selected comments

**Expected Outcomes**:
- Bulk operations apply to all selected items
- Selection persists across multiple operations
- Bulk operations save atomically (all succeed or all fail)
- Undo functionality available for bulk operations
- Bulk action audit trail shows operation and count
- Performance remains acceptable (even with 50+ selected)
- Can select/deselect all with master checkbox
- Selection count displays (e.g., "3 of 25 selected")

**Validation Checklist**:
- [ ] Selection checkboxes function correctly
- [ ] Master "select all" checkbox works
- [ ] Bulk assign changes all statuses
- [ ] Bulk approve adds timestamp and user info
- [ ] Bulk operations are reversible (undo)
- [ ] Audit log records bulk operations as single event (or per item)
- [ ] Cannot assign to invalid role (safety check)
- [ ] Bulk letter preview includes correct comments
- [ ] Performance acceptable with 50+ items selected
- [ ] Clear selection button works

**Notes**: Bulk operations are time-savers. Verify they don't introduce errors or data corruption.

---

## Scenario 11: Cross-Discipline Comment Linking

**Objective**: Test linking related comments across different departments.

**Prerequisites**:
- Comments from multiple departments in system
- Specific comments with dependencies (e.g., stormwater affects parking)

**Steps**:
1. Open Stormwater comment S-1 (BMP basin sizing)
2. Scroll to "Related Comments" section
3. Click "Link Comment"
4. Search for related comment: "parking"
5. Select Zoning comment Z-2 (parking ratio)
6. Add link note: "Reduced parking area reduces impervious surface, affects BMP sizing"
7. Save link
8. Verify bidirectional link:
   - S-1 shows Z-2 as related
   - Z-2 shows S-1 as related
9. View link on both comment cards
10. Click link to navigate between related comments

**Expected Outcomes**:
- Link dialog is intuitive and searchable
- Can search by comment number, text, department, etc.
- Links are bidirectional (linking A to B also links B to A)
- Link notes explain the relationship
- Related comments visible on comment cards (small link indicator)
- Clicking link navigates to related comment
- Can view link relationship map (visual network)
- Links appear in generated documents (highlighted as interdependent)
- Can delete links if created incorrectly

**Validation Checklist**:
- [ ] Link creation successful (no errors)
- [ ] Link appears on both comments
- [ ] Link note is descriptive and helpful
- [ ] Navigation between linked comments works
- [ ] Can view all relationships from either comment
- [ ] Link relationship map displays correctly
- [ ] Links included in resubmittal plan
- [ ] Response letter highlights linked comments
- [ ] Deleting link removes it from both sides
- [ ] System suggests linking when creating comments (if relevant)

**Notes**: Cross-discipline linking is critical for complex projects. Verify links are accurate and helpful, not misleading.

---

## Scenario 12: FlowE Chat About Permit Questions

**Objective**: Test AI chat functionality for answering permit and code questions.

**Prerequisites**:
- FlowE chat interface accessible from project
- Project context loaded (location, project type, TRC letter, etc.)
- AI model configured and responsive

**Steps**:
1. Click "FlowE Chat" from project menu
2. Ask question: "What is the NC code reference for riparian buffer setbacks?"
3. Verify response cites NCGS § 143-214.7 correctly
4. Follow-up: "Does our project meet the riparian buffer requirement?"
5. FlowE references project data:
   - "Your project in Greensboro shows a 4-foot encroachment into the 50-foot riparian buffer (Comment Z-1). This does not meet the standard requirement per NCGS § 143-214.7."
6. Ask: "What is the process for getting a variance?"
7. FlowE explains variance process with NC code references
8. Ask: "Can you draft a response to Comment S-1?"
9. FlowE generates response draft (similar to Scenario 4)
10. Check response quality and accept/edit/reject

**Expected Outcomes**:
- Chat interface loads quickly and is responsive
- AI understands permit/code questions and provides accurate answers
- Responses cite actual NC codes (not hallucinated)
- AI references project-specific data when relevant
- AI can generate drafts for comments when asked
- Chat history persists and is searchable
- Can export chat conversation as PDF or text
- Responses are at appropriate reading level (professional but clear)
- AI admits limitations (e.g., "I cannot provide legal advice")

**Validation Checklist**:
- [ ] Chat loads within 5 seconds
- [ ] Responses appear within 10 seconds
- [ ] Code citations are accurate (verify 3-4 references)
- [ ] Project context is incorporated appropriately
- [ ] AI doesn't hallucinate or invent code sections
- [ ] Generated drafts are professional quality
- [ ] Chat history searchable
- [ ] Can copy/paste responses
- [ ] Export to PDF preserves formatting
- [ ] AI appropriate tone for professional context
- [ ] Error messages clear and helpful if AI fails

**Notes**: Validate all code citations. This is a trust-critical feature. Any hallucinations or wrong citations must be flagged immediately.

---

## Scenario 13: Email Ingestion

**Objective**: Test incoming email ingestion and comment association.

**Prerequisites**:
- Email webhook configured and active
- Sample email data prepared (sample-inbound-email.json)
- Project context established

**Steps**:
1. Simulate incoming email via webhook (or use test email setup):
   - Email from developer: "Question about the driveway spacing comment"
   - Contains attachment: calculations.pdf
   - References Comment T-1 (driveway spacing)
2. System receives email and processes:
   - Recognizes project context
   - Identifies referenced comment (T-1)
   - Associates email with comment
   - Extracts attachments and indexes
3. View in FlowE chat:
   - Email appears as message in comment T-1 chat thread
   - Attachment visible and downloadable
   - System notifies assignee (Jennifer Rodriguez)
4. Jennifer responds in chat:
   - Types response to developer's question
   - References specific plan sheet
   - Attaches revised drawing
5. Email response sent back to developer:
   - Uses professional response template
   - Includes project context
   - Includes attachments

**Expected Outcomes**:
- Email received and parsed successfully
- System correctly identifies associated comment
- Email content appears in comment chat thread
- Attachments properly indexed and searchable
- Assignee notified of incoming email
- Response workflow familiar to team
- Email trail preserved (full history)
- Attachments retained and linked

**Validation Checklist**:
- [ ] Email webhook successfully receives data
- [ ] Email content parsed correctly (headers, body, attachments)
- [ ] Associated comment identified correctly
- [ ] Email appears in comment detail view
- [ ] Attachments visible and downloadable
- [ ] Notification sent to comment assignee
- [ ] Chat response formatted professionally
- [ ] Email response sent to developer
- [ ] Email trail available in audit log
- [ ] Duplicate emails not processed (deduplication works)

**Notes**: Email integration is powerful for team communication. Verify it doesn't create duplicate entries or lose information.

---

## Scenario 14: Permission Levels (Admin vs Member vs Viewer)

**Objective**: Test role-based access control and permission enforcement.

**Prerequisites**:
- Three test users with different roles:
  - Admin (Project Manager: David Chen)
  - Member (Engineer: Sarah Mitchell, assigned comments)
  - Viewer (Stakeholder: read-only access)
- Comments and responses in various states

**Steps**:

**As Admin (PM)**:
1. View all comments (no restrictions)
2. Edit any comment or response
3. Assign/reassign comments to team members
4. Approve responses
5. Invite new team members
6. Change team member roles
7. Delete comments or responses
8. Export all data
9. Access project settings and configuration

**As Member (Engineer)**:
1. View only assigned comments
2. Create response to assigned comment
3. Cannot view unassigned comments
4. Cannot assign comments to others
5. Cannot delete or modify others' responses
6. Cannot change project settings
7. Cannot invite new team members
8. Can see team roster (read-only)

**As Viewer**:
1. View all comments (read-only)
2. Cannot create responses
3. Cannot modify any data
4. Cannot assign or approve
5. Can export view of comments
6. Cannot access chat or internal notes
7. Cannot download attachments (if private)

**Test Enforcement**:
1. Log in as Member, attempt to view unassigned comment → Access denied
2. Log in as Viewer, attempt to create response → Button disabled
3. Log in as Member, attempt to access settings → Menu not visible
4. Test permission changes:
   - Admin changes Member to Viewer
   - Member logs out/in
   - Member can no longer create responses

**Expected Outcomes**:
- Each role sees only allowed data
- Permission enforcement consistent across all views
- Buttons/menus disabled for unauthorized actions (not just hidden)
- API-level enforcement (direct API calls also blocked)
- Permission changes apply immediately after logout/login
- Audit log records all permission changes
- No "permission bypass" vulnerabilities

**Validation Checklist**:
- [ ] Admin can perform all operations
- [ ] Member restricted to assigned content
- [ ] Viewer sees all but cannot modify
- [ ] UI reflects role (buttons disabled, menus hidden)
- [ ] API enforces permissions (try curl requests)
- [ ] Permission changes logged
- [ ] No way to access unauthorized content
- [ ] Chat/internal notes hidden from Viewer
- [ ] Attachments access controlled by permission level
- [ ] Export respects permission level (only exports visible content)

**Notes**: Security-critical test. Any permission bypass should be flagged as critical bug.

---

## Scenario 15: End-to-End Review Cycle (Full Workflow)

**Objective**: Complete full review cycle from document upload to response letter submission.

**Prerequisites**:
- Fresh project "Test Full Cycle"
- Team members invited and active
- No existing comments

**Steps**:

**Phase 1: Upload & Initial Review (1 hour)**
1. PM uploads TRC review letter (greensboro-trc-review-letter.txt)
2. System extracts 25 comments
3. PM reviews comments and assigns to team:
   - Traffic: Jennifer Rodriguez (5 comments)
   - Stormwater: Robert Williams (5 comments)
   - Zoning: David Chen (4 comments)
   - Landscape: Marcus Thompson (3 comments)
   - Utilities: Robert Williams (3 comments)

**Phase 2: Team Response Development (8-16 hours)**
1. Each team member logs in and reviews assigned comments
2. Create responses (either typed or AI-generated):
   - Technical responses with specifics
   - Reference updated plan sheets
   - Cite code/standards as needed
3. Add calculations/studies as attachments
4. Mark each response as "Responded - Pending Review"

**Phase 3: PM Review & Approval (4-8 hours)**
1. PM reviews all responses
2. For incomplete responses: reassign to team member with note
3. Approve responses that meet standard
4. Request revisions for unclear/insufficient responses
5. Team members revise and resubmit

**Phase 4: Document Generation (1 hour)**
1. Generate comprehensive response letter:
   - All 25 comments with responses
   - Professional formatting
   - Plan sheet references
   - Proper grouping by department
2. Generate resubmittal plan showing:
   - Priority items (what to focus on first)
   - Dependencies (what depends on what)
   - Effort estimates
   - Timeline for resubmission
3. Export all documents (Letter + Plan + Attachments)

**Phase 5: Submission & Follow-up (Real-world 2-4 weeks)**
1. Submit response letter to city
2. Log submission in EntitleFlow
3. Track response from city (any follow-up questions)
4. (Test: Simulate incoming email with city follow-up)
5. Create new comments from city follow-up
6. Repeat Phases 2-4 for revised response

**Validation Checklist**:
- [ ] Document parses correctly (25 comments extracted)
- [ ] All comments assigned appropriately
- [ ] All team members can access assigned comments
- [ ] Notifications sent at each stage
- [ ] Response quality is professional and complete
- [ ] PM approval workflow functions smoothly
- [ ] Generated letter is complete and properly formatted
- [ ] Resubmittal plan shows logical sequence
- [ ] Export includes all necessary documents
- [ ] Submission logged with timestamp
- [ ] Follow-up email ingestion works
- [ ] New comments from city handled correctly
- [ ] Time tracking shows realistic effort (if enabled)
- [ ] No data loss throughout cycle
- [ ] Audit trail shows all changes

**Expected Outcomes**:
- Full cycle completes successfully with professional output
- All comments addressed in response letter
- Generated documents are client-ready (no manual editing needed)
- Team communication flows smoothly via notifications
- System tracks progress and timeline
- Resubmittal plan helps prioritize work
- Follow-up iterations handled efficiently

**Final Validation Notes**:
This is the most important test. It validates:
- End-to-end functionality (no broken links in workflow)
- Document quality (professional output)
- Team collaboration (communication and coordination)
- Time tracking and effort estimation
- Audit and compliance (all actions logged)
- Performance under realistic load (25+ comments, 6 team members)

---

## Test Completion Checklist

After completing all 15 scenarios, verify:
- [ ] No critical bugs encountered
- [ ] No data loss in any scenario
- [ ] All notifications delivered correctly
- [ ] Performance acceptable throughout (no timeouts)
- [ ] Generated documents are professional quality
- [ ] Team workflow is intuitive and efficient
- [ ] Security and permissions enforced consistently
- [ ] System stable under full load (comments, users, attachments)
- [ ] Audit trail complete for compliance
- [ ] User experience intuitive (minimal training needed)

---
