import { compareRows } from "@/data/compare";
import { homeContent } from "@/data/home";
import { jurisdictions } from "@/data/jurisdictions";
import { pricingTiers } from "@/data/pricing";
import { resources } from "@/data/resources";
import { featureModules } from "@/data/product";
import { workflowStages } from "@/data/workflow";

export function getHomeContent() {
  return homeContent;
}

export function getFeatureModules() {
  return featureModules;
}

export function getWorkflowStages() {
  return workflowStages;
}

export function getPricingTiers() {
  return pricingTiers;
}

export function getCompareRows() {
  return compareRows;
}

export function getResources() {
  return resources;
}

export function getJurisdictionBySlug(slug: string) {
  return jurisdictions.find((jurisdiction) => jurisdiction.slug === slug);
}

export function getJurisdictionSlugs() {
  return jurisdictions.map((jurisdiction) => jurisdiction.slug);
}
