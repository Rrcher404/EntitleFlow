'use client';

import { CTABanner } from '@/components/marketing/cta-banner';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { PageIntro } from '@/components/site/page-intro';
import { SectionShell } from '@/components/site/section-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { featureModules, productDifferentiators } from '@/data/product';

export function ProductPageClient() {
  return (
    <>
      <SectionShell animate>
        <PageIntro
          description="Two modules, one workspace. Redline parsing earns the demo. Response tracking is why teams pay. That is the entire product."
          eyebrow="Product"
          title="Redline parsing and response tracking, in one workspace."
        />
      </SectionShell>

      <FeatureGrid
        eyebrow="What the product does"
        title="Two modules. No module-by-module upsell."
        description="Drop the PDF. Assign the owners. Ship the resubmittal. The product stops where teams stop paying attention."
        features={featureModules}
      />

      <SectionShell animate>
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="space-y-4">
            <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
              Why it feels different
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Built around the real operating gap, not generic permitting software tropes.
            </h2>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              EntitleFlow is not trying to be a portal replacement or a broad national abstraction. It is built for the work regional teams actually struggle to coordinate.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {productDifferentiators.map((item) => (
              <Card key={item}>
                <CardContent className="p-5 text-sm leading-7 text-muted-foreground">{item}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SectionShell>

      <CTABanner
        title="See the parse happen on a real redline PDF."
        description="Drop one of your own redlines and see the structured comment list in under two minutes. No demo setup, no sales call to see it work."
        primaryHref="/try"
        primaryLabel="Try it with your PDF"
        secondaryHref="/walkthrough"
        secondaryLabel="Book a walkthrough"
      />
    </>
  );
}
