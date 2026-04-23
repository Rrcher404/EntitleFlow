import { buildMetadata } from "@/lib/site-config";
import { trySamples } from "@/data/try-samples";
import { TryPageClient } from "./try-client";

export const metadata = buildMetadata({
  title: "Try it with your PDF",
  description:
    "See a reviewer redline PDF become a structured, assignable comment list. Browse a live sample or drop your own PDF for a founder-led follow-up.",
  path: "/try",
});

export default function TryPage() {
  return <TryPageClient samples={trySamples} />;
}
