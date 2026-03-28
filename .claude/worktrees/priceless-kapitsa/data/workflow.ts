import type { WorkflowStage } from "@/lib/types";

export const workflowStages: WorkflowStage[] = [
  {
    number: "01",
    title: "Intake the project",
    job: "Capture project location, approval context, discipline mix, and who will own the workflow.",
    value: "The team starts with cleaner assumptions instead of rebuilding the context in week two.",
    clarity: "EntitleFlow helps frame the project around the likely jurisdictions, approvals, and submission path.",
  },
  {
    number: "02",
    title: "Map the approval path",
    job: "Lay out the departments, systems, documents, and workflow checkpoints likely to matter for the job.",
    value: "Teams can see the likely approval path before portal complexity and timing risk become painful.",
    clarity: "EntitleFlow makes the path more legible across local systems, reviewers, and recurring process notes.",
  },
  {
    number: "03",
    title: "Organize reviewer comments",
    job: "Turn comments into assigned work with owners, statuses, and response language that can survive the next cycle.",
    value: "Issue handling becomes less reactive and less dependent on private inboxes and tribal memory.",
    clarity: "EntitleFlow keeps comments, owners, and response prep in a shared workflow instead of scattered tools.",
  },
  {
    number: "04",
    title: "Coordinate resubmittals and keep the project moving",
    job: "Prepare the next package, confirm what changed, and keep leadership and clients aligned on status.",
    value: "Projects move with fewer blind spots, cleaner resubmittals, and less internal scrambling before deadlines.",
    clarity: "EntitleFlow helps teams see what is ready, what is blocked, and what must go out next.",
  },
];
