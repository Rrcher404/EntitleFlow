import { buildMetadata } from "@/lib/site-config";
import { trySamples } from "@/data/try-samples";
import { TryPageClient } from "./try-client";

export const metadata = buildMetadata({
  title: "Try it with your PDF",
  description:
    "Drop a reviewer redline PDF. See how EntitleFlow turns it into a structured, assignable comment list in under two minutes.",
  path: "/try",
});

export default function TryPage() {
  return <TryPageClient samples={trySamples} />;
}
