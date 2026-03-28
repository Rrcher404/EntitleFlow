import type { CredibilitySignal, SiteNavItem } from "@/lib/types";

export const primaryNav: SiteNavItem[] = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/compare", label: "Compare" },
  { href: "/resources", label: "Resources" },
  { href: "/product", label: "Product" },
];

export const footerNav: SiteNavItem[] = [
  { href: "/walkthrough", label: "Request a walkthrough" },
  { href: "/early-access", label: "Join early access" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/nc-jurisdictions/greensboro", label: "Greensboro guide" },
  { href: "/nc-jurisdictions/raleigh", label: "Raleigh guide" },
  { href: "/privacy", label: "Privacy policy" },
];

export const credibilitySignals: CredibilitySignal[] = [
  {
    title: "North Carolina-first workflow depth",
    description: "Built around real Greensboro, Raleigh, Charlotte/Mecklenburg, and DEQ workflow research.",
  },
  {
    title: "Focused on the gap after submission",
    description: "Designed for the messy work between reviewer comments, resubmittals, and approvals.",
  },
  {
    title: "Made for regional operators",
    description: "Shaped for architecture and civil teams managing repeat approvals without enterprise overhead.",
  },
  {
    title: "Founder-led onboarding",
    description: "Launch motion starts with guided walkthroughs and workflow audits, not self-serve guesswork.",
  },
];
