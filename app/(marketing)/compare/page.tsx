import { ArrowRight } from "lucide-react";

import { ComparisonTable } from "@/components/site/comparison-table";
import { FinalCtaBand } from "@/components/site/final-cta-band";
import { PageIntro } from "@/components/site/page-intro";
import { SectionShell } from "@/components/site/section-shell";
import { TrackedLinkButton } from "@/components/site/tracked-link-button";
import { buildMetadata } from "@/lib/site-config";
import { compareRows } from "@/data/compare";

export const metadata = buildMetadata({
  title: "Compare EntitleFlow to manual workflows and generic tools",
  description:
    "See how EntitleFlow NC differs from spreadsheet-and-email workflows and generic national permitting software for regional North Carolina teams.",
  path: "/compare",
});

export default function ComparePage() {
  return (
    <>
      <SectionShell>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <PageIntro
            description="This comparison is about buyer needs, not competitor theater: local workflow depth, comments and resubmittals, regional fit, and speed to useful adoption."
            eyebrow="Compare"
            title="A better operating layer than spreadsheets and broader generic software."
          />
          <TrackedLinkButton eventName="compare_page_cta_click" href="/walkthrough" size="lg">
            See the workflow in a walkthrough
            <ArrowRight className="h-4 w-4" />
          </TrackedLinkButton>
        </div>
      </SectionShell>

      <SectionShell className="pt-4">
        <ComparisonTable rows={compareRows} />
      </SectionShell>

      <SectionShell className="pt-8">
        <FinalCtaBand
          description="If your current stack is still a pile of portals, PDFs, inboxes, and private trackers, a walkthrough is the fastest way to see whether EntitleFlow fits your team."
          title="Move from workflow sprawl to a cleaner operating layer."
        />
      </SectionShell>
    </>
  );
}
