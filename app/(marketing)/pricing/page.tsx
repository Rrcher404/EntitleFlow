import { ArrowRight } from 'lucide-react';

import { CTABanner } from '@/components/marketing/cta-banner';
import { PageIntro } from '@/components/site/page-intro';
import { PricingCard } from '@/components/site/pricing-card';
import { SectionShell } from '@/components/site/section-shell';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { buildMetadata } from '@/lib/site-config';
import { pricingFaqs, pricingTiers } from '@/data/pricing';
import { TrackedLinkButton } from '@/components/site/tracked-link-button';

export const metadata = buildMetadata({
  title: 'Launch pricing and workflow audit paths',
  description:
    'EntitleFlow NC launches with a Permit Readiness Sprint, starter platform pricing, growth paths, and founder-led walkthroughs for North Carolina teams.',
  path: '/pricing',
});

export default function PricingPage() {
  return (
    <>
      <SectionShell animate>
        <PageIntro
          description="EntitleFlow launches with a service-assisted workflow audit path, clear software starting points, and founder-led guidance for North Carolina teams that need cleaner approval operations."
          eyebrow="Pricing"
          title="Pricing that matches a launch-stage workflow product."
        />
      </SectionShell>

      <SectionShell className="pt-4" animate>
        <div className="grid gap-6 xl:grid-cols-4">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>
      </SectionShell>

      <SectionShell animate>
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: 'Permit Readiness Sprint',
              body: 'Best when a live workflow already feels messy and the team needs a clean operational read before software rollout.',
            },
            {
              title: 'Starter / Growth',
              body: 'Best when the team wants to move from workflow pain into a clearer launch path with comments, resubmittals, and visibility in view.',
            },
            {
              title: 'What the walkthrough includes',
              body: 'A founder-led review of your current review-cycle friction, NC jurisdiction mix, and whether a workflow audit or platform path is the right next step.',
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="space-y-3 p-6">
                <Badge variant="outline">{item.title}</Badge>
                <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell animate>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="space-y-4">
            <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
              Pricing FAQ
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Enough clarity to start a real conversation.
            </h2>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              Launch pricing should make the business feel serious without pretending every edge case is already fully productized.
            </p>
            <TrackedLinkButton eventName="pricing_cta_click" eventProps={{ tier: 'Walkthrough' }} href="/walkthrough" size="lg">
              Request a walkthrough
              <ArrowRight className="h-4 w-4" />
            </TrackedLinkButton>
          </div>

          <Card>
            <CardContent className="p-6">
              <Accordion collapsible className="w-full" type="single">
                {pricingFaqs.map((faq) => (
                  <AccordionItem key={faq.question} value={faq.question}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </SectionShell>

      <CTABanner
        title="Book a walkthrough to see where your team fits."
        description="If you want to pressure-test the right entry point, the walkthrough is the best place to sort out workflow audit fit, rollout scope, and launch timing."
        primaryHref="/walkthrough"
        primaryLabel="Request a walkthrough"
        secondaryHref="/early-access"
        secondaryLabel="Join early access"
      />
    </>
  );
}
