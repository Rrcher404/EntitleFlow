import { ClipboardList, MapPinned, MessageSquareMore, Workflow } from "lucide-react";

import type { FeatureModule } from "@/lib/types";

export const featureModules: FeatureModule[] = [
  {
    title: "NC jurisdiction intelligence",
    description: "Search jurisdiction workflows, departments, portals, submission touchpoints, and known process friction in one place.",
    icon: MapPinned,
    highlights: [
      "Track official systems and workflow splits by jurisdiction.",
      "Keep local process notes attached to actual teams and projects.",
      "Build repeatable NC knowledge without another disconnected spreadsheet.",
    ],
  },
  {
    title: "Reviewer comment management",
    description: "Turn reviewer comments into structured issues with owners, statuses, and cleaner response language.",
    icon: MessageSquareMore,
    highlights: [
      "Organize comments by discipline, cycle, and status.",
      "Reduce duplicated work across markups, PDFs, and inbox threads.",
      "Keep response prep visible before the next upload deadline hits.",
    ],
  },
  {
    title: "Resubmittal coordination",
    description: "Coordinate what changed, what is still open, and what has to travel in the next package.",
    icon: Workflow,
    highlights: [
      "Make the next submission package less reactive.",
      "Track supporting memos, sheets, and attachments by issue.",
      "Create a cleaner handoff between reviewers, PMs, and discipline leads.",
    ],
  },
  {
    title: "Approval workflow visibility",
    description: "Give principals, PMs, and clients a shared operational readout of where a project stands.",
    icon: ClipboardList,
    highlights: [
      "Surface status without exposing every internal task.",
      "Reduce ad hoc client update requests.",
      "Keep approvals tied to actual events and next steps.",
    ],
  },
];

export const productDifferentiators = [
  "North Carolina-specific workflow depth instead of a generic national template.",
  "A control layer above fragmented portals, not another portal replacement story.",
  "Built around reviewer comments and resubmittals, where smaller firms lose time and control.",
  "Founder-led onboarding that fits regional teams instead of forcing enterprise implementation overhead.",
];
