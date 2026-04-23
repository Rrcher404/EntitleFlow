import { FileSearch, MessageSquareMore } from "lucide-react";

import type { FeatureModule } from "@/lib/types";

export const featureModules: FeatureModule[] = [
  {
    title: "Redline parsing",
    description: "Drop the reviewer PDF. Get a structured, assignable comment list in under two minutes — no transcription, no missed items.",
    icon: FileSearch,
    highlights: [
      "Scanned, native, and Bluebeam-marked PDFs all land as structured records.",
      "Source page and original markup stay linked to every comment.",
      "Recommended owner and discipline suggested on intake.",
    ],
  },
  {
    title: "Response tracking",
    description: "Assign comments, draft responses, and prep the resubmittal package in one workspace instead of five tools.",
    icon: MessageSquareMore,
    highlights: [
      "Owners, status, and response copy live on every comment record.",
      "Resubmittal package is already assembled when upload day arrives.",
      "Principals and clients see a single live view without extra update emails.",
    ],
  },
];

export const productDifferentiators = [
  "Built around the part of the workflow everyone else ignores: the reviewer comments that come back after submission.",
  "Priced for the firms that actually feel the pain, not just the enterprises that can afford anyone.",
  "Two modules, one workspace — no module-by-module upsell game.",
  "Founder-led onboarding in the first month so the product fits your team, not the other way around.",
];
