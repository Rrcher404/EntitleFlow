# EntitleFlow Test Fixtures

This folder contains realistic test data for manual QA testing of EntitleFlow, a land entitlement operations platform focused on managing development review processes in North Carolina.

## Test Files Overview

### Review Letters (review-letters/)

These simulate actual Technical Review Committee (TRC) review letters from NC municipalities. Each contains realistic department comments, code references, and varied comment clarity levels.

**greensboro-trc-review-letter.txt**
- City: Greensboro, NC
- Project: Riverside Mixed-Use Development (1234 Riverside Dr)
- Permit #: SP-2026-0142
- Comments: 25+ multi-disciplinary comments
- **Use Case**: Upload to test document parsing, comment extraction, department-based filtering, and comment assignment workflow
- **Expected Outcome**: System extracts all 25+ comments, groups them by department, suggests assignments to team members based on their roles

**raleigh-site-plan-review.txt**
- City: Raleigh, NC
- Project: Tech Park Phase 2 Expansion
- Comments: 18 comments with Raleigh's specific format and departmental structure
- **Use Case**: Test handling different municipal formats and comment types
- **Expected Outcome**: Correct parsing despite different formatting conventions

**charlotte-subdivision-review.txt**
- City: Charlotte, NC
- Project: Brookside Subdivision (8 lots)
- Comments: 15 comments focused on subdivision (not site plan) requirements
- **Use Case**: Test subdivision-specific review workflows
- **Expected Outcome**: Proper categorization as subdivision vs. site plan project type

**durham-review-comments.txt**
- City: Durham, NC
- Project: Downtown Office Complex (2 phases)
- Comments: 12 comments
- **Use Case**: Test with smaller, focused comment sets and phased project handling
- **Expected Outcome**: Correct handling of phased approval conditions

### Sample Responses (sample-responses/)

**response-template.txt**
- Standard NC response letter format showing:
  - Proper addressing convention
  - Point-by-point responses to TRC comments
  - Code citations (GS § references, NCGS references)
  - Conditions of approval language
  - Signature blocks and certification
- **Use Case**: Reference template for generating response letters; training data for AI response generation
- **Expected Outcome**: Generated responses follow this format and tone

### Team Test Data (team-test-data/)

**team-members.json**
- 6 realistic team member profiles:
  - PM (overall coordination)
  - Civil Engineer (grading, drainage, utilities)
  - Landscape Architect (landscaping, tree save, buffers)
  - Traffic/Transportation Engineer (driveway, sight distance, turn lanes)
  - Stormwater/Utilities Engineer (BMPs, detention, easements)
  - Architect (building setbacks, signage, parking)
- **Use Case**: Test team assignment logic, role-based filtering, notification routing
- **Expected Outcome**: Comments auto-assign to appropriate team members based on department and role

**test-scenarios.md**
- 15 comprehensive test scenarios covering the full user journey:
  1. Upload document and verify parsing
  2. Assign comments to team members
  3. Resolve comments with internal notes
  4. Generate AI response for a comment
  5. Generate resubmittal plan
  6. Generate response letter
  7. Test notification delivery
  8. Team invite/accept flow
  9. Comment filtering and search
  10. Bulk operations
  11. Cross-discipline comment linking
  12. FlowE chat about permit questions
  13. Email ingestion
  14. Permission levels (admin/member/viewer)
  15. End-to-end review cycle
- **Use Case**: Step-by-step test procedures with expected outcomes
- **Expected Outcome**: All scenarios complete without errors; outputs match specifications

### Email Test Data (email-test-data/)

**sample-inbound-email.json**
- Webhook payload simulating:
  - Incoming developer email with permit questions
  - Attachments (plans, calculations)
  - Reply-to chain context
- **Use Case**: Test email ingestion, parsing, and chat integration
- **Expected Outcome**: Email content appears in FlowE chat; attachments indexed

**sample-jurisdiction-email.json**
- Webhook payload for jurisdiction correspondence:
  - Request for clarification
  - Revised comment from city reviewer
  - Request for extension
- **Use Case**: Test jurisdiction communication workflows
- **Expected Outcome**: Comments properly tagged as updates; notifications sent to relevant team members

## How to Use These Files

### Standard QA Workflow

1. **Start Fresh**: Create a new test project in EntitleFlow
2. **Upload Review Letter**: Use one of the review letter files
   - Expected: System extracts all comments, displays comment count
   - Verify: Each comment appears in comment list with correct department/reviewer info

3. **Assign Comments**: Using team-members.json as reference, manually assign comments
   - Expected: Assignments route to appropriate roles
   - Verify: Team members notified of assignments

4. **Add Responses**: For each comment, add typed or AI-generated response
   - Expected: Responses save with timestamp, assignee, status
   - Verify: Comment status changes from "open" to "responded"

5. **Generate Documents**: Create response letter and resubmittal plan
   - Expected: Documents follow response-template.txt format
   - Verify: All comments addressed; no orphaned responses

6. **Test Email Integration**: POST sample-inbound-email.json to email webhook
   - Expected: Email appears in chat; QuillBot or FlowE responds
   - Verify: Context from review letter is referenced in chat

7. **Test Team Flow**: Invite team members, test permission levels
   - Expected: Different views based on role (admin sees all, member sees assigned only, viewer sees read-only)
   - Verify: Permissions enforced correctly

### Comment Complexity Levels

**Clear/Actionable Comments** (Test straightforward resolution)
- Specific code references
- Measurable requirements
- Obvious department owner
- Example: Stormwater—"Provide BMP calculation per NC DWI specs"

**Vague/Ambiguous Comments** (Test AI response generation)
- Subjective requirements
- Cross-department implications
- Unclear success criteria
- Example: Planning—"Design should better integrate with character of neighborhood"

**Cross-Disciplinary Comments** (Test comment linking)
- Require coordination between multiple departments
- Example: A traffic comment about driveway affects stormwater outfall placement

## Expected System Behaviors

### Document Upload
- Recognizes file type (text, PDF, email)
- Extracts comments (or shows manual entry if parsing fails)
- Associates comments with project
- Indexes for search

### Comment Management
- Display in list, table, and spatial views
- Filter by department, status, assignee, priority
- Link related comments across disciplines
- Track resolution status and timestamps

### Team Workflows
- Invite team members by email
- Route assignments based on role/expertise
- Send notifications (email, in-app)
- Track who responded and when
- Generate response letter consolidating all responses

### AI Features
- Generate response text suggestions based on comment and project context
- Draft resubmittal plans with ranked items
- Generate complete response letters
- Chat with FlowE about permit requirements

### Email Integration
- Parse inbound emails
- Extract questions and attach to comments
- Route to appropriate team members
- Auto-respond or flag for manual response

## Notes for Testers

- All data is fictional but realistic for NC land development
- Code references are real (e.g., GS § 143-214.7, NC DWI standards)
- Department names and comment styles match actual NC municipal processes
- Test both "happy path" (all comments resolved) and "problem path" (conflicts, escalations)
- Pay attention to notification accuracy—critical for team coordination
- Comment parsing accuracy is high-value; test with malformed text variants
