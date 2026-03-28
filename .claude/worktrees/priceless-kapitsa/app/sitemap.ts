import type { MetadataRoute } from "next";

import { getJurisdictionSlugs } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/pricing",
    "/walkthrough",
    "/early-access",
    "/compare",
    "/resources",
    "/product",
    "/how-it-works",
    "/privacy",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteConfig.siteUrl}${route}`,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...getJurisdictionSlugs().map((slug) => ({
      url: `${siteConfig.siteUrl}/nc-jurisdictions/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
