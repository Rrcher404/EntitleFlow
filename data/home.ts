import {
  Activity,
  Building2,
  ClipboardList,
  FileSearch,
  MapPinned,
  MessageSquareMore,
  Workflow,
} from "lucide-react";

import type { PreviewPanel } from "@/lib/types";

export const homeContent = {
  hero: {
    eyebrow: "Development approval operations software for North Carolina",
    title: "Cut permit chaos in North Carolina.",
    description:
      "EntitleFlow NC helps architecture and civil firms turn messy reviewer comments into cleaner resubmittals and gives regional teams one live view of approval workflows.",
  },
  audiences: [
    {
      title: "Architecture firms",
      description: "Keep reviewer comments, discipline owners, and resubmittal prep out of email sprawl.",
      icon: Building2,
    },
    {
      title: "Civil and site teams",
      description: "Track jurisdiction requirements, engineering notes, and response cycles with less manual chasing.",
      icon: Workflow,
    },
    {
      title: "Developers and builders",
      description: "Get cleaner status visibility when approvals touch multiple portals, reviewers, and project teams.",
      icon: Activity,
    },
  ],
  whyNow: [
    {
      title: "Portal sprawl is normal now",
      description: "Most projects still bounce between PDFs, portals, emails, and internal trackers even when submissions are digital.",
      icon: FileSearch,
    },
    {
      title: "Reviewer comments drive the rework",
      description: "The ugliest work usually happens after the first review cycle, not at the point of initial submission.",
      icon: MessageSquareMore,
    },
    {
      title: "Regional firms need control without bloat",
      description: "North Carolina firms need operational clarity without buying into generic national software that misses local nuance.",
      icon: ClipboardList,
    },
  ],
  jurisdictionTeaser: [
    "Greensboro / Guilford workflows",
    "Raleigh / Wake workflows",
    "Charlotte / Mecklenburg research in progress",
    "AccessDEQ coordination guides coming next",
  ],
};

export const previewPanels: PreviewPanel[] = [
  {
    eyebrow: "Guided preview 01",
    title: "Reviewer comments workspace",
    description:
      "Capture reviewer notes, assign owners, and keep response language attached to the actual issue instead of scattered across inbox threads.",
    status: "3 open issues · 2 ready for review",
    notes: [
      "Discipline owners and next actions stay visible in one place.",
      "Response language is prepared before the next cycle starts.",
      "Open issues do not disappear inside markups and email chains.",
    ],
    stats: [
      { label: "Open comments", value: "03" },
      { label: "Assigned owners", value: "04" },
      { label: "Next cycle", value: "R2" },
    ],
  },
  {
    eyebrow: "Guided preview 02",
    title: "Resubmittal response matrix",
    description:
      "Organize what changed, what still needs an answer, and what must travel with the next submission package.",
    status: "Resubmittal package in prep",
    notes: [
      "Comments map to sheets, memos, and action owners.",
      "The next package is clear before upload day arrives.",
      "Teams can share a clean response matrix with clients or reviewers.",
    ],
    stats: [
      { label: "Resolved", value: "11" },
      { label: "Needs memo", value: "02" },
      { label: "Upload prep", value: "Ready" },
    ],
  },
  {
    eyebrow: "Guided preview 03",
    title: "Client and project status view",
    description:
      "Give principals, project managers, and clients a calmer readout of where approvals stand without forcing everyone into the underlying workflow detail.",
    status: "Shared weekly status",
    notes: [
      "The status story stays tied to real approval events.",
      "Milestones, blockers, and next moves are easy to scan.",
      "Leadership gets visibility without pulling the team into another spreadsheet.",
    ],
    stats: [
      { label: "Jurisdictions", value: "02" },
      { label: "Cycle status", value: "In review" },
      { label: "Client summary", value: "Live" },
    ],
  },
];

export const highlightModules = [
  {
    title: "NC jurisdiction intelligence",
    description: "Track departments, platforms, forms, and workflow checkpoints without starting from scratch each time.",
    icon: MapPinned,
  },
  {
    title: "Reviewer comment management",
    description: "Turn comment chaos into assigned issues, cleaner responses, and a more controlled next cycle.",
    icon: MessageSquareMore,
  },
  {
    title: "Resubmittal coordination",
    description: "See what changed, what is still open, and what the next submission package needs.",
    icon: Workflow,
  },
  {
    title: "Approval workflow visibility",
    description: "Give the broader project team one operational view of status, blockers, and next steps.",
    icon: ClipboardList,
  },
];
