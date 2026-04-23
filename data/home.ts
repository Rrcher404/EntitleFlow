import {
  Activity,
  Building2,
  ClipboardList,
  FileSearch,
  MessageSquareMore,
  Workflow,
} from "lucide-react";

import type { PreviewPanel } from "@/lib/types";

export const homeContent = {
  hero: {
    eyebrow: "Permit comment operations for AEC teams",
    title: "Cut redline chaos. Ship the resubmittal clean.",
    description:
      "Drop a reviewer redline PDF. EntitleFlow turns it into a structured, assignable comment list in under two minutes — then tracks the response until the resubmittal ships.",
  },
  audiences: [
    {
      title: "Architecture firms",
      description: "Stop retyping reviewer markups into spreadsheets. Keep comments, owners, and response language in one workspace.",
      icon: Building2,
    },
    {
      title: "Civil and site teams",
      description: "Turn mixed-discipline redlines into assigned work without chasing email threads or inbox trackers.",
      icon: Workflow,
    },
    {
      title: "Developers and GCs",
      description: "Get real status visibility on every active permit cycle without asking your architect for a new update email.",
      icon: Activity,
    },
  ],
  whyNow: [
    {
      title: "Redlines still drive the rework",
      description: "Most submission software stops at upload. The ugliest work happens after — in the reviewer comments that come back and the resubmittal that has to answer them.",
      icon: MessageSquareMore,
    },
    {
      title: "PDF annotations do not fit in a tracker",
      description: "Bluebeam handles markup. Monday and Asana handle tasks. Nothing bridges the two — so teams transcribe PDFs by hand or lose comments in email.",
      icon: FileSearch,
    },
    {
      title: "Coordination costs more than the parse",
      description: "A single firm can carry 75 to 250 open reviewer comments at once. Hiring a permit coordinator costs $50K–$80K a year. A focused tool costs less and loses less.",
      icon: ClipboardList,
    },
  ],
  // Retained for type compatibility — now used only as a quiet list of upcoming jurisdiction content.
  jurisdictionTeaser: [
    "Greensboro and Guilford County guides",
    "Raleigh and Wake County guides",
    "Charlotte / Mecklenburg in research",
    "State-by-state expansion throughout 2026",
  ],
};

export const previewPanels: PreviewPanel[] = [
  {
    eyebrow: "Guided preview 01",
    title: "Redline parsing in under two minutes",
    description:
      "Upload the PDF your reviewer sent back. Every comment becomes a structured, assignable record — with the source page, the reviewer text, and the recommended owner already attached.",
    status: "25 comments parsed · ready for assignment",
    notes: [
      "Scanned PDFs, native PDFs, and Bluebeam markups all land as structured records.",
      "The source page and original markup stay linked to every comment.",
      "No retyping, no missed items, no spreadsheet drift.",
    ],
    stats: [
      { label: "Parse time", value: "<2 min" },
      { label: "Comments extracted", value: "25" },
      { label: "Source fidelity", value: "100%" },
    ],
  },
  {
    eyebrow: "Guided preview 02",
    title: "Response tracking and resubmittal prep",
    description:
      "Assign every comment to an owner, draft the response language in place, and build the resubmittal package without reopening five different tools.",
    status: "Resubmittal package in prep · 3 open",
    notes: [
      "Owners, status, and response copy live on the same record.",
      "Principals and PMs see a single live view of where the cycle stands.",
      "The next submission package is already assembled when upload day arrives.",
    ],
    stats: [
      { label: "Resolved", value: "22 / 25" },
      { label: "Needs memo", value: "02" },
      { label: "Upload prep", value: "Ready" },
    ],
  },
];

export const highlightModules = [
  {
    title: "Redline parsing",
    description: "Drop the PDF. Get a structured, assignable comment list in under two minutes. No transcription, no drift.",
    icon: FileSearch,
  },
  {
    title: "Response tracking",
    description: "Assign owners, draft responses, and build the resubmittal package in one workspace — not five tools.",
    icon: MessageSquareMore,
  },
];
