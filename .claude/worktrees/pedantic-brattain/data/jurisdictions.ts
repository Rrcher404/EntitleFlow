import type { JurisdictionPageData } from "@/lib/types";

export const jurisdictions: JurisdictionPageData[] = [
  {
    slug: "greensboro",
    title: "Greensboro development approval workflow guide",
    shortLabel: "Greensboro, NC",
    intro:
      "Greensboro teams often have to bridge planning, plan review, and related visibility across multiple systems. The workflow is digital, but the operating layer is still fragmented for private-side teams.",
    systems: [
      "SOALite Plan Review",
      "ArcGIS dashboard views",
      "City and county departmental touchpoints",
    ],
    workflowOverview: [
      "Project teams submit and track progress across more than one public-facing system.",
      "Reviewer comments and rework often need to be translated into an internal issue workflow.",
      "Resubmittal prep usually requires tighter coordination than the public systems themselves provide.",
    ],
    painPoints: [
      "Comment ownership gets lost across PDFs, email, and discipline-specific trackers.",
      "Status visibility for principals and clients often has to be reconstructed manually.",
      "Teams can end up managing planning and review context in separate places.",
    ],
    entitleFlowHelps: [
      "Create one comments and resubmittal workflow above the public systems.",
      "Track owners, response prep, and next-cycle readiness in a shared workspace.",
      "Give leadership and clients a calmer view of project status and blockers.",
    ],
    relatedGuideTitles: ["Greensboro workflow guide", "Resubmittal best practices", "Reviewer comment management guide"],
    updatedAt: "2026-03-10",
    verifiedAt: "2026-03-10",
    ctaTitle: "Walk through a Greensboro-style workflow",
    ctaBody: "See how EntitleFlow can help your team organize reviewer comments, resubmittals, and status visibility before the next cycle gets messy.",
  },
  {
    slug: "raleigh",
    title: "Raleigh development approval workflow guide",
    shortLabel: "Raleigh, NC",
    intro:
      "Raleigh and Wake workflows can look simpler from the outside because the portal layer feels more unified, but teams still manage real friction around review cycles, coordination, and client visibility.",
    systems: [
      "Permit portal configuration for city workflows",
      "Wake permit search visibility layers",
      "Jurisdiction-specific submission and review expectations",
    ],
    workflowOverview: [
      "Project teams still need internal clarity on where the submission stands and what the next cycle requires.",
      "Shared software does not automatically mean shared workflow logic across every approval path.",
      "Operational drag usually shows up in comment handling and next-package coordination.",
    ],
    painPoints: [
      "Portal visibility does not replace an internal response and ownership workflow.",
      "Resubmittal readiness can still depend on scattered team notes and manual follow-up.",
      "Client updates often require someone to translate the current cycle into a cleaner summary.",
    ],
    entitleFlowHelps: [
      "Turn review comments into a structured, owner-based workflow.",
      "Make the next submission package clearer before the team reaches deadline mode.",
      "Provide a cleaner operational summary for PMs, principals, and clients.",
    ],
    relatedGuideTitles: ["Raleigh workflow guide", "Resubmittal best practices", "Reviewer comment management guide"],
    updatedAt: "2026-03-11",
    verifiedAt: "2026-03-11",
    ctaTitle: "See the Raleigh workflow in a walkthrough",
    ctaBody: "If your team is juggling portal visibility with internal comment and resubmittal coordination, EntitleFlow can help make that work more legible.",
  },
];
