import { CalendarCheck2, ClipboardList, MessageSquareText, Network } from 'lucide-react';

import { WalkthroughForm } from '@/components/forms/walkthrough-form';
import { PageIntro } from '@/components/site/page-intro';
import { SectionShell } from '@/components/site/section-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { buildMetadata } from '@/lib/site-config';

type WalkthroughPageProps = {
  searchParams: Promise<{
    focus?: string;
  }>;
};

export const metadata = buildMetadata({
  title: 'Request a walkthrough',
  description:
    'Book a founder-led EntitleFlow NC walkthrough focused on reviewer comments, resubmittals, and approval workflow visibility.',
  path: '/walkthrough',
});

export default async function WalkthroughPage({ searchParams }: WalkthroughPageProps) {
  const params = await searchParams;
  const focus = params.focus;
  const sourcePath = focus ? `/walkthrough?focus=${focus}` : '/walkthrough';

  return (
    <SectionShell animate>
      <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-8">
          <PageIntro
            description="This is a founder-led session built to understand where your team is losing control between reviewer comments, resubmittals, and project status visibility."
            eyebrow="Request a walkthrough"
            title="See how EntitleFlow could fit your approval workflow."
          />

          <div className="grid gap-4">
            {[
              {
                icon: MessageSquareText,
                title: 'Reviewer comments',
                body: 'See how messy review notes can become a structured, owner-based workflow.',
              },
              {
                icon: ClipboardList,
                title: 'Resubmittal prep',
                body: 'Talk through where response matrices, memos, and next-package coordination are slowing the team down.',
              },
              {
                icon: Network,
                title: 'Workflow visibility',
                body: 'Surface where principals, PMs, and clients need a clearer status layer without more spreadsheet theater.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title}>
                  <CardContent className="flex gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-display text-xl font-semibold text-foreground">{item.title}</div>
                      <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-emerald-200 bg-emerald-50 shadow-none">
            <CardContent className="flex gap-4 p-6">
              <CalendarCheck2 className="mt-1 h-5 w-5 shrink-0 text-emerald-800" />
              <div className="space-y-2">
                <div className="font-medium text-emerald-950">What the walkthrough covers</div>
                <p className="text-sm leading-6 text-emerald-950/80">
                  Your current NC jurisdictions, where reviewer comments and resubmittals get messy, whether a Permit Readiness Sprint makes sense, and what an initial rollout path could look like.
                </p>
                {focus ? <Badge variant="success">Context: {focus.replace(/-/g, ' ')}</Badge> : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold text-foreground">Tell us a bit about your workflow.</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                We use this to make the walkthrough more useful and to keep the next step from turning into generic discovery theater.
              </p>
            </div>
            <WalkthroughForm sourcePath={sourcePath} />
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}
