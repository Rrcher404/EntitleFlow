import { notFound } from 'next/navigation';

import { CTABanner } from '@/components/marketing/cta-banner';
import { DisclaimerBlock } from '@/components/site/disclaimer-block';
import { PageIntro } from '@/components/site/page-intro';
import { SectionShell } from '@/components/site/section-shell';
import { GuideCard } from '@/components/site/guide-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getJurisdictionBySlug, getJurisdictionSlugs } from '@/lib/content';
import { buildMetadata } from '@/lib/site-config';
import { formatDate } from '@/lib/utils';
import { resources } from '@/data/resources';

type JurisdictionPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getJurisdictionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: JurisdictionPageProps) {
  const { slug } = await params;
  const jurisdiction = getJurisdictionBySlug(slug);

  if (!jurisdiction) {
    return buildMetadata({
      title: 'NC jurisdiction guide',
      description: 'EntitleFlow NC workflow guide.',
      path: `/nc-jurisdictions/${slug}`,
    });
  }

  return buildMetadata({
    title: jurisdiction.title,
    description: jurisdiction.intro,
    path: `/nc-jurisdictions/${slug}`,
  });
}

export default async function JurisdictionPage({ params }: JurisdictionPageProps) {
  const { slug } = await params;
  const jurisdiction = getJurisdictionBySlug(slug);

  if (!jurisdiction) {
    notFound();
  }

  const relatedGuides = resources.filter((resource) => jurisdiction.relatedGuideTitles.includes(resource.title));

  return (
    <>
      <SectionShell animate>
        <div className="space-y-6">
          <PageIntro
            description={jurisdiction.intro}
            eyebrow="NC jurisdiction guide"
            title={jurisdiction.title}
          />
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <Badge variant="outline">Last updated {formatDate(jurisdiction.updatedAt)}</Badge>
            <Badge variant="outline">Last verified {formatDate(jurisdiction.verifiedAt)}</Badge>
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pt-4" animate>
        <div className="grid gap-6 lg:grid-cols-3">
          <InfoCard items={jurisdiction.systems} title="Departments and systems involved" />
          <InfoCard items={jurisdiction.workflowOverview} title="Workflow overview" />
          <InfoCard items={jurisdiction.painPoints} title="Common pain points" />
        </div>
      </SectionShell>

      <SectionShell animate>
        <div className="grid gap-10 lg:grid-cols-[0.74fr_1.26fr]">
          <div className="space-y-4">
            <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
              Where EntitleFlow helps
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Organize the workflow above the public systems.
            </h2>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              EntitleFlow is not the official system of record. It helps the private-side team manage comments, resubmittals, and status visibility more cleanly while those public systems stay in place.
            </p>
          </div>
          <div className="grid gap-4">
            {jurisdiction.entitleFlowHelps.map((item) => (
              <Card key={item}>
                <CardContent className="p-5 text-sm leading-7 text-muted-foreground">{item}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pt-4" animate>
        <DisclaimerBlock />
      </SectionShell>

      <SectionShell animate>
        <div className="space-y-8">
          <div className="space-y-3">
            <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
              Related guides
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Related resources for {jurisdiction.shortLabel}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedGuides.map((guide) => (
              <GuideCard guide={guide} key={guide.title} />
            ))}
          </div>
        </div>
      </SectionShell>

      <CTABanner
        title={jurisdiction.ctaTitle}
        description={jurisdiction.ctaBody}
        primaryHref="/walkthrough"
        primaryLabel="Request a walkthrough"
        secondaryHref="/early-access"
        secondaryLabel="Join early access"
      />
    </>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
        <ul className="space-y-3">
          {items.map((item) => (
            <li className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-muted-foreground" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
