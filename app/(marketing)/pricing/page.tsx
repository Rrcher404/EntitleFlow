import { ArrowRight } from 'lucide-react';

import { CTABanner } from '@/components/marketing/cta-banner';
import { PageIntro } from '@/components/site/page-intro';
import { PricingCard } from '@/components/site/pricing-card';
import { SectionShell } from '@/components/site/section-shell';
import { FAQAccordionBlock } from '@/components/ui/faq-accordion-block';
import { Badge } from '@/components/ui/badge';
import { buildMetadata } from '@/lib/site-config';
import { pricingFaqs, pricingTiers } from '@/data/pricing';
import { TrackedLinkButton } from '@/components/site/tracked-link-button';

export const metadata = buildMetadata({
  title: 'Simple pricing. One flagship tier.',
  description:
    'EntitleFlow is $299/mo per firm. Unlimited projects, unlimited seats. First month of founder-led onboarding included.',
  path: '/pricing',
});

export default function PricingPage() {
  return (
    <>
      <SectionShell animate>
        <PageIntro
          description="One flagship tier. Unlimited projects, unlimited seats, AI-assisted classification included. The first month runs with the founder so the workspace fits your actual workflow."
          eyebrow="Pricing"
          title="One price. One product. Zero module-by-module upsell."
        />
      </SectionShell>

      <SectionShell className="py-10 sm:py-12" animate>
        <div className="mx-auto grid max-w-xl gap-6">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>
      </SectionShell>

      <SectionShell className="py-12 sm:py-14" animate>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="space-y-4">
            <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
              Pricing FAQ
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Enough clarity to start a real conversation.
            </h2>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              Simple pricing for a simple product. No tiers to choose between, no seats to count, no add-ons to upgrade into.
            </p>
            <TrackedLinkButton eventName="pricing_cta_click" eventProps={{ tier: 'Walkthrough' }} href="/walkthrough" size="lg">
              Book a walkthrough
              <ArrowRight className="h-4 w-4" />
            </TrackedLinkButton>
          </div>

          <div>
            <FAQAccordionBlock
              faqs={pricingFaqs}
              eyebrowLabel="Questions"
              title=""
            />
          </div>
        </div>
      </SectionShell>

      <CTABanner
        title="See the parse before the pricing conversation."
        description="Drop a reviewer PDF and see the structured comment list in under two minutes. Pricing makes more sense once the product is real."
        primaryHref="/try"
        primaryLabel="Try it with your PDF"
        secondaryHref="/walkthrough"
        secondaryLabel="Book a walkthrough"
      />
    </>
  );
}
