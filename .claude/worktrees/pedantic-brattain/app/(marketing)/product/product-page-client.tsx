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
          description="EntitleFlow NC is designed as a control layer above fragmented approval systems so regional teams can manage comments, resubmittals, and visibility with less operational drag."
          eyebrow="Product"
          title="Development approval operations software for North Carolina."
        />
      </SectionShell>

      <FeatureGrid
        eyebrow="What the product does"
        title="A control layer for approval operations."
        description="EntitleFlow sits above fragmented public systems and helps private-side teams manage the real work that keeps projects moving."
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
        title="See the wedge in action before the next review cycle hits."
        description="If your team needs cleaner reviewer comment workflows, better resubmittal prep, or a clearer NC operating layer, a walkthrough is the best next step."
        primaryHref="/walkthrough"
        primaryLabel="Request a walkthrough"
        secondaryHref="/early-access"
        secondaryLabel="Join early access"
      />
    </>
  );
}
