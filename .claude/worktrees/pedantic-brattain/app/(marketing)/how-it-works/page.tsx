import { CTABanner } from '@/components/marketing/cta-banner';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { PageIntro } from '@/components/site/page-intro';
import { SectionShell } from '@/components/site/section-shell';
import { buildMetadata } from '@/lib/site-config';
import { workflowStages } from '@/data/workflow';

export const metadata = buildMetadata({
  title: 'How EntitleFlow works',
  description:
    'See the four-stage EntitleFlow NC workflow: intake the project, map the approval path, organize reviewer comments, and coordinate resubmittals.',
  path: '/how-it-works',
});

export default function HowItWorksPage() {
  return (
    <>
      <SectionShell animate>
        <PageIntro
          description="EntitleFlow starts with the part of development approval work that usually turns into a manual mess: comments, resubmittals, and the visibility around them."
          eyebrow="How it works"
          title="A four-stage workflow for cleaner approval operations."
        />
      </SectionShell>

      <HowItWorks
        eyebrow="How it works"
        title="Start narrow. Fix the ugliest part of the workflow first."
        description="The first wedge is comments, resubmittals, and workflow visibility because that is where regional firms usually lose time, control, and coordination."
        stages={workflowStages}
      />

      <CTABanner
        title="Translate your current review-cycle friction into a cleaner process."
        description="If these stages look familiar, the walkthrough is where we can map the messy parts of your current workflow and show where EntitleFlow fits."
        primaryHref="/walkthrough"
        primaryLabel="Request a walkthrough"
        secondaryHref="/early-access"
        secondaryLabel="Join early access"
      />
    </>
  );
}
