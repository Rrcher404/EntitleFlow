import type { CredibilitySignal, SiteNavItem } from "@/lib/types";

export const primaryNav: SiteNavItem[] = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
];

export const footerNav: SiteNavItem[] = [
  { href: "/walkthrough", label: "Book a walkthrough" },
  { href: "/try", label: "Try it with your PDF" },
  { href: "/product", label: "Product detail" },
  { href: "/compare", label: "Compare" },
  { href: "/resources", label: "Resources" },
  { href: "/nc-jurisdictions/greensboro", label: "Greensboro guide" },
  { href: "/nc-jurisdictions/raleigh", label: "Raleigh guide" },
  { href: "/privacy", label: "Privacy policy" },
];

export const credibilitySignals: CredibilitySignal[] = [
  {
    title: "Built for the part of the workflow everyone else ignores",
    description: "Most AEC software stops at submission. EntitleFlow starts where the reviewer comments come back.",
  },
  {
    title: "AI that actually reads redline PDFs",
    description: "Google Cloud Document AI and Vertex AI Gemini parse markups, not just text — scanned, native, or Bluebeam.",
  },
  {
    title: "Priced for the firms that feel the pain",
    description: "$299/mo per firm. Unlimited seats. First month of founder-led onboarding free.",
  },
  {
    title: "Founder-led onboarding",
    description: "First month runs with the founder directly so the workspace fits the way your team actually works.",
  },
];
