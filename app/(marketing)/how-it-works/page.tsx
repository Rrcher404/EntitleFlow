import { CTABanner } from '@/components/marketing/cta-banner';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { PageIntro } from '@/components/site/page-intro';
import { SectionShell } from '@/components/site/section-shell';
import { buildMetadata } from '@/lib/site-config';
import { workflowStages } from '@/data/workflow';

export const metadata = buildMetadata({
  title: 'How EntitleFlow works',
  description:
    'Four stages: drop the redline, organize the comments, draft the responses, ship the resubmittal. See how each step feels inside the workspace.',
  path: '/how-it-works',
});

export default function HowItWorksPage() {
  return (
    <>
      <SectionShell animate>
        <PageIntro
          description="Drop the reviewer PDF. Organize the comments. Draft the responses. Ship the resubmittal. Four stages, one workspace, no transcription."
          eyebrow="How it works"
          title="From reviewer redline to resubmittal — in four stages."
        />
      </SectionShell>

      <HowItWorks
        eyebrow="How it works"
        title="Start with the reviewer PDF. Ship the resubmittal clean."
        description="Redline parsing earns the demo. Response tracking is why teams pay. This is what that looks like stage by stage."
        stages={workflowStages}
      />

      <CTABanner
        title="See the parse before booking the walkthrough."
        description="Drop a reviewer PDF and see the structured comment list in under two minutes. Or book a walkthrough if you want the founder to walk you through your actual workflow."
        primaryHref="/try"
        primaryLabel="Try it with your PDF"
        secondaryHref="/walkthrough"
        secondaryLabel="Book a walkthrough"
      />
    </>
  );
}
