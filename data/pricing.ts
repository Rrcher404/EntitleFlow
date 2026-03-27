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
      "Up to 5 seats (Admin, PM, and Contributor licenses included)",
      "Comments and resubmittal workflow setup",
      "10 GB document storage with 150 MB per-file uploads",
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
      "Up to 15 seats across all license types",
      "Expanded workflow coverage across active projects",
      "Company admin dashboard with audit trail and user management",
      "Guest Viewer access for external stakeholders",
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
      "Unlimited seats and custom license allocation",
      "Custom onboarding plan",
      "Expanded storage limits and file management",
      "Dedicated admin portal with advanced permissions",
      "Tailored rollout and reporting alignment",
    ],
  },
];

/**
 * Add-ons that can be purchased alongside any pricing tier.
 */
export const pricingAddOns = [
  {
    name: "FlowE AI Agents",
    price: "$30/portal/month",
    description: "AI-powered assistance for permit review, document analysis, and compliance guidance. Available per company portal.",
    features: [
      "AI-powered permit guidance and document analysis",
      "Compliance checking and verification",
      "Natural language queries about permits and workflows",
      "Multi-document context understanding",
    ],
  },
];

/**
 * License types and what each seat includes.
 * Displayed on the pricing page alongside tiers.
 */
export const licenseTypes = [
  {
    name: "Admin",
    price: "Included with plan",
    description:
      "Full platform access with organization-wide settings, user management, permissions, audit trail, and storage controls.",
    capabilities: [
      "Organization and user management",
      "Permission configuration and overrides",
      "Company admin dashboard and diagnostics",
      "Password policy and security controls",
      "Audit trail and activity export",
      "All Project Manager capabilities",
    ],
  },
  {
    name: "Project Manager",
    price: "Included with plan",
    description:
      "Manages projects, permits, comments, and team assignments. The primary workflow operator for day-to-day entitlement tracking.",
    capabilities: [
      "Create and manage projects and permits",
      "Upload documents and trigger AI parsing",
      "Assign and resolve reviewer comments",
      "View analytics and generate reports",
      "Manage deadlines and resubmittals",
    ],
  },
  {
    name: "Contributor",
    price: "Included with plan",
    description:
      "Responds to assigned comments, uploads documents, and tracks their own tasks within assigned projects.",
    capabilities: [
      "View assigned projects and permits",
      "Respond to and resolve assigned comments",
      "Upload documents to assigned projects",
      "Track personal task list and deadlines",
    ],
  },
  {
    name: "Guest Viewer",
    price: "Free (Growth+ plans)",
    description:
      "Read-only access for external stakeholders, clients, or reviewers who need visibility into project status without editing rights.",
    capabilities: [
      "View project and permit status",
      "View documents (no upload or download)",
      "View comment threads (read-only)",
      "Access shared analytics dashboards",
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
    question: "What license types are available?",
    answer:
      "Each plan includes Admin, Project Manager, and Contributor seat types. Growth and above plans also include Guest Viewer access for clients and external stakeholders. Each license type has its own permission set that can be customized per user.",
  },
  {
    question: "What are the file upload and storage limits?",
    answer:
      "All plans include 150 MB per-file upload limits. Starter plans include 10 GB of total document storage. Growth and Custom plans include expanded or unlimited storage.",
  },
  {
    question: "Can I book a walkthrough before I know which tier fits?",
    answer:
      "Yes. The walkthrough is the best place to sort out whether a workflow audit, a starter rollout, or a larger custom path makes the most sense.",
  },
];
