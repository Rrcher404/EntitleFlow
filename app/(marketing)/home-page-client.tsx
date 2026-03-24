'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { CTABanner } from '@/components/marketing/cta-banner';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { HeroSection } from '@/components/marketing/hero-section';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { TrustBand } from '@/components/marketing/trust-band';
import { SectionShell } from '@/components/site/section-shell';
import { TrackedLink } from '@/components/site/tracked-link';
import { TrackedLinkButton } from '@/components/site/tracked-link-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { featureModules } from '@/data/product';
import { getHomeContent } from '@/lib/content';
import { workflowStages } from '@/data/workflow';
import { pricingTiers } from '@/data/pricing';
import { credibilitySignals } from '@/data/site';
import { previewPanels } from '@/data/home';
import { PreviewPanel } from '@/components/site/preview-panel';

export function HomePageClient() {
  const content = getHomeContent();

  const stats = [
    { value: 'NC-first', label: 'Workflow depth built for regional firms' },
    { value: '1 view', label: 'For comments, resubmittals, and status visibility' },
    { value: 'Founder-led', label: 'Walkthroughs and workflow audits at launch' },
  ];

  const trustBandItems = credibilitySignals.map((signal) => ({
    icon: CheckCircle2,
    value: signal.title,
    description: signal.description,
  }));

  return (
    <>
      {/* Hero Section */}
      <SectionShell className="pt-0 pb-8 sm:pb-10" animate>
        <HeroSection
          eyebrow={content.hero.eyebrow}
          title={content.hero.title}
          description={content.hero.description}
          stats={stats}
        />
      </SectionShell>

      {/* Trust Band */}
      <SectionShell animate>
        <TrustBand items={trustBandItems} />
      </SectionShell>

      {/* Why Now Section */}
      <SectionShell id="why-now" className="py-12 sm:py-14" animate>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
              Why now
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Portals are more digital. Approval operations are still fragmented.
            </h2>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              EntitleFlow is built for the gap between submission and operational clarity: reviewer comments, resubmittals, internal ownership, and calmer client visibility.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {content.whyNow.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title}>
                  <CardContent className="space-y-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </SectionShell>

      {/* Who It's For Section */}
      <SectionShell id="who-its-for" className="bg-primary text-primary-foreground py-12 sm:py-14" animate>
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="space-y-4">
            <Badge className="border-primary-foreground/10 bg-primary-foreground/5" variant="outline">
              Who it&apos;s for
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for architecture and civil firms managing repeat approval complexity.
            </h2>
            <p className="text-base leading-7 text-primary-foreground/70 sm:text-lg">
              EntitleFlow is designed for teams that need tighter control between submission and approval without living inside spreadsheets, private inboxes, and portal confusion.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {content.audiences.map((audience) => {
              const Icon = audience.icon;
              return (
                <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-5" key={audience.title}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="mt-5 space-y-2">
                    <h3 className="font-display text-xl font-semibold">{audience.title}</h3>
                    <p className="text-sm leading-6 text-primary-foreground/70">{audience.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionShell>

      {/* Feature Grid */}
      <FeatureGrid
        eyebrow="What the product does"
        title="A control layer for North Carolina approval operations."
        description="EntitleFlow sits above fragmented public systems and helps private-side teams manage the real work that keeps projects moving."
        features={featureModules}
      />

      {/* How It Works */}
      <HowItWorks
        eyebrow="How it works"
        title="Start narrow. Fix the ugliest part of the workflow first."
        description="The first wedge is comments, resubmittals, and workflow visibility because that is where regional firms usually lose time, control, and coordination."
        stages={workflowStages}
      />

      {/* Guided Product Preview */}
      <SectionShell className="py-12 sm:py-14" animate>
        <div className="max-w-3xl space-y-4">
          <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
            Guided product preview
          </Badge>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Show the workflow, don&apos;t fake the full platform.
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Launch conversations should make the wedge legible: reviewer comments, resubmittal prep, and clearer status visibility for the people who keep approvals moving.
          </p>
        </div>
        <div className="mt-10 grid gap-6 xl:grid-cols-3">
          {previewPanels.map((panel) => (
            <PreviewPanel key={panel.title} panel={panel} />
          ))}
        </div>
      </SectionShell>

      {/* Pricing Preview */}
      <SectionShell className="py-12 sm:py-14" animate>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
              Pricing preview
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Launch with a service-assisted path, not a vague &ldquo;talk to sales&rdquo; wall.
            </h2>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              EntitleFlow launches with a workflow audit offer, clear starting prices, and founder-led onboarding for the first teams that want tighter approval operations.
            </p>
            <TrackedLink className="inline-flex items-center gap-2 text-sm font-semibold text-foreground" href="/pricing">
              See pricing and rollout paths
              <ArrowRight className="h-4 w-4" />
            </TrackedLink>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {pricingTiers.slice(0, 3).map((tier) => (
              <Card key={tier.name}>
                <CardContent className="space-y-3 p-4">
                  <div className="font-display text-xl font-semibold text-foreground">{tier.name}</div>
                  <div className="text-2xl font-semibold text-foreground">{tier.price}</div>
                  <p className="text-sm leading-6 text-muted-foreground">{tier.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SectionShell>

      {/* North Carolina Depth */}
      <SectionShell className="py-12 sm:py-14" animate>
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-4">
            <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
              North Carolina depth
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Local credibility comes from useful workflow depth, not generic permitting language.
            </h2>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              EntitleFlow is being shaped around real jurisdiction research so launch conversations can stay grounded in how approvals actually move in North Carolina.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {content.jurisdictionTeaser.map((item) => (
              <Card key={item}>
                <CardContent className="p-4 text-sm leading-6 text-muted-foreground">{item}</CardContent>
              </Card>
            ))}
            <Card className="bg-primary text-primary-foreground md:col-span-2">
              <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="font-display text-2xl font-semibold">Start with Greensboro and Raleigh.</div>
                  <p className="max-w-2xl text-sm leading-6 text-primary-foreground/70">
                    Two initial jurisdiction guides are live now. More NC workflow coverage is feeding into the launch site and early pilot conversations next.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                  <TrackedLinkButton
                    className="bg-white text-foreground hover:bg-white/90"
                    eventName="guide_card_click"
                    eventProps={{ title: 'Greensboro guide' }}
                    href="/nc-jurisdictions/greensboro"
                    variant="secondary"
                  >
                    View Greensboro
                  </TrackedLinkButton>
                  <TrackedLinkButton
                    className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                    eventName="guide_card_click"
                    eventProps={{ title: 'Raleigh guide' }}
                    href="/nc-jurisdictions/raleigh"
                    variant="outline"
                  >
                    View Raleigh
                  </TrackedLinkButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SectionShell>

      {/* CTA Banner */}
      <CTABanner
        title="Make approval operations easier to run before the chaos compounds."
        description="Book a walkthrough if your team wants cleaner reviewer comment handling, calmer resubmittals, or a clearer approval status layer before the next cycle gets noisy."
        primaryHref="/walkthrough"
        primaryLabel="Request a walkthrough"
        secondaryHref="/early-access"
        secondaryLabel="Join early access"
      />
    </>
  );
}
