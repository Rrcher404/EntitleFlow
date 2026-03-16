import { GuideCard } from "@/components/site/guide-card";
import { PageIntro } from "@/components/site/page-intro";
import { SectionShell } from "@/components/site/section-shell";
import { DisclaimerBlock } from "@/components/site/disclaimer-block";
import { buildMetadata } from "@/lib/site-config";
import { resources } from "@/data/resources";

export const metadata = buildMetadata({
  title: "NC workflow guides and operational resources",
  description:
    "Explore early EntitleFlow NC workflow guides for Greensboro, Raleigh, and upcoming operational resources on reviewer comments and resubmittals.",
  path: "/resources",
});

export default function ResourcesPage() {
  return (
    <>
      <SectionShell>
        <PageIntro
          description="This launch hub is where PermitPilot is starting to publish North Carolina workflow depth. A few guides are live now, and more are being released as the research layer expands."
          eyebrow="Resources"
          title="North Carolina workflow guides and launch-stage operational resources."
        />
      </SectionShell>

      <SectionShell className="pt-4">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((guide) => (
            <GuideCard guide={guide} key={guide.title} />
          ))}
        </div>
      </SectionShell>

      <SectionShell className="pt-8">
        <DisclaimerBlock />
      </SectionShell>
    </>
  );
}
