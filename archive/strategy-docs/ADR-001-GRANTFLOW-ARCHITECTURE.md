# ADR-001: GrantFlow — Elite Nonprofit Grant Platform Architecture

**Status:** Proposed
**Date:** 2026-03-29
**Deciders:** Jene (Founder/Architect)
**Platform Base:** EntitleFlow Shell (Next.js 16 + Supabase + GCP + Vertex AI)

---

## Context

EntitleFlow has a production-grade platform shell — auth, RBAC (4 roles, 40+ permissions), AI agent layer (6 agents, Gemini + MiMo hybrid), Document AI pipeline, real-time dashboard, notifications, and multi-tenant data isolation. The codebase audit confirms 65-70% direct code reuse and 85-90% architecture reuse for any new vertical product.

Jene has direct relationships with university teams and nonprofit organizations where people are writing grants manually — spreadsheets, email chains, Word docs passed between team members with no structured workflow. This is the same broken process that EntitleFlow solves for permit reviews, just in a different domain.

The grant management software market is valued at $3.07B (2025) growing to $8.09B by 2035 (10.17% CAGR). The top 5 incumbents hold only 23% combined market share, indicating heavy fragmentation and room for a focused, AI-native entrant. Most existing tools are either (a) enterprise grant management suites (Blackbaud, Salesforce) that are expensive and complex, or (b) AI grant writing tools (GrantBoost, Grantable) that only help draft proposals without managing the full lifecycle.

**The gap:** No platform combines AI-powered grant creation + structured scoring + team workflow education + SOP standardization + project management in a single product designed for small-to-mid nonprofits.

---

## Decision

Build GrantFlow as a comprehensive nonprofit operations platform on the EntitleFlow shell, with five core modules:

1. **Grant Creation Engine** — AI-assisted proposal building with funder-aligned templates
2. **Scoring & Review System** — Configurable rubric engine adapted from federal methodologies
3. **Workflow Education Hub** — Team training system (NOT branded as AI) for grant writing SOPs
4. **SOP Factory** — Standardized operating procedure creation, versioning, and compliance tracking
5. **Grant Project Management** — Deadline-driven task coordination across the full grant lifecycle

FlowE AI agents power all five modules but are surfaced as "workflow intelligence" — the platform brands itself around process and education, not artificial intelligence.

---

## Module 1: Grant Creation Engine

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   GRANT CREATION ENGINE                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │ Funder       │───▶│ Template     │───▶│ Section   │ │
│  │ Profile      │    │ Selector     │    │ Builder   │ │
│  │ Database     │    │              │    │           │ │
│  └──────────────┘    └──────────────┘    └─────┬─────┘ │
│                                                │       │
│  ┌──────────────┐    ┌──────────────┐    ┌─────▼─────┐ │
│  │ Budget       │◀──▶│ Narrative    │◀──▶│ Compliance│ │
│  │ Builder      │    │ Editor       │    │ Checker   │ │
│  │              │    │              │    │           │ │
│  └──────────────┘    └──────────────┘    └───────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              FlowE Grant Assistant                │   │
│  │  (Conversational guide through proposal process)  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Funder Profile Database

A structured knowledge base of funders that FlowE agents query during proposal creation.

**Schema: `funders` table**
```sql
CREATE TABLE funders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  funder_type TEXT CHECK (funder_type IN (
    'federal', 'state', 'local_government',
    'community_foundation', 'private_foundation',
    'corporate', 'family_foundation'
  )),
  focus_areas TEXT[],           -- e.g., ['education', 'health', 'environment']
  geographic_focus TEXT[],      -- e.g., ['North Carolina', 'Southeast US']
  typical_award_range INT4RANGE,-- e.g., [5000, 50000]
  application_cycles JSONB,    -- deadlines, rolling vs. fixed
  required_sections TEXT[],    -- what the proposal must include
  scoring_criteria JSONB,      -- funder-specific rubric if known
  compliance_requirements TEXT[],
  website TEXT,
  portal_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Grant Proposal Structure

**Schema: `grant_proposals` table**
```sql
CREATE TABLE grant_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  funder_id UUID REFERENCES funders(id),
  title TEXT NOT NULL,
  status TEXT CHECK (status IN (
    'draft', 'internal_review', 'scoring',
    'revision', 'ready_to_submit', 'submitted',
    'under_review', 'revision_requested',
    'accepted', 'rejected', 'funded', 'closed'
  )),
  proposal_type TEXT CHECK (proposal_type IN (
    'program_grant', 'project_grant', 'capacity_building',
    'general_operating', 'capital', 'fellowship',
    'planning_grant', 'seed_funding'
  )),
  amount_requested DECIMAL(12,2),
  amount_awarded DECIMAL(12,2),
  submitted_at TIMESTAMPTZ,
  decision_date DATE,
  grant_period_start DATE,
  grant_period_end DATE,
  sections JSONB,              -- structured proposal sections
  budget JSONB,                -- line-item budget with justifications
  attachments TEXT[],          -- GCS document references
  ai_score JSONB,              -- FlowE scoring results
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Section Builder

Proposals are composed of configurable sections that vary by funder. The Section Builder provides:

- **Template library** — Pre-built section templates by proposal type (federal, foundation, corporate)
- **Guided prompts** — FlowE asks targeted questions to help teams fill each section
- **Version tracking** — Every edit creates a version snapshot for audit trail
- **Collaborative editing** — Multiple team members work on sections simultaneously with role-based access (writer, reviewer, approver)

**Standard Sections (configurable per funder):**
1. Executive Summary / Abstract
2. Statement of Need / Problem Statement
3. Goals & Objectives (SMART framework)
4. Methods / Approach / Activities
5. Evaluation Plan (logic model + metrics)
6. Organizational Capacity
7. Budget & Budget Narrative
8. Sustainability Plan
9. Timeline / Milestones
10. Letters of Support (tracking)

### Budget Builder

A structured budget tool that generates both the line-item budget and the narrative justification.

**Budget Categories:**
- Personnel (salaries, benefits, % FTE)
- Fringe Benefits (calculated from org rates)
- Travel (itemized by purpose)
- Equipment (>$5,000 items)
- Supplies
- Contractual / Consultant
- Other Direct Costs
- Indirect Costs (negotiated rate or de minimis 10%)

**FlowE Budget Agent capabilities:**
- Auto-calculates fringe from salary inputs
- Validates indirect cost rates against funder limits
- Flags budget items that commonly trigger reviewer questions
- Generates budget narrative paragraphs from line items

---

## Module 2: Scoring & Review System

### Research Foundation

The scoring engine synthesizes methodologies from three tiers:

**Tier 1 — Federal Scoring (NIH/NSF adapted)**
- NIH Simplified Framework (2025): 3 factors — Importance of Research, Rigor & Feasibility, Expertise & Resources
- NSF Merit Review: Intellectual Merit + Broader Impacts + Commercial Potential
- 1-9 scale with binary sufficiency gates

**Tier 2 — Foundation/Community Scoring**
- Weighted rubric matrices (criteria × weight = score)
- Common criteria: Need/Relevance, Approach, Capacity, Budget, Impact, Sustainability
- Rating scales: Excellent (4) / Good (3) / Adequate (2) / Poor (1)

**Tier 3 — Internal Pre-Submission Scoring**
- Organization-specific quality checks before submission
- Completeness verification
- Alignment-to-funder scoring

### Scoring Engine Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    SCORING ENGINE                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────┐     ┌─────────────────────────┐  │
│  │ RUBRIC BUILDER       │     │ SCORING DASHBOARD       │  │
│  │                      │     │                         │  │
│  │ • Select template    │     │ • Radar chart by        │  │
│  │   (Federal/Foundation│     │   criterion             │  │
│  │   /Custom)           │     │ • Score trend over      │  │
│  │ • Define criteria    │     │   revisions             │  │
│  │ • Set weights        │     │ • Peer comparison       │  │
│  │ • Configure scale    │     │   (anonymized)          │  │
│  │                      │     │ • Improvement roadmap   │  │
│  └──────────┬───────────┘     └────────────▲────────────┘  │
│             │                              │               │
│  ┌──────────▼──────────────────────────────┴────────────┐  │
│  │              DUAL SCORING PATHWAY                     │  │
│  │                                                       │  │
│  │  ┌─────────────────┐     ┌─────────────────────────┐ │  │
│  │  │ AI PRE-SCORE    │     │ HUMAN REVIEW SCORE      │ │  │
│  │  │                 │     │                         │ │  │
│  │  │ FlowE analyzes  │     │ Team members score      │ │  │
│  │  │ each section    │     │ using same rubric       │ │  │
│  │  │ against rubric  │     │ with comments           │ │  │
│  │  │ + funder prefs  │     │ + discussion threads    │ │  │
│  │  │                 │     │                         │ │  │
│  │  │ Output:         │     │ Output:                 │ │  │
│  │  │ • Section scores│     │ • Reviewer scores       │ │  │
│  │  │ • Gap analysis  │     │ • Consensus score       │ │  │
│  │  │ • Suggestions   │     │ • Qualitative feedback  │ │  │
│  │  └────────┬────────┘     └──────────┬──────────────┘ │  │
│  │           │                         │                 │  │
│  │           ▼                         ▼                 │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │           COMPOSITE SCORE + REPORT             │   │  │
│  │  │  Weighted AI + Human scores with confidence    │   │  │
│  │  │  interval and submission readiness indicator    │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Default Scoring Rubric (Nonprofit Standard)

| Criterion | Weight | Scale | Description |
|---|---|---|---|
| Statement of Need | 20% | 1-5 | Clarity, data-backed, community relevance |
| Goals & Objectives | 15% | 1-5 | SMART criteria, alignment to need |
| Methods & Approach | 20% | 1-5 | Feasibility, innovation, evidence-based |
| Evaluation Plan | 15% | 1-5 | Logic model, measurable outcomes, data collection |
| Organizational Capacity | 10% | 1-5 | Track record, team qualifications, partnerships |
| Budget & Justification | 10% | 1-5 | Reasonable, complete, well-justified |
| Sustainability | 10% | 1-5 | Long-term viability, diversified funding |

**Total: 100% weighted score → normalized to 0-100**

### AI Scoring Agent Adaptation

Reuses the Comment Analyst agent architecture with new category enums:

```typescript
// Current EntitleFlow categories
type PermitCategory = 'parking_access' | 'stormwater' | 'building_code' | ...

// GrantFlow scoring categories
type GrantScoringCategory =
  | 'statement_of_need'
  | 'goals_objectives'
  | 'methods_approach'
  | 'evaluation_plan'
  | 'organizational_capacity'
  | 'budget_justification'
  | 'sustainability'
  | 'compliance'
  | 'timeline_feasibility'
  | 'community_impact'
  | 'innovation'
  | 'equity_inclusion';
```

### Scoring Database

```sql
CREATE TABLE scoring_rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  rubric_type TEXT CHECK (rubric_type IN (
    'federal_nih', 'federal_nsf', 'foundation_standard',
    'community_foundation', 'custom'
  )),
  criteria JSONB NOT NULL,     -- [{name, weight, scale_min, scale_max, description}]
  is_default BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE proposal_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES grant_proposals(id),
  rubric_id UUID REFERENCES scoring_rubrics(id),
  scorer_type TEXT CHECK (scorer_type IN ('ai', 'human')),
  scorer_id UUID,              -- user ID for human, null for AI
  scores JSONB NOT NULL,       -- [{criterion, score, max_score, weight, comments}]
  composite_score DECIMAL(5,2),
  confidence DECIMAL(3,2),     -- AI confidence 0-1
  recommendations TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Module 3: Workflow Education Hub

### Philosophy

**Branded as "Workflow Academy" — NOT as AI education.**

Teams learn grant writing and project management through structured pathways, guided exercises, and SOP-driven workflows. FlowE powers the adaptive learning engine behind the scenes, but the interface presents it as a guided workflow system with best practices from the grant writing field.

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  WORKFLOW ACADEMY                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────┐  │
│  │ LEARNING        │  │ GUIDED          │  │ TEAM      │  │
│  │ PATHWAYS        │  │ EXERCISES       │  │ PROGRESS  │  │
│  │                 │  │                 │  │ TRACKER   │  │
│  │ • Grant Writing │  │ • Write a need  │  │           │  │
│  │   Fundamentals  │  │   statement     │  │ • Member  │  │
│  │ • Budget Mastery│  │ • Build a logic │  │   scores  │  │
│  │ • Evaluation    │  │   model         │  │ • Module  │  │
│  │   Design        │  │ • Draft budget  │  │   completion│ │
│  │ • Compliance &  │  │   narrative     │  │ • Skill   │  │
│  │   Reporting     │  │ • Review & score│  │   badges  │  │
│  │ • Team PM       │  │   a proposal    │  │           │  │
│  └────────────────┘  └────────────────┘  └───────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │              SOP-DRIVEN WORKFLOW GUIDES           │    │
│  │  Step-by-step procedures for every grant stage    │    │
│  │  (Pre-app → Draft → Review → Submit → Report)    │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### Learning Pathways

| Pathway | Modules | Target Audience |
|---|---|---|
| Grant Writing Fundamentals | 8 modules | New grant writers, program staff |
| Budget Mastery | 5 modules | Finance staff, grant coordinators |
| Evaluation Design | 6 modules | Program managers, evaluators |
| Compliance & Reporting | 4 modules | Admin, finance, compliance officers |
| Team Project Management | 5 modules | Grant coordinators, team leads |
| Funder Relations | 4 modules | Development directors, ED |

### Database

```sql
CREATE TABLE learning_pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  modules JSONB NOT NULL,      -- [{id, title, content_key, order, estimated_minutes}]
  target_roles TEXT[],
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE team_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  pathway_id UUID REFERENCES learning_pathways(id),
  module_index INT,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score DECIMAL(5,2),          -- exercise score if applicable
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Revenue Model: Workflow Education as Add-On

- **Base subscription** includes 2 learning pathways
- **Workflow Academy Pro** add-on: $200/mo — all pathways + custom SOP creation + team analytics
- **Custom SOP Development** service: $500-2,000 per engagement (Jene's consulting offer)

---

## Module 4: SOP Factory

### Why This Is a Business Model

Nonprofits struggle with institutional knowledge loss, staff turnover, and inconsistent processes. Most small nonprofits have zero documented SOPs. By providing a structured SOP creation and management system, GrantFlow becomes sticky infrastructure — teams that standardize on the platform have much higher switching costs.

### SOP Types for Nonprofits

| SOP Category | Examples |
|---|---|
| Grant Lifecycle | Pre-application research, Proposal writing, Submission, Post-award setup |
| Financial Management | Budget creation, Expense tracking, Cost allocation, Audit prep |
| Compliance | Funder reporting, Document retention, Conflict of interest |
| Team Operations | Onboarding new grant writers, Review workflows, Approval chains |
| Program Management | Outcome tracking, Data collection, Stakeholder communication |
| Board Governance | Grant approval process, Reporting to board, Policy updates |

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     SOP FACTORY                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────┐  │
│  │ TEMPLATE        │  │ BUILDER         │  │ VERSION   │  │
│  │ LIBRARY         │  │                 │  │ CONTROL   │  │
│  │                 │  │ • Step-by-step  │  │           │  │
│  │ • 50+ pre-built │  │   editor        │  │ • Track   │  │
│  │   nonprofit SOPs│  │ • Role          │  │   changes │  │
│  │ • Industry      │  │   assignment    │  │ • Approval│  │
│  │   standards     │  │ • Time          │  │   workflow│  │
│  │ • Funder-       │  │   estimates     │  │ • Audit   │  │
│  │   specific      │  │ • Checklists    │  │   trail   │  │
│  └────────────────┘  └────────────────┘  └───────────┘  │
│                                                          │
│  ┌────────────────┐  ┌────────────────────────────────┐  │
│  │ COMPLIANCE      │  │ ACTIVE WORKFLOW INTEGRATION    │  │
│  │ TRACKER         │  │                                │  │
│  │                 │  │ SOPs become live checklists     │  │
│  │ • Due dates     │  │ inside grant projects — not    │  │
│  │ • Completion %  │  │ just documents, but enforced   │  │
│  │ • Audit logs    │  │ process steps with sign-offs   │  │
│  └────────────────┘  └────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Database

```sql
CREATE TABLE sop_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  is_system_template BOOLEAN DEFAULT false,  -- pre-built vs custom
  steps JSONB NOT NULL,        -- [{order, title, description, responsible_role, estimated_minutes, checklist_items}]
  version INT DEFAULT 1,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sop_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES sop_templates(id),
  proposal_id UUID REFERENCES grant_proposals(id),
  organization_id UUID REFERENCES organizations(id),
  status TEXT CHECK (status IN ('active', 'completed', 'paused')),
  current_step INT DEFAULT 0,
  step_completions JSONB,      -- [{step_index, completed_by, completed_at, notes}]
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

### Key Differentiator: SOPs as Live Workflows

Unlike static PDF SOPs, GrantFlow SOPs become **active checklists** embedded in grant projects. When a team starts a new grant proposal, the appropriate SOPs auto-attach as enforceable process steps. Team leads see completion percentages. Compliance officers get audit trails.

---

## Module 5: Grant Project Management

### Lifecycle Stages

```
┌──────┐  ┌──────────┐  ┌────────┐  ┌──────────┐  ┌───────────┐
│DISCOVER│─▶│ PREPARE  │─▶│ DRAFT  │─▶│ REVIEW   │─▶│  SUBMIT   │
│        │  │          │  │        │  │          │  │           │
│Funder  │  │Eligibility│ │Sections│  │Internal  │  │Portal     │
│research│  │check     │  │Budget  │  │scoring   │  │submission │
│Fit     │  │Team      │  │Narrative│ │Revisions │  │Confirm    │
│scoring │  │assembly  │  │Attach  │  │Approval  │  │Receipt    │
└──────┘  └──────────┘  └────────┘  └──────────┘  └─────┬─────┘
                                                         │
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────▼──────┐
│  CLOSE   │◀─│ REPORT   │◀─│ EXECUTE  │◀─│   AWARD / REJECT   │
│          │  │          │  │          │  │                    │
│Final     │  │Funder    │  │Program   │  │Decision received   │
│report    │  │progress  │  │delivery  │  │Award letter parsed │
│Lessons   │  │reports   │  │Budget    │  │Grant period set    │
│learned   │  │Outcome   │  │tracking  │  │Reporting schedule  │
│Archive   │  │metrics   │  │Compliance│  │created             │
└──────────┘  └──────────┘  └──────────┘  └────────────────────┘
```

### Reuse from EntitleFlow

| EntitleFlow Component | GrantFlow Equivalent | Reuse % |
|---|---|---|
| Projects table + CRUD | Grant Campaigns (groups of proposals) | 90% |
| Permits table + status | Grant Proposals + lifecycle status | 85% |
| permit_status_history | proposal_status_history (same pattern) | 100% |
| Comments + resolution | Funder feedback + response tracking | 95% |
| Tasks/deadline view | Grant deadline dashboard | 90% |
| Document upload + parse | Proposal docs + funder guidelines upload | 85% |
| Team management + RBAC | Nonprofit team roles + permissions | 95% |
| Notifications | Grant event notifications | 90% |
| Activity audit log | Grant activity audit trail | 100% |
| AI agents (6 agents) | Adapted agents (same base, new prompts) | 70% |

### Deadline Intelligence

The #1 pain point in nonprofit grant management is **missed deadlines**. GrantFlow builds deadline intelligence into every layer:

- **Auto-reminders**: 60, 30, 14, 7, 3, 1 days before submission deadlines
- **Dependency tracking**: "Budget narrative due before internal review can start"
- **Capacity alerts**: "Your team has 3 proposals due within the same 2-week window"
- **Funder cycle tracking**: Annual application windows auto-populate from Funder Profiles
- **Report deadline chains**: Post-award reporting deadlines auto-generate from grant period

---

## FlowE Agent Adaptations

### Agent Persona Mapping

| EntitleFlow Agent | GrantFlow Agent | Role |
|---|---|---|
| FlowE Assistant | **FlowE Grant Guide** | Navigate platform, answer grant writing questions, guide through SOPs |
| Comment Analyst | **Proposal Reviewer** | Score proposals against rubrics, classify feedback by category |
| Response Drafter | **Grant Writer** | Draft proposal sections, budget narratives, funder response letters |
| Document Strategist | **Funder Analyst** | Analyze funder guidelines, RFPs, score alignment, extract requirements |
| Compliance Advisor | **Compliance Checker** | Verify eligibility, check budget limits, flag missing requirements |
| Resubmittal Planner | **Revision Planner** | Plan re-application from funder feedback, prioritize revisions |

### New Agent: SOP Coach

A seventh agent specific to GrantFlow:

**SOP Coach** — Guides teams through standard operating procedures step by step. Can answer questions about why each step matters, suggest improvements based on team patterns, and flag when a team is deviating from their established procedures.

### Branding Rule

All agent interactions are surfaced as:
- "Workflow suggestions" (not "AI recommendations")
- "Smart analysis" (not "AI scoring")
- "Guided workflows" (not "AI-powered workflows")
- "FlowE" name is retained as the platform assistant brand

---

## Competitive Positioning

### Market Landscape

| Competitor | Type | Weakness | GrantFlow Advantage |
|---|---|---|---|
| **Blackbaud** | Enterprise suite | $$$, complex, slow | Affordable, fast setup, AI-native |
| **Instrumentl** | Grant discovery + tracking | No proposal creation | Full creation + scoring + management |
| **Grantable** | AI writing tool | Only drafts, no workflow | Complete lifecycle platform |
| **GrantBoost** | AI writing tool | No team collaboration | Team-first with RBAC |
| **Submittable** | Application management | For grantmakers, not writers | Built for grant writing teams |
| **grantflow.com** | Services company | Manual, consulting-based | Self-serve platform + education |
| **Foundant** | Grant management | Grantmaker-focused | Applicant-side focus |
| **AmpliFund** | Post-award management | No creation or scoring | Full lifecycle from creation to close |

### Unique Differentiators

1. **Scoring + Creation in one platform** — No competitor does both well
2. **SOP-as-workflow** — SOPs aren't documents; they're enforced process steps
3. **Workflow education built in** — Teams get better at grant writing over time
4. **Relationship-based distribution** — Jene's personal network = warm leads with zero CAC
5. **AI-native but AI-invisible** — Power of AI without the nonprofit skepticism

---

## Pricing Architecture

| Tier | Price | Includes |
|---|---|---|
| **Starter** | $495/mo | 3 seats, 5 active proposals, basic scoring, 2 learning pathways |
| **Growth** | $950/mo | 10 seats, unlimited proposals, custom rubrics, all pathways, SOP builder |
| **Pro** | $1,500/mo | 25 seats, API access, white-label reports, priority support, custom SOPs |
| **FlowE Intelligence** | +$25/seat/mo | AI-powered scoring, draft generation, compliance checking |

**Why lower price point than EntitleFlow:**
- Nonprofits have smaller budgets (typically $50K-500K annual operating)
- Higher volume opportunity (300K+ nonprofits in the US)
- Lower churn (2% vs 3-4%) due to relationship distribution + sticky SOPs
- Workflow Academy and Custom SOP services are revenue multipliers

**Revenue Streams:**
1. SaaS subscription (primary)
2. FlowE Intelligence add-on (per-seat AI)
3. Workflow Academy Pro add-on ($200/mo)
4. Custom SOP Development services ($500-2,000 per engagement)
5. Funder database premium access (future)

---

## Technical Implementation Plan

### Phase 1: Foundation (Weeks 1-2)
- [ ] Fork EntitleFlow shell, rename domain entities
- [ ] Create database migrations (funders, grant_proposals, scoring_rubrics, proposal_scores, sop_templates, sop_instances, learning_pathways, team_progress)
- [ ] Adapt RBAC permission matrix for grant roles
- [ ] Reskin dashboard with GrantFlow branding and purple (#7c3aed) accent

### Phase 2: Grant Creation (Weeks 2-3)
- [ ] Build funder profile CRUD
- [ ] Implement section builder with template library
- [ ] Build budget builder with auto-calculations
- [ ] Adapt FlowE Grant Writer agent (new system prompts)
- [ ] Adapt Funder Analyst agent for RFP analysis

### Phase 3: Scoring Engine (Weeks 3-4)
- [ ] Build rubric builder UI (custom criteria + weights)
- [ ] Implement AI scoring via Proposal Reviewer agent
- [ ] Build human review scoring interface
- [ ] Composite score calculation + radar chart visualization
- [ ] Submission readiness indicator

### Phase 4: SOP Factory + Workflow Education (Weeks 4-5)
- [ ] Build SOP template library (seed 20+ nonprofit SOPs)
- [ ] Implement SOP builder with step editor
- [ ] Wire SOPs as active checklists in grant projects
- [ ] Build learning pathway viewer + progress tracker
- [ ] Implement SOP Coach agent

### Phase 5: Polish + Launch Prep (Week 6)
- [ ] End-to-end testing with sample proposals
- [ ] Deadline intelligence and notification system
- [ ] Onboarding flow for first-time nonprofit teams
- [ ] Marketing site (reskin from EntitleFlow marketing shell)
- [ ] Beta launch to 5-10 nonprofits from Jene's network

---

## Consequences

### What Becomes Easier
- Nonprofits have a single platform for the entire grant lifecycle
- Teams improve over time through structured learning (not just tools)
- SOPs create organizational resilience against staff turnover
- AI scoring catches gaps before funder rejection
- Jene's relationship network provides immediate warm distribution

### What Becomes Harder
- Maintaining two product codebases (even with shared shell)
- Nonprofit-specific compliance knowledge (varies by funder type)
- Ensuring AI scoring is calibrated to actual funder preferences
- Managing expectations around "not-AI-branded" AI features

### What We'll Need to Revisit
- Domain name (grantflow.com is taken — candidates: GrantForge, ProposalFlow, FundFlow, GrantPilot)
- Pricing validation with actual nonprofit budgets
- Funder database sourcing strategy (manual vs. API partnerships)
- Integration with existing tools nonprofits use (QuickBooks, Salesforce Nonprofit)

---

## Action Items

1. [ ] **Domain & Brand**: Finalize product name (alternatives to GrantFlow since .com is taken)
2. [ ] **Database Design**: Create full Supabase migration from schemas above
3. [ ] **Agent Prompts**: Write system prompts for all 7 GrantFlow agents
4. [ ] **SOP Library**: Draft first 20 nonprofit SOP templates
5. [ ] **Scoring Calibration**: Test AI scoring against actual funded vs. rejected proposals
6. [ ] **Funder Database Seed**: Build initial database of NC-based funders (foundations, government programs)
7. [ ] **Beta Outreach**: Identify 10 nonprofits from Jene's network for beta program
8. [ ] **Learning Content**: Write curriculum for Grant Writing Fundamentals pathway
