-- ============================================================================
-- Migration 00004: FlowE Knowledge System
--
-- Creates the knowledge base tables that power FlowE's dynamic context
-- injection. This enables "training" FlowE without model fine-tuning by
-- storing retrievable knowledge entries that get injected at inference time.
-- ============================================================================

-- FlowE Knowledge Base — domain knowledge, FAQ, corrections, examples
CREATE TABLE IF NOT EXISTS flowe_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Categorization
  category TEXT NOT NULL CHECK (category IN (
    'nc_code',           -- NC building/fire/plumbing codes
    'jurisdiction',      -- Municipal processes, local ordinances
    'platform',          -- EntitleFlow feature knowledge
    'workflow',          -- Best practices, how-to guides
    'faq',               -- Common questions and answers
    'correction',        -- Corrected answers (learning from mistakes)
    'few_shot'           -- Example Q&A pairs for few-shot prompting
  )),

  -- Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,

  -- Retrieval metadata
  keywords TEXT[] NOT NULL DEFAULT '{}',  -- Keywords for matching
  tags TEXT[] NOT NULL DEFAULT '{}',      -- Organizational tags

  -- For few_shot category: the example question
  example_question TEXT,
  -- For few_shot category: the ideal response
  example_response TEXT,

  -- Provenance
  source TEXT,                            -- Where this knowledge came from
  source_url TEXT,                        -- Link to source material
  confidence REAL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),

  -- Scoping
  organization_id UUID REFERENCES organizations(id),  -- NULL = global knowledge

  -- Lifecycle
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for keyword-based retrieval
CREATE INDEX IF NOT EXISTS idx_flowe_knowledge_keywords ON flowe_knowledge USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_flowe_knowledge_tags ON flowe_knowledge USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_flowe_knowledge_category ON flowe_knowledge (category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_flowe_knowledge_org ON flowe_knowledge (organization_id) WHERE is_active = true;

-- Full-text search index on title + content
CREATE INDEX IF NOT EXISTS idx_flowe_knowledge_fts ON flowe_knowledge
  USING GIN (to_tsvector('english', title || ' ' || content));

-- RLS policies
ALTER TABLE flowe_knowledge ENABLE ROW LEVEL SECURITY;

-- Global knowledge (org_id IS NULL) is readable by everyone
CREATE POLICY "Global knowledge is readable by authenticated users"
  ON flowe_knowledge FOR SELECT
  TO authenticated
  USING (organization_id IS NULL AND is_active = true);

-- Org-specific knowledge is readable by org members
CREATE POLICY "Org knowledge is readable by org members"
  ON flowe_knowledge FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND is_active = true
  );

-- Only admins can insert/update/delete (via admin client in practice)
CREATE POLICY "Service role can manage knowledge"
  ON flowe_knowledge FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Seed: Global NC Permit Domain Knowledge
-- ============================================================================

INSERT INTO flowe_knowledge (category, title, content, keywords, tags, source, confidence) VALUES

-- NC Building Codes
('nc_code', 'NC Building Code Overview (2024 IBC Amendments)',
 'North Carolina adopted the 2018 International Building Code (IBC) with NC-specific amendments effective January 1, 2024. Key NC amendments include: modified fire separation requirements for townhomes (R302.2), NC-specific energy code compliance paths (Chapter 11), and modified accessibility requirements aligned with ADA and NC accessibility code. The NC Building Code Council publishes amendments through the NC Administrative Code, Title 10A. Local jurisdictions may NOT be more restrictive than the state code but CAN adopt additional local ordinances for zoning, stormwater, and development standards.',
 ARRAY['building code', 'IBC', 'nc amendments', '2024', 'fire separation', 'accessibility', 'energy code', 'building code council'],
 ARRAY['nc_code', 'building', 'construction'],
 'NC Building Code Council — 10A NCAC',
 0.95),

('nc_code', 'NC Fire Prevention Code',
 'NC adopts the 2018 International Fire Code (IFC) with NC amendments. Key requirements for site plans: fire apparatus access roads must be minimum 20 feet wide with 13.5 feet vertical clearance. Dead-end fire lanes over 150 feet require turnarounds. Fire hydrant spacing: typically 300-600 feet depending on zoning district and building type. Automatic sprinkler systems required per IBC Section 903 thresholds. Fire department connection (FDC) placement must be approved by the AHJ (Authority Having Jurisdiction).',
 ARRAY['fire code', 'IFC', 'fire lane', 'hydrant', 'sprinkler', 'FDC', 'apparatus access', 'fire prevention'],
 ARRAY['nc_code', 'fire', 'safety'],
 'NC Fire Prevention Code — IFC with NC Amendments',
 0.95),

('nc_code', 'NCDOT Driveway and Road Standards',
 'NCDOT regulates driveway connections to state-maintained roads. Key requirements: driveway permits required from NCDOT Division office for connections to state roads. Sight distance triangles per AASHTO guidelines. TIA (Traffic Impact Analysis) required when development generates 100+ peak hour trips. NCDOT minimum road standards for public dedication: 60-foot ROW for residential, wider for commercial. Curb and gutter required in most urban areas. NCDOT review of site plans is separate from municipal review and can run in parallel.',
 ARRAY['NCDOT', 'driveway', 'road standards', 'TIA', 'traffic impact', 'sight distance', 'ROW', 'right of way', 'curb gutter'],
 ARRAY['nc_code', 'transportation', 'NCDOT'],
 'NCDOT Policy on Street and Driveway Access',
 0.90),

('nc_code', 'NCDEQ Stormwater and Erosion Control',
 'NCDEQ regulates stormwater management and erosion control. Key requirements: Erosion and Sediment Control Plan required for land disturbance > 1 acre (or > 20,000 sq ft in sensitive watersheds). NPDES Construction Stormwater Permit (NCG01) required. Post-construction stormwater management: must meet nutrient loading targets in WS-IV watersheds. Common BMPs include wet detention ponds, bioretention cells, level spreaders, and permeable pavement. Review by NCDEQ Land Quality Section is separate from municipal review.',
 ARRAY['NCDEQ', 'stormwater', 'erosion control', 'BMP', 'NPDES', 'sediment', 'watershed', 'detention pond', 'bioretention'],
 ARRAY['nc_code', 'stormwater', 'environment'],
 'NCDEQ Stormwater Design Manual',
 0.90),

-- Municipal Processes
('jurisdiction', 'Greensboro TRC Review Process',
 'Greensboro uses a Technical Review Committee (TRC) process for site plan review. Process: 1) Pre-application meeting (recommended, not required), 2) Site plan submission via eTRAKiT portal, 3) TRC review by all departments simultaneously (Planning, Engineering, Fire, Transportation, Water Resources, Public Utilities), 4) Review comments compiled and returned to applicant within 15-20 business days, 5) Applicant responds to all comments and resubmits, 6) TRC re-review (7-10 business days), 7) Conditional approval or additional rounds. Typical timeline: 2-4 review rounds, 60-90 days total. Key: ALL department comments must be resolved before approval.',
 ARRAY['greensboro', 'TRC', 'technical review committee', 'site plan', 'eTRAKiT', 'review process', 'planning', 'engineering'],
 ARRAY['jurisdiction', 'greensboro', 'review_process'],
 'City of Greensboro Development Services',
 0.90),

('jurisdiction', 'Raleigh UDO Site Plan Review',
 'Raleigh site plan review under the Unified Development Ordinance (UDO): 1) Pre-submittal conference (required for major developments), 2) Site plan submittal via iMAPS/ePlans, 3) Concurrent review by Planning, Engineering, Stormwater, Fire, Transportation, Public Utilities, 4) Review comments returned within 21 calendar days, 5) Response and resubmittal, 6) Re-review within 14 calendar days. Raleigh requires a development agreement for phased projects. Tree conservation areas (per UDO Chapter 9) are a frequent comment topic. Transit overlay districts may add additional requirements.',
 ARRAY['raleigh', 'UDO', 'site plan', 'iMAPS', 'ePlans', 'tree conservation', 'transit overlay', 'development agreement'],
 ARRAY['jurisdiction', 'raleigh', 'review_process'],
 'City of Raleigh Planning & Development',
 0.90),

('jurisdiction', 'Charlotte UDO Review Process',
 'Charlotte reviews through the Land Development Division. Process: 1) Pre-submittal meeting (strongly recommended), 2) Submittal via CLDSF portal, 3) Consolidated review by all reviewing agencies, 4) Comments returned within 21 business days, 5) Response and resubmittal, 6) Re-review within 14 business days. Charlotte''s UDO (effective June 2023) introduced new place types and significantly changed setback, parking, and tree save requirements. Post Road development area and CATS transit station areas have additional overlays.',
 ARRAY['charlotte', 'UDO', 'CLDSF', 'land development', 'place types', 'setback', 'parking', 'tree save', 'CATS'],
 ARRAY['jurisdiction', 'charlotte', 'review_process'],
 'Charlotte Land Development Division',
 0.85),

-- Platform Knowledge
('platform', 'EntitleFlow Document Upload and AI Parsing',
 'Document upload flow: 1) Navigate to permit detail page or /app/documents, 2) Click "Upload Document" and select PDF review letter, 3) System uploads to Google Cloud Storage, 4) Google Document AI automatically extracts text and identifies comments, 5) AI Comment Analyst classifies each comment by department, severity, and category, 6) Parsed comments appear on the permit detail page within 30-60 seconds. Supported formats: PDF (primary), with OCR for scanned documents. Maximum file size: 50MB. The AI extraction works best with structured review letters that have numbered comments.',
 ARRAY['upload', 'document', 'parse', 'PDF', 'Document AI', 'comment extraction', 'OCR', 'classify'],
 ARRAY['platform', 'documents', 'ai'],
 'EntitleFlow Platform Documentation',
 1.0),

('platform', 'EntitleFlow Response Letter Generation',
 'To generate response letters: 1) Go to the permit detail page, 2) Review AI-generated responses for each comment (blue "AI" badge indicates AI suggestion available), 3) Edit or approve each response, 4) Click "Generate Response Letter" to compile all responses into a formatted letter, 5) Download as PDF or DOCX. The Response Drafter agent considers: NC code references, comment severity, professional tone, and previous response patterns. Pro tip: resolve all comments before generating the letter for the most complete package.',
 ARRAY['response letter', 'generate', 'response drafter', 'PDF', 'DOCX', 'resubmittal'],
 ARRAY['platform', 'responses', 'ai'],
 'EntitleFlow Platform Documentation',
 1.0),

-- Workflow Best Practices
('workflow', 'Efficient Comment Resolution Workflow',
 'Recommended workflow for resolving review comments efficiently: 1) TRIAGE: Sort comments by department and severity — address critical items first (life safety, code violations), 2) ASSIGN: Distribute by discipline — civil engineer handles grading/utilities, landscape architect handles tree save/buffers, traffic handles TIA/sight distance, 3) PARALLEL WORK: Team members work simultaneously on their assigned comments, 4) AI ASSIST: Use FlowE''s Response Drafter for initial draft responses, then have the discipline expert refine, 5) REVIEW: Project manager reviews all responses before compiling, 6) COMPILE: Generate response letter with all responses, 7) SUBMIT: Upload to jurisdiction portal with response letter + revised plans.',
 ARRAY['workflow', 'comment resolution', 'triage', 'assign', 'parallel', 'response', 'resubmittal', 'best practice'],
 ARRAY['workflow', 'best_practice'],
 'EntitleFlow Best Practices',
 1.0),

('workflow', 'How to Handle Multi-Department Comment Conflicts',
 'When review comments from different departments conflict (common with Fire vs. Landscape or Transportation vs. Stormwater): 1) Document the conflict explicitly in your response, 2) Reference both department requirements with code citations, 3) Propose a compromise solution that meets both departments'' minimum requirements, 4) Request a coordination meeting if the conflict cannot be resolved on paper, 5) In your EntitleFlow comment, tag both relevant categories so the team can see the cross-department impact. Common conflicts: fire lane width vs. tree save buffers, driveway spacing vs. parking layout, stormwater BMP placement vs. building setbacks.',
 ARRAY['conflict', 'multi-department', 'fire', 'landscape', 'transportation', 'stormwater', 'coordination', 'compromise'],
 ARRAY['workflow', 'conflict_resolution'],
 'EntitleFlow Best Practices',
 0.95),

-- Few-Shot Examples
('few_shot', 'What is the minimum fire lane width in NC?',
 'Few-shot example for fire code questions',
 ARRAY['fire lane', 'width', 'minimum', 'fire code'],
 ARRAY['few_shot', 'nc_code'],
 NULL, 1.0,
 'What is the minimum fire lane width in NC?',
 'Under the NC Fire Prevention Code (IFC with NC amendments), fire apparatus access roads must be a minimum of 20 feet wide with 13.5 feet of unobstructed vertical clearance. Dead-end fire apparatus access roads longer than 150 feet require an approved turnaround — typically a hammerhead, cul-de-sac (96-foot diameter), or other configuration approved by the fire marshal. If the building requires aerial apparatus access (buildings over 30 feet in height), the access road must be 26 feet wide. These are minimum state requirements; your local fire marshal may have additional requirements based on the specific development.'),

('few_shot', 'How do I assign comments to my team in EntitleFlow?',
 'Few-shot example for platform navigation questions',
 ARRAY['assign', 'team', 'comment', 'how to'],
 ARRAY['few_shot', 'platform'],
 NULL, 1.0,
 'How do I assign comments to my team in EntitleFlow?',
 'To assign comments to team members: go to the permit detail page where your parsed comments live. Each comment card has an "Assign" dropdown — click it and select the team member best suited for that discipline. For example, assign grading comments to your civil engineer and landscape buffer comments to your landscape architect. The assigned person will get a notification immediately and the comment will show up on their My Tasks page (/app/tasks). You can also reassign comments later if workload needs to shift. Pro tip: sort by category first to batch-assign all comments of the same discipline at once.'),

('few_shot', 'What happens during a Greensboro TRC review?',
 'Few-shot example for jurisdiction process questions',
 ARRAY['greensboro', 'TRC', 'review', 'process', 'how long'],
 ARRAY['few_shot', 'jurisdiction'],
 NULL, 1.0,
 'What happens during a Greensboro TRC review?',
 'The Greensboro Technical Review Committee (TRC) is a simultaneous multi-department review of your site plan. Here''s how it works: after you submit through the eTRAKiT portal, your plan goes to Planning, Engineering, Fire, Transportation, Water Resources, and Public Utilities all at once. Each department reviews independently and returns comments within 15-20 business days. You''ll get a consolidated comment letter with all departments'' feedback. You then need to address every comment — even if you disagree, you must provide a written response explaining why. Typical projects go through 2-4 review rounds over 60-90 days. The key thing to know: ALL departments must sign off before you get conditional approval. One unresolved fire comment can hold up the entire project.')

ON CONFLICT DO NOTHING;
