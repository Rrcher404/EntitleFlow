import type { LucideIcon } from "lucide-react";

export type SiteNavItem = {
  href: string;
  label: string;
};

export type FeatureModule = {
  title: string;
  description: string;
  icon: LucideIcon;
  highlights: string[];
};

export type GuideCard = {
  title: string;
  description: string;
  category: string;
  updatedAt: string;
  status: "Available now" | "Research preview" | "Coming next";
  href: string;
  ctaLabel: string;
};

export type ComparisonRow = {
  label: string;
  entitleFlow: string;
  manual: string;
  generic: string;
};

export type PreviewPanel = {
  eyebrow: string;
  title: string;
  description: string;
  status: string;
  notes: string[];
  stats: Array<{
    label: string;
    value: string;
  }>;
};

export type WorkflowStage = {
  number: string;
  title: string;
  job: string;
  value: string;
  clarity: string;
};

export type PricingTier = {
  name: string;
  price: string;
  description: string;
  bestFor: string;
  ctaLabel: string;
  ctaHref: string;
  eventName: AnalyticsEventName;
  featured?: boolean;
  highlights: string[];
};

export type CredibilitySignal = {
  title: string;
  description: string;
};

export type LeadIntent = "walkthrough" | "early-access";

export type WalkthroughFormValues = {
  intent: "walkthrough";
  fullName: string;
  email: string;
  company: string;
  companyType: string;
  activeNcJurisdictions: string;
  annualProjectVolume: string;
  biggestWorkflowIssue: string;
  issueCategory: "comments" | "resubmittals" | "status visibility" | "portal sprawl" | "other";
  sourcePath: string;
};

export type EarlyAccessFormValues = {
  intent: "early-access";
  fullName: string;
  email: string;
  company: string;
  companyType: string;
  primaryNcJurisdiction: string;
  note?: string;
  sourcePath: string;
};

export type MarketingLeadPayload = WalkthroughFormValues | EarlyAccessFormValues;

export type JurisdictionPageData = {
  slug: string;
  title: string;
  shortLabel: string;
  intro: string;
  systems: string[];
  workflowOverview: string[];
  painPoints: string[];
  entitleFlowHelps: string[];
  relatedGuideTitles: string[];
  updatedAt: string;
  verifiedAt: string;
  ctaTitle: string;
  ctaBody: string;
};

export type AnalyticsEventName =
  | "walkthrough_cta_click"
  | "early_access_cta_click"
  | "walkthrough_form_submit"
  | "early_access_form_submit"
  | "calendly_handoff_click"
  | "pricing_cta_click"
  | "guide_card_click"
  | "compare_page_cta_click"
  | "login_click"
  | "try_cta_click"
  | "try_upload_submit"
  | "try_sample_share_submit";
