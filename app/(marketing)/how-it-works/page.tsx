import { FinalCtaBand } from "@/components/site/final-cta-band";
import { PageIntro } from "@/components/site/page-intro";
import { SectionShell } from "@/components/site/section-shell";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/lib/site-config";
import { workflowStages } from "@/data/workflow";

export const metadata = buildMetadata({
  title: "How EntitleFlow works",
  description:
    "See the four-stage EntitleFlow NC workflow: intake the project, map the approval path, organize reviewer comments, and coordinate resubmittals.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return (
    <>
      <SectionShell>
        <PageIntro
          description="EntitleFlow starts with the part of development approval work that usually turns into a manual mess: comments, resubmittals, and the visibility around them."
          eyebrow="How it works"
          title="A four-stage workflow for cleaner approval operations."
        />
      </SectionShell>

      <SectionShell className="pt-4">
        <div className="grid gap-5">
          {workflowStages.map((stage) => (
            <Card key={stage.number}>
              <CardContent className="grid gap-6 p-6 lg:grid-cols-[140px_1fr_1fr]">
                <div className="text-sm font-semibold tracking-[0.18em] text-slate-400">{stage.number}</div>
                <div className="space-y-3">
                  <h2 className="font-display text-2xl font-semibold text-slate-950">{stage.title}</h2>
                  <p className="text-sm leading-7 text-slate-700">{stage.job}</p>
                </div>
                <div className="space-y-4">
                  <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">{stage.value}</p>
                  <p className="text-sm leading-6 text-slate-600">{stage.clarity}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="pt-8">
        <FinalCtaBand
          description="If these stages look familiar, the walkthrough is where we can map the messy parts of your current workflow and show where EntitleFlow fits."
          title="Translate your current review-cycle friction into a cleaner process."
        />
      </SectionShell>
    </>
  );
}
