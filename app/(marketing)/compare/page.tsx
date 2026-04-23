import { ArrowRight } from 'lucide-react';

import { CTABanner } from '@/components/marketing/cta-banner';
import { ComparisonTable } from '@/components/site/comparison-table';
import { PageIntro } from '@/components/site/page-intro';
import { SectionShell } from '@/components/site/section-shell';
import { TrackedLinkButton } from '@/components/site/tracked-link-button';
import { buildMetadata } from '@/lib/site-config';
import { compareRows } from '@/data/compare';

export const metadata = buildMetadata({
  title: 'Compare EntitleFlow to manual workflows and generic tools',
  description:
    'See how EntitleFlow compares to spreadsheet-and-email workflows and generic national permitting software for AEC teams handling reviewer redlines.',
  path: '/compare',
});

export default function ComparePage() {
  return (
    <>
      <SectionShell animate>
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

      <SectionShell className="pt-4" animate>
        <ComparisonTable rows={compareRows} />
      </SectionShell>

      <CTABanner
        title="Skip the pitch. See how a redline becomes a structured list."
        description="Drop a reviewer PDF and see the parse in under two minutes — or book a walkthrough if your team would rather talk through the workflow first."
        primaryHref="/try"
        primaryLabel="Try it with your PDF"
        secondaryHref="/walkthrough"
        secondaryLabel="Book a walkthrough"
      />
    </>
  );
}
