import type { PricingTier } from "@/lib/types";

export const pricingTiers: PricingTier[] = [
  {
    name: "EntitleFlow",
    price: "$299/mo per firm",
    description:
      "One flagship tier. Unlimited projects, unlimited seats. First month of onboarding runs with the founder directly so the workspace fits your actual workflow.",
    bestFor: "Best for AEC teams that deal with reviewer redline PDFs on active permit cycles.",
    ctaLabel: "Book a walkthrough",
    ctaHref: "/walkthrough",
    eventName: "pricing_cta_click",
    featured: true,
    highlights: [
      "Redline parsing — drop any PDF, get a structured comment list in under two minutes",
      "Response tracking — assign, respond, and prep the resubmittal package in one place",
      "Unlimited projects and unlimited seats across your firm",
      "First month of founder-led onboarding included",
      "AI-assisted classification and response drafting built in",
    ],
  },
];

/**
 * Add-ons — kept empty during amputation to reduce surface area.
 * FlowE AI Agents were previously a separate $30/mo add-on. They are now bundled into the flagship tier.
 */
export const pricingAddOns: Array<{
  name: string;
  price: string;
  description: string;
  features: string[];
}> = [];

/**
 * License types — hidden during amputation. One effective seat type (everyone in the firm can contribute).
 * Role-based permissions still exist in the portal; the taxonomy returns when we have 10+ paying customers.
 */
export const licenseTypes: Array<{
  name: string;
  price: string;
  description: string;
  capabilities: string[];
}> = [];

export const pricingFaqs = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes. The first month of onboarding runs with the founder directly — no cost until you see real value in your own workflow. Pricing starts the month after.",
  },
  {
    question: "Do I have to be based in North Carolina?",
    answer:
      "No. EntitleFlow was built in North Carolina and our first customers are here, but the product works for any AEC firm in the US that gets reviewer redline PDFs back from a municipality.",
  },
  {
    question: "What happens after the first month?",
    answer:
      "You pay $299/mo per firm. Unlimited projects, unlimited seats. If EntitleFlow is not saving your team real time by the end of the onboarding month, do not pay. We want durable customers, not trapped ones.",
  },
];
