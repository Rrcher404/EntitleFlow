import type { Metadata } from "next";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const siteConfig = {
  name: "EntitleFlow",
  shortName: "EntitleFlow",
  description:
    "Reviewer redline PDFs become a structured, assignable comment list in under two minutes — then tracked through to the resubmittal.",
  siteUrl: rawSiteUrl.replace(/\/$/, ""),
  ogImage: "/entitleflow-og.svg",
  email: "support@entitleflow.com",
};

type MetadataInput = {
  title: string;
  description: string;
  path?: string;
};

export function buildMetadata({ title, description, path = "/" }: MetadataInput): Metadata {
  const fullTitle = `${title} | ${siteConfig.name}`;
  const url = `${siteConfig.siteUrl}${path}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(siteConfig.siteUrl),
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} launch site preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [siteConfig.ogImage],
    },
  };
}
