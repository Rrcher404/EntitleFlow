import type { PricingTier } from "@/lib/types";

export const pricingTiers: PricingTier[] = [
  {
    name: "Permit Readiness Sprint",
    price: "Starting at $3,500",
    description: "A fast workflow audit for teams that want to clean up a live approval process before the chaos compounds.",
    bestFor: "Best for firms that need a near-term workflow reset on active NC projects.",
    ctaLabel: "Book a workflow audit",
    ctaHref: "/walkthrough?focus=workflow-audit",
    eventName: "pricing_cta_click",
    highlights: [
      "Workflow audit and current-state review",
      "Reviewer comment and resubmittal risk mapping",
      "Recommendation summary for EntitleFlow rollout readiness",
    ],
  },
  {
    name: "Starter",
    price: "Starting at $1,500/mo",
    description: "A focused launch path for regional teams that want cleaner approval operations without heavy implementation overhead.",
    bestFor: "Best for architecture and civil firms starting with a few repeat project workflows.",
    ctaLabel: "Request a walkthrough",
    ctaHref: "/walkthrough",
    eventName: "pricing_cta_click",
    featured: true,
    highlights: [
      "Founder-led onboarding",
      "Comments and resubmittal workflow setup",
      "North Carolina-first process structure",
    ],
  },
  {
    name: "Growth",
    price: "From $3,500/mo",
    description: "A deeper operating layer for firms coordinating more teams, more jurisdictions, and more approval cycles.",
    bestFor: "Best for firms that need broader visibility across projects and repeat jurisdiction workflows.",
    ctaLabel: "Request a walkthrough",
    ctaHref: "/walkthrough?focus=growth",
    eventName: "pricing_cta_click",
    highlights: [
      "Expanded workflow coverage across active projects",
      "Broader internal visibility and process alignment",
      "Higher-touch rollout support for repeat approvals",
    ],
  },
  {
    name: "Larger teams",
    price: "Custom",
    description: "A tailored engagement for organizations that need custom rollout planning, broader workflow coverage, or a more structured implementation path.",
    bestFor: "Best for multi-office teams, larger builders, or more complex rollout needs.",
    ctaLabel: "Talk to us",
    ctaHref: "/walkthrough?focus=custom",
    eventName: "pricing_cta_click",
    highlights: [
      "Custom onboarding plan",
      "Expanded workflow review",
      "Tailored rollout and reporting alignment",
    ],
  },
];

export const pricingFaqs = [
  {
    question: "Is the Permit Readiness Sprint software or a service?",
    answer:
      "It is a service-assisted workflow audit and launch readiness offer. It helps teams understand where EntitleFlow can reduce friction before a broader platform rollout.",
  },
  {
    question: "Do I need to be based only in North Carolina?",
    answer:
      "No, but the launch site and initial workflow depth are intentionally North Carolina-first. The strongest fit today is a team doing repeat work in NC jurisdictions.",
  },
  {
    question: "Can I book a walkthrough before I know which tier fits?",
    answer:
      "Yes. The walkthrough is the best place to sort out whether a workflow audit, a starter rollout, or a larger custom path makes the most sense.",
  },
];
