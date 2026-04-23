import type { ComparisonRow } from "@/lib/types";

export const compareRows: ComparisonRow[] = [
  {
    label: "Turns a reviewer redline PDF into a structured comment list",
    entitleFlow: "Upload the PDF. Get an assignable comment list in under two minutes.",
    manual: "Someone on the team retypes the PDF into a spreadsheet. Hours per review cycle.",
    generic: "Permit submission tools stop at upload. Markup tools stop at annotation. Neither closes the loop.",
  },
  {
    label: "Tracks who owns every comment and what has to ship",
    entitleFlow: "Owners, status, and response language live on every comment record in one workspace.",
    manual: "Status lives in email threads, personal trackers, and tribal memory.",
    generic: "Generic project tools capture tasks but do not understand the comment-to-resubmittal cycle.",
  },
  {
    label: "Priced where a small AEC team can actually afford it",
    entitleFlow: "$299/mo per firm. Unlimited projects, unlimited seats. First month of onboarding free.",
    manual: "Costs hours of senior-engineer time per cycle. Or $50K–$80K/yr for a dedicated permit coordinator.",
    generic: "Enterprise platforms start at thousands per month and require implementation overhead.",
  },
];
