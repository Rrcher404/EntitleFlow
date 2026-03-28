import type { ComparisonRow } from "@/lib/types";

export const compareRows: ComparisonRow[] = [
  {
    label: "North Carolina-specific workflow depth",
    entitleFlow: "Built around actual NC jurisdiction research and repeat workflow patterns.",
    manual: "Depends on who remembers the last project and where notes were saved.",
    generic: "Often broad but shallow when local workflow details start to matter.",
  },
  {
    label: "Reviewer comments and resubmittals",
    entitleFlow: "Designed around the ugliest part of the workflow: comments, ownership, and cleaner resubmittals.",
    manual: "Lives across PDFs, email threads, markups, and personal trackers.",
    generic: "May capture submission status without solving the comment-to-resubmittal loop.",
  },
  {
    label: "Regional firm fit",
    entitleFlow: "Shaped for architecture and civil firms that need control without enterprise theater.",
    manual: "Flexible but fragile, and usually expensive in team attention.",
    generic: "Can feel oversized, slow to adopt, or tuned for very different customer profiles.",
  },
  {
    label: "Operational clarity",
    entitleFlow: "Creates a shared workflow view for project teams, leadership, and clients.",
    manual: "Status usually has to be recreated every time someone asks for an update.",
    generic: "May expose system data without telling the team what actually needs to happen next.",
  },
  {
    label: "Speed to useful adoption",
    entitleFlow: "Starts with founder-led onboarding and a narrow operational wedge.",
    manual: "No real adoption work, but no durable operating layer either.",
    generic: "Often requires more process change before the team sees value.",
  },
];
