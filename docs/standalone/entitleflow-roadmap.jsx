import { useState } from "react";

const COLORS = {
  bg: "#FDFBF7",
  card: "#FFFFFF",
  forest: "#1B3B2D",
  forestLight: "#2D5A45",
  gold: "#D4A937",
  goldLight: "#F5E6B8",
  border: "#E8E0D0",
  text: "#1B3B2D",
  textMuted: "#6B7B73",
  green: "#22C55E",
  amber: "#F59E0B",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  red: "#EF4444",
  teal: "#14B8A6",
};

const phases = [
  {
    id: "complete",
    label: "Complete",
    subtitle: "Q1 2026 — Shipped & Live",
    color: COLORS.green,
    icon: "✅",
    items: [
      {
        title: "Wire Document Upload to GCS",
        desc: "Document upload form connected to /api/documents/upload endpoint. Files store in Google Cloud Storage with DB records created on upload. Fully operational in production.",
        tags: ["Frontend", "Integration"],
        effort: "S",
        impact: "High",
        status: "shipped",
      },
      {
        title: "Deploy Cloud Functions Email Forwarder",
        desc: "Email-forwarder Cloud Function deployed to GCP with Gmail watch for Pub/Sub push notifications. Replaces Apps Script polling with real-time email processing pipeline.",
        tags: ["Infrastructure", "GCP"],
        effort: "M",
        impact: "High",
        status: "shipped",
      },
      {
        title: "Complete AI Endpoints (Summarize + Suggest)",
        desc: "Vertex AI (Gemini) integration complete for /api/ai/summarize and /api/ai/suggest-response. Includes prompt engineering, error handling, and confidence scoring.",
        tags: ["AI/ML", "Backend"],
        effort: "M",
        impact: "High",
        status: "shipped",
      },
      {
        title: "Project & Permit Detail Pages",
        desc: "Full CRUD project and permit detail views with status timelines, linked documents, comment threads, activity history, and inline editing. Deployed at /app/projects/[id] and /app/permits/[id].",
        tags: ["Frontend", "Core"],
        effort: "L",
        impact: "Critical",
        status: "shipped",
      },
      {
        title: "Comment Thread UI",
        desc: "Core value-delivery feature: view parsed comments per permit, resolve/unresolve, assign to team members, draft AI-assisted responses. Includes optimistic updates and real-time status changes.",
        tags: ["Frontend", "Core"],
        effort: "L",
        impact: "Critical",
        status: "shipped",
      },
    ],
  },
  {
    id: "deployed",
    label: "Deployed",
    subtitle: "Q2 2026 — Core Product Loop Live",
    color: COLORS.teal,
    icon: "🚀",
    items: [
      {
        title: "Document AI Auto-Parse Pipeline",
        desc: "PDF upload triggers Document AI parsing → comment extraction → Vertex AI classification → automatic comment record creation. Zero-touch pipeline via /api/documents/[id]/auto-parse. Database tracks parse jobs with status, error handling, and comment counts.",
        tags: ["AI/ML", "Automation"],
        effort: "L",
        impact: "Critical",
        status: "shipped",
      },
      {
        title: "Email-to-Comment Ingestion",
        desc: "Inbound reviewer emails parsed into structured comments via email_queue table and Cloud Function pipeline. Matches emails to permits by permit number. Admin matching UI for unmatched emails.",
        tags: ["Integration", "AI/ML"],
        effort: "L",
        impact: "High",
        status: "shipped",
      },
      {
        title: "Team Collaboration & Roles",
        desc: "Full team management system: invite members via email with secure tokens, role-based access (owner/admin/member/viewer), comment assignment to team members, team settings page. 7 new database tables with RLS policies. Deployed at /app/settings/team.",
        tags: ["Frontend", "Backend"],
        effort: "L",
        impact: "High",
        status: "shipped",
      },
      {
        title: "Notification System",
        desc: "In-app notifications with 9 notification types (comment_assigned, permit_status_changed, deadline_approaching, ai_parse_complete, etc.). User preference controls for in-app, email, and digest settings. Real-time notification bell in app topbar. Deployed at /app/notifications.",
        tags: ["Backend", "Frontend"],
        effort: "L",
        impact: "High",
        status: "shipped",
      },
      {
        title: "Project Map View with Geocoding",
        desc: "Interactive Google Maps integration showing all active projects across NC. Click-to-view project details, status-based filtering, jurisdiction overlays. Latitude/longitude stored directly on projects table. Deployed at /app/projects/map.",
        tags: ["Frontend", "GCP"],
        effort: "M",
        impact: "Medium",
        status: "shipped",
      },
      {
        title: "Advanced Analytics Dashboard",
        desc: "Interactive analytics with permit approval timelines, comment resolution rates by category, reviewer response patterns, and project pipeline velocity charts. Time-range filtering and export capability. Deployed at /app/analytics.",
        tags: ["Frontend", "Data"],
        effort: "M",
        impact: "Medium",
        status: "shipped",
      },
    ],
  },
  {
    id: "next",
    label: "Next",
    subtitle: "Q3–Q4 2026 — Scale & Differentiate",
    color: COLORS.blue,
    icon: "🎯",
    items: [
      {
        title: "Jurisdiction API Integrations",
        desc: "Direct API connections to NC municipal permit systems (Greensboro, Raleigh, Charlotte). Auto-pull permit status updates, deadlines, and reviewer assignments.",
        tags: ["Integration", "Core"],
        effort: "XL",
        impact: "Critical",
        status: "research",
      },
      {
        title: "AI Response Drafting with Context",
        desc: "Generate full response letters to reviewer comments using project context, permit history, and jurisdiction requirements. One-click draft → review → send workflow.",
        tags: ["AI/ML", "Core"],
        effort: "XL",
        impact: "Critical",
        status: "planned",
      },
      {
        title: "Resubmittal Package Builder",
        desc: "Compile all resolved comments, response letters, updated drawings list, and cover sheet into a single resubmittal package PDF ready for jurisdiction upload.",
        tags: ["Core", "Automation"],
        effort: "L",
        impact: "High",
        status: "planned",
      },
      {
        title: "Multi-Jurisdiction Expansion (SE Region)",
        desc: "Expand beyond NC — add jurisdiction data, regulatory requirements, and reviewer contact databases for SC, VA, GA, and TN markets.",
        tags: ["Growth", "Data"],
        effort: "XL",
        impact: "High",
        status: "research",
      },
      {
        title: "Client Portal (External Sharing)",
        desc: "White-labeled portal for sharing project status with clients/stakeholders. Read-only views of permit progress, timeline, and key milestones.",
        tags: ["Frontend", "Growth"],
        effort: "L",
        impact: "Medium",
        status: "planned",
      },
      {
        title: "Stripe Billing Integration",
        desc: "Implement subscription billing tied to the pricing tiers. Usage tracking, seat-based billing, trial periods, and upgrade/downgrade flows.",
        tags: ["Backend", "Growth"],
        effort: "L",
        impact: "High",
        status: "planned",
      },
      {
        title: "Mobile App (React Native)",
        desc: "Native mobile app for field teams — photo capture of site conditions, push notifications for permit updates, quick comment responses on the go.",
        tags: ["Mobile", "Growth"],
        effort: "XL",
        impact: "Medium",
        status: "research",
      },
      {
        title: "Permit Timeline Prediction",
        desc: "ML model trained on historical permit data to predict approval timelines by jurisdiction, permit type, and comment complexity. Help teams plan proactively.",
        tags: ["AI/ML", "Data"],
        effort: "XL",
        impact: "High",
        status: "research",
      },
    ],
  },
  {
    id: "experimental",
    label: "Experimental",
    subtitle: "Q1 2027 — Frontier Ideas",
    color: COLORS.purple,
    icon: "🔬",
    items: [
      {
        title: "AI Plan Review Co-Pilot",
        desc: "Before submission, AI reviews the full plan set against jurisdiction checklists, zoning codes, and past rejection patterns — flags likely issues before the reviewer ever sees it. Pre-emptive compliance checking.",
        tags: ["AI/ML", "Core"],
        effort: "XL",
        impact: "Critical",
        status: "research",
      },
      {
        title: "Voice-to-Comment Field Capture",
        desc: "Field teams speak observations during site visits and AI transcribes, classifies, and attaches them to the correct permit as structured comments. Whisper API + Gemini classification pipeline.",
        tags: ["AI/ML", "Mobile"],
        effort: "L",
        impact: "High",
        status: "research",
      },
      {
        title: "Jurisdiction Knowledge Graph",
        desc: "Build a structured knowledge graph of NC municipal codes, reviewer preferences, historical approval patterns, and inter-department relationships. Power smarter AI responses and timeline predictions.",
        tags: ["AI/ML", "Data"],
        effort: "XL",
        impact: "High",
        status: "research",
      },
      {
        title: "Automated Drawing Revision Diffing",
        desc: "Upload revised drawings and AI highlights what changed between versions — new setbacks, modified utility layouts, updated elevations. Visual diff overlays for reviewer response packages.",
        tags: ["AI/ML", "Automation"],
        effort: "XL",
        impact: "High",
        status: "research",
      },
      {
        title: "Multi-Tenant White-Label Platform",
        desc: "Allow engineering firms and AEC consultancies to run their own branded instance of EntitleFlow. Custom domains, branded emails, client-facing dashboards. Opens B2B2C revenue channel.",
        tags: ["Growth", "Infrastructure"],
        effort: "XL",
        impact: "Critical",
        status: "research",
      },
      {
        title: "Real-Time Collaboration (Multiplayer)",
        desc: "Google Docs-style real-time co-editing on comment responses. See who's viewing which permit, live cursors on response drafts, instant sync across team members. Built on Supabase Realtime or Liveblocks.",
        tags: ["Frontend", "Infrastructure"],
        effort: "XL",
        impact: "Medium",
        status: "research",
      },
      {
        title: "Permit Fee Estimator & Budget Tracker",
        desc: "AI-powered fee estimation based on jurisdiction, project type, square footage, and historical data. Track actual vs. estimated costs across the full entitlement lifecycle. Budget alerts and reporting.",
        tags: ["Data", "Core"],
        effort: "L",
        impact: "Medium",
        status: "research",
      },
      {
        title: "Public API & Webhook Platform",
        desc: "RESTful API for third-party integrations — connect EntitleFlow to Procore, Bluebeam, PlanGrid, and other AEC tools. Webhook subscriptions for permit status changes, comment events, and deadline alerts.",
        tags: ["Backend", "Integration"],
        effort: "L",
        impact: "High",
        status: "research",
      },
    ],
  },
];

const tagColors = {
  Frontend: { bg: "#DBEAFE", text: "#1E40AF" },
  Backend: { bg: "#FEE2E2", text: "#991B1B" },
  "AI/ML": { bg: "#F3E8FF", text: "#6B21A8" },
  Integration: { bg: "#FEF3C7", text: "#92400E" },
  Core: { bg: "#D1FAE5", text: "#065F46" },
  Infrastructure: { bg: "#E0E7FF", text: "#3730A3" },
  GCP: { bg: "#CFFAFE", text: "#155E75" },
  Data: { bg: "#FCE7F3", text: "#9D174D" },
  Automation: { bg: "#FFEDD5", text: "#9A3412" },
  Growth: { bg: "#F0FDF4", text: "#166534" },
  Mobile: { bg: "#F5F3FF", text: "#5B21B6" },
};

const effortLabels = { S: "Small (1-2 days)", M: "Medium (3-5 days)", L: "Large (1-2 weeks)", XL: "Extra Large (3-4 weeks)" };
const effortColors = { S: COLORS.green, M: COLORS.blue, L: COLORS.amber, XL: COLORS.red };

const statusLabels = { "shipped": "Shipped", "ready": "Ready to Build", "in-progress": "In Progress", "planned": "Planned", "research": "Needs Research" };
const statusColors = { "shipped": COLORS.green, "ready": COLORS.teal, "in-progress": COLORS.gold, "planned": COLORS.blue, "research": COLORS.purple };

function Tag({ label }) {
  const c = tagColors[label] || { bg: "#F3F4F6", text: "#374151" };
  return (
    <span style={{ background: c.bg, color: c.text, padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.02em" }}>
      {label}
    </span>
  );
}

function StatusDot({ status }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 600, color: statusColors[status] }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColors[status], display: "inline-block" }} />
      {statusLabels[status]}
    </span>
  );
}

function RoadmapCard({ item, isExpanded, onClick }) {
  const isShipped = item.status === "shipped";
  return (
    <div
      onClick={onClick}
      style={{
        background: isShipped ? "#F0FDF4" : COLORS.card,
        border: `1px solid ${isShipped ? "#BBF7D0" : COLORS.border}`,
        borderRadius: "8px",
        padding: "16px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderLeft: `3px solid ${isShipped ? COLORS.green : effortColors[item.effort]}`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(27,59,45,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: COLORS.forest, lineHeight: 1.3, flex: 1, paddingRight: "8px", fontFamily: "'Manrope', sans-serif" }}>
          {isShipped && <span style={{ marginRight: "6px" }}>✓</span>}
          {item.title}
        </h4>
        <StatusDot status={item.status} />
      </div>
      {isExpanded && (
        <p style={{ margin: "8px 0 12px", fontSize: "13px", color: COLORS.textMuted, lineHeight: 1.5 }}>
          {item.desc}
        </p>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {item.tags.map((t) => <Tag key={t} label={t} />)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "11px", color: COLORS.textMuted }}>Effort:</span>
          <span style={{
            background: effortColors[item.effort] + "18",
            color: effortColors[item.effort],
            padding: "1px 6px",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: 700,
          }}>
            {item.effort}
          </span>
        </div>
      </div>
    </div>
  );
}

function PhaseColumn({ phase, expandedCards, toggleCard, filter }) {
  const filtered = filter === "all" ? phase.items : phase.items.filter((i) => i.tags.includes(filter));
  return (
    <div style={{ flex: 1, minWidth: "300px" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "4px",
        padding: "12px 16px",
        background: phase.color + "10",
        borderRadius: "8px",
        borderLeft: `4px solid ${phase.color}`,
      }}>
        <span style={{ fontSize: "20px" }}>{phase.icon}</span>
        <div>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: COLORS.forest, fontFamily: "'Manrope', sans-serif" }}>
            {phase.label}
          </h3>
          <p style={{ margin: 0, fontSize: "12px", color: COLORS.textMuted }}>{phase.subtitle}</p>
        </div>
        <span style={{
          marginLeft: "auto",
          background: phase.color + "20",
          color: phase.color,
          padding: "2px 8px",
          borderRadius: "10px",
          fontSize: "12px",
          fontWeight: 700,
        }}>
          {filtered.length} items
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
        {filtered.map((item, i) => (
          <RoadmapCard
            key={i}
            item={item}
            isExpanded={expandedCards.has(`${phase.id}-${i}`)}
            onClick={() => toggleCard(`${phase.id}-${i}`)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: "24px", textAlign: "center", color: COLORS.textMuted, fontSize: "13px", border: `1px dashed ${COLORS.border}`, borderRadius: "8px" }}>
            No items match this filter
          </div>
        )}
      </div>
    </div>
  );
}

const allTags = [...new Set(phases.flatMap((p) => p.items.flatMap((i) => i.tags)))].sort();

const allItems = phases.flatMap((p) => p.items);
const stats = {
  total: allItems.length,
  shipped: allItems.filter((i) => i.status === "shipped").length,
  planned: allItems.filter((i) => i.status === "planned" || i.status === "ready" || i.status === "in-progress").length,
  research: allItems.filter((i) => i.status === "research").length,
  critical: allItems.filter((i) => i.impact === "Critical").length,
};

export default function EntitleFlowRoadmap() {
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [filter, setFilter] = useState("all");

  const toggleCard = (id) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set();
    phases.forEach((p) => p.items.forEach((_, i) => all.add(`${p.id}-${i}`)));
    setExpandedCards(all);
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Instrument Sans', -apple-system, sans-serif" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "8px", background: COLORS.forest,
              display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.gold,
              fontWeight: 900, fontSize: "16px", fontFamily: "'Manrope', sans-serif",
            }}>
              E
            </div>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: COLORS.forest, fontFamily: "'Manrope', sans-serif" }}>
              EntitleFlow Product Roadmap
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: "14px", color: COLORS.textMuted, maxWidth: "700px", lineHeight: 1.5 }}>
            From permit comment tracker to the operating system for land entitlement teams.
            11 features shipped in Q1–Q2 2026. Click any card to expand details.
          </p>
        </div>

        {/* Stats Bar */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
          {[
            { label: "Total Items", value: stats.total, color: COLORS.forest },
            { label: "Shipped & Live", value: stats.shipped, color: COLORS.green },
            { label: "Planned", value: stats.planned, color: COLORS.blue },
            { label: "Needs Research", value: stats.research, color: COLORS.purple },
            { label: "Critical Impact", value: stats.critical, color: COLORS.red },
          ].map((s) => (
            <div key={s.label} style={{
              background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "8px",
              padding: "12px 20px", display: "flex", alignItems: "center", gap: "12px",
            }}>
              <span style={{ fontSize: "24px", fontWeight: 800, color: s.color, fontFamily: "'Manrope', sans-serif" }}>{s.value}</span>
              <span style={{ fontSize: "12px", color: COLORS.textMuted, fontWeight: 600 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Shipped Summary Banner */}
        <div style={{
          marginBottom: "24px",
          padding: "16px 20px",
          background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
          border: "1px solid #BBF7D0",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}>
          <div style={{ fontSize: "32px" }}>🎉</div>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: COLORS.forest, fontFamily: "'Manrope', sans-serif" }}>
              Q1–Q2 2026 Core Product Loop: 100% Shipped
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: COLORS.textMuted, lineHeight: 1.5 }}>
              All 11 planned features deployed to production — comment tracker, AI parsing, team collaboration, notifications, analytics, and map view are live at entitleflow.com. Database includes 22 tables with full RLS policies. The full upload → AI parse → assign → respond → resubmit loop is operational.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px",
          padding: "12px 16px", background: COLORS.card, border: `1px solid ${COLORS.border}`,
          borderRadius: "8px", flexWrap: "wrap",
        }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textMuted, marginRight: "4px" }}>FILTER:</span>
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "4px 12px", borderRadius: "4px", border: "none", cursor: "pointer",
              fontSize: "12px", fontWeight: 600,
              background: filter === "all" ? COLORS.forest : "transparent",
              color: filter === "all" ? "#fff" : COLORS.textMuted,
            }}
          >
            All
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                padding: "4px 12px", borderRadius: "4px", border: "none", cursor: "pointer",
                fontSize: "12px", fontWeight: 600,
                background: filter === t ? COLORS.forest : "transparent",
                color: filter === t ? "#fff" : COLORS.textMuted,
              }}
            >
              {t}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
            <button
              onClick={expandAll}
              style={{
                padding: "4px 12px", borderRadius: "4px", border: `1px solid ${COLORS.border}`,
                cursor: "pointer", fontSize: "12px", fontWeight: 600, background: "transparent", color: COLORS.textMuted,
              }}
            >
              Expand All
            </button>
            <button
              onClick={() => setExpandedCards(new Set())}
              style={{
                padding: "4px 12px", borderRadius: "4px", border: `1px solid ${COLORS.border}`,
                cursor: "pointer", fontSize: "12px", fontWeight: 600, background: "transparent", color: COLORS.textMuted,
              }}
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Board View */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          {phases.map((phase) => (
            <PhaseColumn key={phase.id} phase={phase} expandedCards={expandedCards} toggleCard={toggleCard} filter={filter} />
          ))}
        </div>

        {/* Legend */}
        <div style={{
          marginTop: "32px", padding: "16px", background: COLORS.card,
          border: `1px solid ${COLORS.border}`, borderRadius: "8px",
        }}>
          <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textMuted, display: "block", marginBottom: "6px" }}>EFFORT SIZING</span>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {Object.entries(effortLabels).map(([k, v]) => (
                  <span key={k} style={{ fontSize: "11px", color: COLORS.textMuted, display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ background: effortColors[k] + "18", color: effortColors[k], padding: "1px 5px", borderRadius: "3px", fontWeight: 700 }}>{k}</span>
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textMuted, display: "block", marginBottom: "6px" }}>STATUS</span>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {Object.entries(statusLabels).map(([k, v]) => (
                  <StatusDot key={k} status={k} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Vision */}
        <div style={{
          marginTop: "24px", padding: "24px", background: COLORS.forest, borderRadius: "8px", color: "#fff",
        }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: 800, fontFamily: "'Manrope', sans-serif", color: COLORS.gold }}>
            Strategic Vision: Where This Goes
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
            {[
              {
                title: "Phase 1: Comment Tracker MVP",
                desc: "COMPLETE — The core loop is live: upload permit PDFs → AI parses comments → team assigns & responds → track resolution. 11 features shipped, 22 database tables, full RLS security.",
                timeline: "Q1–Q2 2026 ✅",
                done: true,
              },
              {
                title: "Phase 2: Scale & Monetize",
                desc: "Jurisdiction API integrations, AI response letter drafting, resubmittal package builder, Stripe billing. Turn the MVP into a revenue-generating platform.",
                timeline: "Q3–Q4 2026",
                done: false,
              },
              {
                title: "Phase 3: Intelligence Layer",
                desc: "ML-powered timeline predictions, jurisdiction knowledge graph, pre-submission compliance checking. Teams get faster and smarter with every permit processed.",
                timeline: "Q4 2026 – Q1 2027",
                done: false,
              },
              {
                title: "Phase 4: Platform & Expansion",
                desc: "Multi-state expansion, white-label platform for AEC firms, public API, mobile app, real-time collaboration. National standard for entitlement management.",
                timeline: "Q1–Q2 2027",
                done: false,
              },
              {
                title: "Phase 5: Frontier",
                desc: "AI plan review co-pilot, voice-to-comment field capture, automated drawing revision diffing, permit fee estimation. The features that don't exist anywhere else yet.",
                timeline: "2027+",
                done: false,
              },
            ].map((p) => (
              <div key={p.title} style={{
                padding: "16px",
                background: p.done ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.08)",
                borderRadius: "6px",
                borderLeft: `3px solid ${p.done ? COLORS.green : COLORS.gold}`,
              }}>
                <div style={{ fontSize: "11px", color: p.done ? COLORS.green : COLORS.gold, fontWeight: 700, marginBottom: "4px" }}>{p.timeline}</div>
                <h4 style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 700, color: "#fff" }}>{p.title}</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Database Architecture Summary */}
        <div style={{
          marginTop: "24px", padding: "20px", background: COLORS.card,
          border: `1px solid ${COLORS.border}`, borderRadius: "8px",
        }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "15px", fontWeight: 800, color: COLORS.forest, fontFamily: "'Manrope', sans-serif" }}>
            Production Database Architecture — 22 Tables
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {[
              { group: "Core", tables: ["organizations", "profiles", "projects", "permits", "documents", "comments"] },
              { group: "Team & Auth", tables: ["team_members", "team_invitations", "comment_assignments"] },
              { group: "Notifications", tables: ["notifications", "notification_preferences"] },
              { group: "AI & Parsing", tables: ["parse_jobs", "email_queue"] },
              { group: "Activity", tables: ["activity_logs", "permit_status_history"] },
              { group: "Marketing", tables: ["marketing_leads"] },
            ].map((g) => (
              <div key={g.group} style={{ padding: "12px", background: "#F8F9FA", borderRadius: "6px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.forest, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{g.group}</div>
                {g.tables.map((t) => (
                  <div key={t} style={{ fontSize: "12px", color: COLORS.textMuted, padding: "2px 0", fontFamily: "monospace" }}>{t}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "12px", color: COLORS.textMuted }}>
          EntitleFlow Product Roadmap • Last updated March 21, 2026 • 11 features shipped, 16 planned
        </p>
      </div>
    </div>
  );
}
