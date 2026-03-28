# EntitleFlow — The Build Story

*A living narrative of how EntitleFlow came together, updated with each milestone.*

---

## Where It All Started

EntitleFlow began with a simple, frustrating truth: after a permit set gets submitted to a municipality in North Carolina, the review cycle that follows is chaos. Reviewers from different departments — planning, stormwater, fire, transportation — send back PDF redline packages full of comments, and the development team on the receiving end has no structured way to deal with them. Comments get tracked in spreadsheets. Responses get coordinated over email. Things fall through the cracks. A single permit cycle can burn 10+ hours just on the administrative overhead of figuring out who said what, what's been addressed, and what still needs a response.

EntitleFlow was built to replace that entire workflow — not with another generic project management tool, but with a platform designed specifically for the post-submission review cycle. Upload the redline PDF, let the system parse and extract every reviewer comment, assign them to the right people on your team, draft AI-assisted responses, and compile everything into a clean resubmittal package. That's the vision. And this is the story of how it's being built.

---

## v0.1.0 — The Foundation (Initial Launch Through Early March 2026)

The first commit landed as a Next.js 16 application with React 19 and TypeScript, deployed on Vercel. The goal was straightforward: get a public-facing marketing site live at entitleflow.com while scaffolding the bones of the authenticated app behind it.

The marketing site came together across several iterations. The homepage, pricing page, product overview, competitor comparison, how-it-works walkthrough, and resource hub all went live, each pulling content from typed seed files in the `data/` directory rather than hardcoding copy into components. This was a deliberate choice — it keeps the marketing content manageable and makes future updates painless. Jurisdiction-specific landing pages for Greensboro and Raleigh were added to support NC-first positioning, with room to expand to Charlotte, Durham, Winston-Salem, and Fayetteville.

The design system went through multiple passes. V1 and V2 explored dark mode and various aesthetics before landing on V3: a light-only design language with a warm cream background, deep forest teal as the brand color, and Manrope for headings paired with Instrument Sans for body text. The decision to go light-only was final — no dark mode variants, no theme switching. Clean and warm, like the kind of thing you'd trust with your permit data.

Lead capture forms were wired up early — both the walkthrough form (which hands off to a Calendly link) and the early-access signup. These submit to a Supabase `marketing_leads` table through validated API routes, with Zod schemas handling the input validation. Getting the funnel working end-to-end was a priority.

---

## Backend Infrastructure — Supabase, Auth, and the App Shell

Authentication was built on Supabase Auth with cookie-based SSR sessions. The login and signup pages connect through an OAuth callback handler, and middleware handles JWT refresh on every request. Server components use a dedicated server-side Supabase client; client components use a browser-side one. The service role key stays strictly server-side — that boundary is non-negotiable.

The app shell took shape with a collapsible sidebar, a top bar with user dropdown, and route protection that redirects unauthenticated users to the login page. A demo portal was built alongside the authenticated app — same layout, no auth required — so prospects can explore the interface before signing up.

An admin area was added with its own dashboard, covering lead management, user administration, organization oversight, permit visibility, analytics, system announcements, and an audit trail. This gives full operational visibility once customers start onboarding.

---

## GCP Integration — Cloud Storage, Document AI, Maps, and Vertex AI

Google Cloud became the operational backbone. Document uploads flow to Google Cloud Storage with signed URLs for secure access. Google Cloud Document AI handles the heavy lifting of parsing TRC review letters — extracting individual comments from dense PDF redline packages and attributing them to the correct reviewing department. Google Maps powers the project map view, with geocoding to convert addresses into plottable coordinates.

Vertex AI, specifically Gemini 2.0 Flash, became the AI backbone. A Cloud Function was deployed to handle inbound email forwarding via Gmail watch and Pub/Sub, replacing an earlier Apps Script polling approach with real-time processing. GCP credits make this stack economically viable — the platform runs on Google's infrastructure without burning through a paid API budget.

---

## The Q1/Q2 Core Product Loop — Comments, Teams, Notifications

This was the biggest single push. Six new database tables were added — `team_members`, `team_invitations`, `notifications`, `notification_preferences`, `parse_jobs`, and extended fields on `comments` — bringing the total schema to 17 tables, all with organization-scoped Row Level Security policies.

The comment management system is the heart of the product. Full CRUD operations, filtering by department and status, bulk actions, assignment to team members, resolution tracking, and AI-suggested responses. Every comment pulled from a parsed PDF gets a structured record that the team can act on.

Team collaboration landed with invite flows, role-based permissions (owner, admin, member, viewer), and member management. Notifications were built as a full system — in-app with a bell icon in the top bar, email preference controls, and triggers wired to key actions across the platform.

The document pipeline matured: upload to GCS, trigger Document AI parsing, track parse job status with progress indicators, and auto-extract comments from the results. The auto-parse endpoint uses Gemini to classify and structure extracted comments when Document AI's raw output needs refinement.

On the frontend, project and permit detail pages got full implementations with tabbed views — overview, documents, comments, analytics, and status history for permits. The resubmittal page lets teams compile resolved comments and response letters into a package for resubmission to the jurisdiction. A "My Tasks" page surfaces all comments assigned to the current user in one place.

All told, 44 API endpoints were built across team management, notifications, comments, documents, AI, admin, and supporting services. Every route that touches user data checks authentication first.

---

## The AI Agent Layer — Six Specialists and a Conductor

The AI system evolved from simple endpoint stubs into a full agent architecture. Six specialized agents were built, each with a focused role: Comment Analyst (extracts insights from review comments), Response Drafter (generates responses to reviewer comments), Document Strategist (analyzes permit documents for strategy), Compliance Advisor (checks against NC building codes), Resubmittal Planner (plans resubmittal packages), and Project Intelligence (extracts broader project insights).

The architecture follows a hybrid model. Gemini 2.0 Flash via Vertex AI is the backbone — fast, cost-effective, covered by GCP credits. MiMo-v2-Pro via OpenRouter serves as an enhancement layer for complex reasoning tasks, with a $30/week budget cap. The key design principle: the LLM must be hot-swappable, like a memory card. A model registry at `lib/ai/model-registry.ts` makes it possible to change models without touching agent logic. If the OpenRouter key isn't set, everything falls back gracefully to GCP.

An agent router handles request routing — incoming AI requests get directed to the right specialist based on the task type, with backwards-compatible responses that include enhanced fields when the enhancement layer is available.

---

## FlowE — The AI Assistant

FlowE is the user-facing AI assistant, living at `/app/flowe` with its own dedicated page and sidebar navigation entry. It's essentially a seventh agent — a "conductor" that can leverage the other six specialists while maintaining a conversational interface.

The implementation includes conversation memory backed by pgvector embeddings for semantic search, a knowledge retrieval system that pulls context from the user's projects and permits, dropdown conversation history (up to 10 recent chats), and a 15-minute inactivity timer that automatically starts a fresh conversation. Two new Supabase tables — `flowe_conversations` and `flowe_messages` — store the chat history with full RLS protection.

FlowE uses the same Gemini backbone with MiMo escalation for complex queries. It's aware of parse job status and can surface document processing progress in conversation. The goal is for FlowE to feel like a knowledgeable teammate who understands your projects, not a generic chatbot.

---

## Where We Are Now — March 22, 2026

The platform sits at roughly 85% completion toward first-customer readiness. The marketing site is live and deployed. The authenticated app has full coverage of the core workflow: upload documents, parse comments, assign to team members, draft AI responses, track resolution, and prepare resubmittal packages. The admin area is operational. The AI layer is functional with six agents and a chat assistant.

A 7-day sprint is kicking off today, targeting first customer onboarding by March 30th. The remaining work is focused on polish and integration — wiring all notification triggers, ensuring email provider integration works end-to-end, TypeScript cleanup, rate limiting on AI endpoints, and comprehensive QA testing with realistic fixtures. Four NC review letter test sets (Greensboro, Raleigh, Charlotte, and Durham) with a combined 70+ comments are ready for testing, along with team member profiles, response templates, and 15 structured test scenarios.

The database migration for the Q2 tables needs to be pushed to production Supabase. Once QA passes and the sprint closes out, EntitleFlow will be ready for its first real user.

---

## What's Coming Next

The immediate horizon is customer onboarding and real-world feedback. Beyond that, the roadmap includes email-to-comment ingestion (inbound reviewer emails automatically parsed into structured comments), jurisdiction API integrations for direct connections to Greensboro and Raleigh's municipal systems, advanced analytics with approval timeline tracking, and eventually AI-powered response letter drafting that uses full project and jurisdiction context.

The longer arc points toward multi-state expansion (SC, VA, GA, TN), a white-labeled client portal, mobile support for field teams, and Stripe billing. But first — the first customer, the first real permit cycle tracked end-to-end, and the first proof that this platform does what it promises.

---

*This document is updated with each significant version change or milestone. It tells the story of what was built, why, and how the platform evolved — a running record for the team, for investors, and for ourselves.*

*Last updated: March 22, 2026 — v0.1.0*
