# EntitleFlow — Founder Briefing
**For: Mentor & Investor Meeting**
**Site: entitleflow.com**
**Founder: Jene**
**Prepared: April 2026**

---

## 🎯 The 30-Second Pitch

**EntitleFlow is the operating system for land entitlement teams.** It's a North Carolina-first platform that helps architecture, civil, and development firms manage what happens *after* a permit gets submitted — when reviewer comments arrive as messy PDF redlines and teams have no structured way to track, assign, respond to, or resolve them. We replace email chains, scattered spreadsheets, and tribal memory with a shared workspace built specifically for the post-submission review cycle.

**One-liner:** "We turn permit chaos into a clean operating layer for NC development teams."

---

## 🔥 The Problem (Say This First)

After a permit set is submitted to a municipality, teams receive PDF redline packages full of reviewer comments. Today, those comments live across:
- Email threads
- Personal spreadsheets
- Marked-up PDFs in shared drives
- Slack messages
- Tribal knowledge in someone's head

The result: comment ownership gets lost, status visibility requires manual reconstruction every time someone asks, resubmittal packages get assembled under deadline pressure with incomplete responses, and clients lose confidence.

**The ugliest work in entitlement isn't the initial submission — it's the comment-to-resubmittal loop that follows.** Most software ignores this. We built around it.

**Quantified pain:** A single review cycle on a mid-sized project can generate 15–25 reviewer comments across multiple disciplines. A team running 5–10 active projects is managing 75–250 open comments at any given time, with no shared system of record.

---

## 💡 The Solution

EntitleFlow is a structured workspace built around four core modules:

**1. NC Jurisdiction Intelligence**
Track departments, platforms, forms, and workflow checkpoints by jurisdiction without starting from scratch each time. Greensboro and Raleigh are launched. Charlotte/Mecklenburg and DEQ in research preview.

**2. Reviewer Comment Management**
Turn PDF redline chaos into structured issues with owners, statuses, and cleaner response language. Comments are organized by discipline, cycle, and status.

**3. Resubmittal Coordination**
See what changed, what's still open, and what must travel in the next submission package. Coordinate supporting memos, sheets, and attachments by issue.

**4. Approval Workflow Visibility**
Give principals, PMs, and clients a shared operational readout of where projects stand — without exposing every internal task or forcing everyone into the underlying detail.

**The hidden layer:** AI-powered document intelligence (Google Cloud Document AI + Vertex AI Gemini) automatically parses PDF redline packages, extracts comments, and creates structured records. This is the "zero-touch" intake pipeline that removes the manual data entry pain.

---

## 🏛️ Why North Carolina-First (The Wedge)

This is the most important strategic answer. Most permit/entitlement software is built as a generic national template. They go wide and shallow. We're going narrow and deep.

**Why NC:**
- NC is a high-growth development market (especially the Triangle and Triad)
- Jurisdiction systems are fragmented even within the state — Greensboro uses SOALite Plan Review and ArcGIS dashboards, Raleigh uses different portal configs, Charlotte is split between city and county
- Regional architecture and civil firms can't justify enterprise software like Bluebeam Studio or Procore for entitlement tracking, but they're drowning in spreadsheets
- Founder (Jene) has direct context and ties to NC development workflows

**What this gives us:**
- Real workflow depth instead of marketing copy
- A defensible "we know how Greensboro reviewers actually work" advantage
- A repeatable jurisdiction-by-jurisdiction expansion model (NC → SC → VA → GA → TN)
- Founder-led onboarding that fits regional firms instead of forcing enterprise implementation overhead

**The expansion play:** Once we own the NC entitlement workflow layer, we expand state-by-state. Each new state gets the same NC-quality jurisdiction depth, not a national template flattened across regions.

---

## 👥 Who We Sell To

Three core audience segments:

**1. Architecture firms** — Need to keep reviewer comments, discipline owners, and resubmittal prep out of email sprawl. Sweet spot: 5–25 person firms doing 5–15 active NC projects.

**2. Civil and site engineering teams** — Track jurisdiction requirements, engineering notes, and response cycles with less manual chasing. Often the most pain because they juggle multiple jurisdictions per project.

**3. Developers and builders** — Need cleaner status visibility when approvals touch multiple portals, reviewers, and project teams. Often have the budget but not the operational layer.

**Best fit profile:** A 10-person NC architecture or civil firm with 5–10 active projects in review cycles, currently using a shared spreadsheet and email to track comments, where the PM is spending 4–6 hours per week reconstructing status updates.

---

## 💰 Business Model

**Pricing tiers (live on site):**

| Tier | Price | Best For |
|------|-------|----------|
| **Permit Readiness Sprint** | Starting at $3,500 (one-time) | Workflow audit + readiness assessment for firms not yet ready to commit |
| **Starter** | $1,500/mo | Up to 5 seats — small firms starting with repeat project workflows |
| **Growth** | $3,500/mo | Up to 15 seats — firms coordinating more teams and jurisdictions |
| **Larger Teams** | Custom | Multi-office teams, larger builders, complex rollouts |
| **FlowE AI Agents (add-on)** | $30/portal/mo | AI-powered permit guidance and document analysis |

**License types:** Admin, Project Manager, Contributor, and Guest Viewer (free on Growth+) — so we monetize core users while keeping client-facing read access free.

**The Sprint funnel:** The Permit Readiness Sprint is our genius wedge. It's a paid ($3,500) front door that:
1. Generates revenue immediately (no free trial death spiral)
2. Forces qualification (only serious teams pay for an audit)
3. Builds product-led trust before subscription commitment
4. Creates a structured path to platform adoption with clear deliverables (Current State Review, Risk Map, Recommendation Summary)
5. Gives us deep workflow intelligence on every prospect

**Conversion target:** 40%+ of Sprint clients convert to Starter or Growth within 30 days.

---

## ⚙️ Tech Stack (For Technical Mentors)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, React 19, TypeScript (strict mode) |
| Styling | Tailwind CSS 4, shadcn/Radix UI, light-mode only design system |
| Auth | Supabase Auth with cookie-based SSR sessions |
| Database | Supabase (Postgres) with RLS |
| File Storage | Google Cloud Storage |
| Document AI | Google Cloud Document AI (parses PDF redline packages) |
| LLM | Vertex AI Gemini (summarization + response drafting), with hot-swappable model registry |
| Background Jobs | Google Cloud Functions (Pub/Sub email forwarder for inbound reviewer emails) |
| Maps | Google Maps via @vis.gl/react-google-maps |
| Deployment | Vercel (web app), GCP (cloud functions) |
| Analytics | Vercel Analytics |

**Why this matters for investors:**
- GCP-native architecture leverages existing credits (capital efficient)
- Hot-swappable AI model layer means we can route to whichever model wins (Gemini today, anything tomorrow) — no lock-in
- Supabase + Vercel gives us a small-team velocity advantage; we can ship features in days, not sprints
- The whole platform is built so a solo founder can run it and a small team can scale it

---

## 🛠️ What's Built Today (Q1 2026 Status)

**Marketing site (live on entitleflow.com):**
- Homepage, pricing, product pages, comparison page, how-it-works
- Greensboro and Raleigh jurisdiction guides
- Walkthrough booking and early access lead capture
- Resources hub
- Live lead capture wired to Supabase

**Authenticated app (in active customer-readiness sprint):**
- User accounts via Supabase
- Project and permit CRUD
- Document upload (GCS integration in progress)
- Comment thread workspace
- Dashboard with stat cards, activity feed, project table
- Analytics views
- Settings and team management
- AI summarize and suggest-response endpoints (Vertex AI/Gemini)

**Sprint deliverable suite (just completed):**
- Master Process SOP, Current State Review Framework, Risk Map methodology, and Recommendation Summary template — a complete delivery framework for the Permit Readiness Sprint service offering

---

## 🗺️ Roadmap (What Investors Want to See)

**Q1 2026 (now): Customer-Ready MVP**
Document upload to GCS, AI summarization, project/permit detail pages, comment thread UI, email forwarder Cloud Function deployed.

**Q2 2026: Core Product Loop**
- Document AI auto-parse pipeline (PDF → extracted comments → classified → assigned, zero-touch)
- Email-to-comment ingestion (reviewer emails auto-parsed and matched to permits)
- Team collaboration with role-based access
- Notification system (in-app + email digests)
- Project map view

**Q3–Q4 2026: Scale & Differentiate**
- Direct API integrations with Greensboro, Raleigh, Charlotte municipal systems
- AI response letter drafting (full responses using project + jurisdiction context)
- Resubmittal package builder (compile resolved comments + responses + drawings into a single PDF)
- Multi-jurisdiction expansion: SC, VA, GA, TN
- Stripe billing
- Client portal (white-labeled read-only sharing)

**2027+: National + Mobile**
- React Native field app
- National rollout with local jurisdiction depth
- Intelligence layer (ML timeline predictions, reviewer pattern analysis)

---

## 🥊 Competitive Landscape

| Category | Examples | Why We Win |
|----------|----------|-----------|
| **Manual / Status quo** | Spreadsheets + email + PDF markups | Fragile, expensive in team attention, no operating layer |
| **Generic project mgmt** | Procore, Monday, Asana | Broad but shallow on entitlement specifically; doesn't solve the comment-to-resubmittal loop |
| **PDF markup tools** | Bluebeam Studio | Solves markup, not workflow coordination or status visibility |
| **Permit tracking software** | GovPilot, OpenGov, Accela | Built for the *municipality* side, not the private team responding to comments |
| **EntitleFlow** | — | NC-first depth, built around the actual pain (comments and resubmittals), regional firm fit, founder-led onboarding |

**Our positioning:** "A control layer above fragmented portals — not another portal replacement story."

---

## 📊 Market Opportunity (Talking Points)

**TAM framing:**
- ~9,000 architecture firms and ~14,000 civil engineering firms in the US
- NC alone has 500+ architecture firms and 800+ civil engineering firms
- Average firm size in our sweet spot (5–25 people) numbers in the thousands per state
- Even at $1,500–$3,500/mo, the math gets interesting fast

**SAM (NC-first):**
- ~1,300 NC firms in our target profile
- Conservative 10% market share at $2,500 average ARPU = ~$3.9M ARR from NC alone
- Each new state opens a similar TAM with the same workflow depth play

**Why now:**
1. **Portal sprawl is normal now** — Even digital submissions still bounce between PDFs, portals, emails, and trackers
2. **AI makes document intelligence finally real** — Vertex AI / Document AI can parse redline packages in ways that weren't possible 18 months ago
3. **Regional firms need control without bloat** — They can't afford or justify enterprise software but desperately need an operating layer

---

## 🎁 What Makes EntitleFlow Defensible

1. **NC-first jurisdiction depth** — Hard to replicate without time and on-the-ground research
2. **The comment-to-resubmittal workflow** — Most competitors solve adjacent problems; we own the actual pain
3. **Founder-led onboarding motion** — Becomes a flywheel of customer intelligence that improves the product
4. **Service-led wedge (Sprint)** — Generates revenue and qualification before subscription commitment
5. **AI moat building** — Each parsed document and resolved comment makes the model better at the next one
6. **Light, fast tech stack** — Solo founder can ship; small team can scale; no enterprise overhead

---

## 💪 Founder Story (Make This Yours)

Talking points to weave in:
- You've seen this pain firsthand in NC development workflows
- You understand both the strategic product layer AND the implementation (you're shipping, not just talking)
- You're building this NC-first because you have the relationships and context to make jurisdiction depth real
- You're running a portfolio approach: EntitleFlow is one of three products in a connected entitlement/operations portfolio (ContractFlow, GrantFlow) that share architecture and talent
- You're doing this with a small, focused team using modern tools (Supabase, Vercel, GCP) — capital efficiency is in the DNA

---

## 🤔 Questions to Be Ready For

**"Why won't Procore or Bluebeam just build this?"**
They could build adjacent features, but they're not built around the post-submission workflow. Their architecture and customer base point them at construction management and PDF markup. The post-submission entitlement layer is too narrow for them and too specific to win without rebuilding from the ground up.

**"How do you scale jurisdiction depth nationally?"**
A repeatable "jurisdiction onboarding playbook" — research → primary source documentation → workflow guides → local pilot firm → published guide. Each new jurisdiction takes 4–6 weeks once the playbook is mature. AI accelerates the research phase significantly.

**"What's your CAC and LTV?"**
Sprint funnel keeps CAC low (paid front door qualifies and produces revenue). Target LTV: 24+ months at $1,500–$3,500/mo = $36K–$84K LTV per Starter/Growth account. Founder-led sales motion keeps initial CAC under $1K.

**"Why hasn't this been built yet?"**
- Document AI has only been good enough for ~18 months
- Most founders building for AEC come from enterprise construction backgrounds, not regional entitlement
- The market is "boring" until you actually talk to the firms living the pain
- It requires deep regional knowledge that doesn't show up in YC batches

**"What's the biggest risk?"**
Adoption friction. Architecture and civil firms are notoriously slow to adopt new tools. That's exactly why we built the Sprint as a paid front door — it bypasses "free trial → never log in again" by giving teams a structured, valuable engagement that produces deliverables they actually use.

**"What do you need from us?"**
[Tailor based on the meeting — could be: warm intros to NC firms, technical mentorship on scaling Document AI pipelines, fundraising guidance, or specific operational advice on the Sprint motion]

---

## 🧭 The 5-Minute Walkthrough (If They Ask)

If they want a live tour of entitleflow.com, walk them through it in this order:

1. **Homepage** — Read the hero: "Cut permit chaos in North Carolina." Show the three audience callouts (architecture, civil, developers/builders), then the three "why now" tiles (portal sprawl, reviewer comments drive rework, regional firms need control without bloat).
2. **Product page** — Walk through the four modules: NC jurisdiction intelligence, reviewer comment management, resubmittal coordination, approval workflow visibility.
3. **Pricing page** — Anchor on the Sprint at $3,500 as the front door, then show Starter ($1,500/mo) and Growth ($3,500/mo) as the subscription path.
4. **Greensboro jurisdiction guide** — This is where the NC-first strategy becomes real. Show them the actual systems (SOALite, ArcGIS, departmental touchpoints) and pain points captured.
5. **How it works** — Walk through the four workflow stages: intake, approval path mapping, comment organization, resubmittal coordination.
6. **Compare page** — Show the EntitleFlow vs. manual vs. generic competitor comparison.

---

## 📋 Things to Memorize (Cheat Sheet)

- **Tagline:** "Cut permit chaos in North Carolina"
- **Wedge:** NC-first land entitlement operations
- **Core problem:** Reviewer comments and resubmittal coordination
- **Front door:** $3,500 Permit Readiness Sprint
- **Subscription:** $1,500/mo Starter, $3,500/mo Growth
- **Tech stack one-liner:** Next.js + Supabase + GCP (Document AI, Vertex AI, GCS, Cloud Functions)
- **Differentiator:** "We're a control layer above fragmented portals, not another portal replacement"
- **Expansion model:** Jurisdiction-by-jurisdiction, state-by-state
- **Founder edge:** Direct NC relationships, strategic + technical, capital-efficient
- **Why now:** AI document intelligence + portal sprawl + regional firms need control without bloat

---

## 🎤 Opening Lines You Can Use

**For a mentor:**
> "I'm building EntitleFlow — the operating system for land entitlement teams. We help NC architecture and civil firms manage what happens after a permit is submitted, when reviewer comments arrive as messy PDF redlines and there's no structured way to track or respond to them. I'm here because I want your help thinking through [specific ask]."

**For an investor:**
> "EntitleFlow is a North Carolina-first land entitlement operations platform. We replace the spreadsheets and email chains regional development teams use to manage post-submission permit review cycles. Our wedge is a paid $3,500 workflow audit that converts to a $1,500–$3,500/mo subscription, and we're built on a capital-efficient stack that lets a small team move fast. I'd love to walk you through what we're building and where I think the opportunity is."

---

**Read this once tonight. Read it again over coffee. You've got this.**
