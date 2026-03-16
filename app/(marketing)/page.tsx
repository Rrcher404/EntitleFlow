import { ArrowRight, CheckCircle2 } from "lucide-react";

import { FinalCtaBand } from "@/components/site/final-cta-band";
import { PreviewPanel } from "@/components/site/preview-panel";
import { SectionShell } from "@/components/site/section-shell";
import { TrackedLink } from "@/components/site/tracked-link";
import { TrackedLinkButton } from "@/components/site/tracked-link-button";
import { TrustBand } from "@/components/site/trust-band";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/lib/site-config";
import { featureModules } from "@/data/product";
import { getHomeContent } from "@/lib/content";
import { previewPanels } from "@/data/home";
import { workflowStages } from "@/data/workflow";
import { pricingTiers } from "@/data/pricing";

export const metadata = buildMetadata({
  title: "North Carolina approval workflows, comments, and resubmittals",
  description:
    "EntitleFlow NC helps architecture and civil firms manage reviewer comments, resubmittals, and approval workflow visibility across North Carolina jurisdictions.",
  path: "/",
});

export default function HomePage() {
  const content = getHomeContent();

  return (
    <>
      <SectionShell className="pb-12 pt-14 sm:pt-18">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-8">
            <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
              {content.hero.eyebrow}
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl font-display text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                {content.hero.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">{content.hero.description}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <TrackedLinkButton eventName="walkthrough_cta_click" href="/walkthrough" size="lg">
                Request a walkthrough
                <ArrowRight className="h-4 w-4" />
              </TrackedLinkButton>
              <TrackedLinkButton eventName="early_access_cta_click" href="/early-access" size="lg" variant="outline">
                Join early access
              </TrackedLinkButton>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { value: "NC-first", label: "Workflow depth built for regional firms" },
                { value: "1 view", label: "For comments, resubmittals, and status visibility" },
                { value: "Founder-led", label: "Walkthroughs and workflow audits at launch" },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-5">
                    <div className="font-display text-2xl font-semibold text-slate-950">{stat.value}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden border-slate-200 bg-white">
            <div className="border-b border-border bg-slate-950 px-6 py-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-300">Guided product preview</div>
                  <div className="mt-1 font-display text-2xl font-semibold">Approval operations dashboard</div>
                </div>
                <Badge className="border-emerald-400/30 bg-emerald-500/15 text-emerald-100" variant="outline">
                  Founder-led demo
                </Badge>
              </div>
            </div>
            <CardContent className="space-y-5 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <PreviewStat label="Jurisdiction" value="Greensboro, NC" sublabel="Planning + plan review tracking" />
                <PreviewStat label="Current cycle" value="Resubmittal 02" sublabel="3 open items · 2 in review" />
              </div>
              <div className="rounded-[26px] border border-border p-5">
                <div className="text-sm font-semibold text-slate-700">Comments in motion</div>
                <div className="mt-4 space-y-3">
                  {[
                    ["Stormwater notes need revised site detail", "Civil Team", "In progress"],
                    ["Fire access dimensions need response memo", "Architect", "Ready for review"],
                    ["Updated sheet naming needed before upload", "Project Ops", "Open"],
                  ].map(([title, owner, status]) => (
                    <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between" key={title}>
                      <div>
                        <div className="font-medium text-slate-900">{title}</div>
                        <div className="mt-1 text-sm text-slate-500">Owner: {owner}</div>
                      </div>
                      <Badge className="w-fit" variant="outline">
                        {status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <PreviewStat label="Permits mapped" value="06" sublabel="Local + related approvals" />
                <PreviewStat label="Response matrix" value="Ready" sublabel="Memo + sheet tracking" />
                <PreviewStat label="Client status" value="Shared" sublabel="Weekly visibility layer" />
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionShell>

      <SectionShell className="py-12">
        <TrustBand />
      </SectionShell>

      <SectionShell id="why-now">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
              Why now
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Portals are more digital. Approval operations are still fragmented.
            </h2>
            <p className="text-base leading-7 text-slate-600 sm:text-lg">
              EntitleFlow is built for the gap between submission and operational clarity: reviewer comments, resubmittals, internal ownership, and calmer client visibility.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {content.whyNow.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title}>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-semibold text-slate-950">{item.title}</h3>
                      <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </SectionShell>

      <SectionShell id="who-its-for" className="bg-slate-950 text-white">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="space-y-4">
            <Badge className="border-white/10 bg-white/10 text-white" variant="outline">
              Who it&apos;s for
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for architecture and civil firms managing repeat approval complexity.
            </h2>
            <p className="text-base leading-7 text-slate-300 sm:text-lg">
              EntitleFlow is designed for teams that need tighter control between submission and approval without living inside spreadsheets, private inboxes, and portal confusion.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {content.audiences.map((audience) => {
              const Icon = audience.icon;
              return (
                <div className="rounded-[28px] border border-white/10 bg-white/6 p-6" key={audience.title}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-5 space-y-2">
                    <h3 className="font-display text-xl font-semibold text-white">{audience.title}</h3>
                    <p className="text-sm leading-6 text-slate-300">{audience.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionShell>

      <SectionShell id="product">
        <div className="max-w-3xl space-y-4">
          <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
            What the product does
          </Badge>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            A control layer for North Carolina approval operations.
          </h2>
          <p className="text-base leading-7 text-slate-600 sm:text-lg">
            EntitleFlow sits above fragmented public systems and helps private-side teams manage the real work that keeps projects moving.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.title}>
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-semibold text-slate-950">{module.title}</h3>
                    <p className="text-sm leading-6 text-slate-600">{module.description}</p>
                  </div>
                  <ul className="space-y-2 text-sm leading-6 text-slate-700">
                    {module.highlights.slice(0, 2).map((highlight) => (
                      <li className="flex gap-3" key={highlight}>
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SectionShell>

      <SectionShell id="how-it-works" className="bg-white/70">
        <div className="max-w-3xl space-y-4">
          <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
            How it works
          </Badge>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Start narrow. Fix the ugliest part of the workflow first.
          </h2>
          <p className="text-base leading-7 text-slate-600 sm:text-lg">
            The first wedge is comments, resubmittals, and workflow visibility because that is where regional firms usually lose time, control, and coordination.
          </p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-4">
          {workflowStages.map((stage) => (
            <Card key={stage.number}>
              <CardContent className="space-y-4 p-6">
                <div className="text-sm font-semibold tracking-[0.18em] text-slate-400">{stage.number}</div>
                <div className="space-y-2">
                  <h3 className="font-display text-xl font-semibold text-slate-950">{stage.title}</h3>
                  <p className="text-sm leading-6 text-slate-700">{stage.job}</p>
                </div>
                <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{stage.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <div className="max-w-3xl space-y-4">
          <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
            Guided product preview
          </Badge>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Show the workflow, don&apos;t fake the full platform.
          </h2>
          <p className="text-base leading-7 text-slate-600 sm:text-lg">
            Launch conversations should make the wedge legible: reviewer comments, resubmittal prep, and clearer status visibility for the people who keep approvals moving.
          </p>
        </div>
        <div className="mt-12 grid gap-6 xl:grid-cols-3">
          {previewPanels.map((panel) => (
            <PreviewPanel key={panel.title} panel={panel} />
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
              Pricing preview
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Launch with a service-assisted path, not a vague “talk to sales” wall.
            </h2>
            <p className="text-base leading-7 text-slate-600 sm:text-lg">
              EntitleFlow launches with a workflow audit offer, clear starting prices, and founder-led onboarding for the first teams that want tighter approval operations.
            </p>
            <TrackedLink className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950" href="/pricing">
              See pricing and rollout paths
              <ArrowRight className="h-4 w-4" />
            </TrackedLink>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {pricingTiers.slice(0, 3).map((tier) => (
              <Card key={tier.name}>
                <CardContent className="space-y-3 p-5">
                  <div className="font-display text-xl font-semibold text-slate-950">{tier.name}</div>
                  <div className="text-2xl font-semibold text-slate-950">{tier.price}</div>
                  <p className="text-sm leading-6 text-slate-600">{tier.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-4">
            <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
              North Carolina depth
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Local credibility comes from useful workflow depth, not generic permitting language.
            </h2>
            <p className="text-base leading-7 text-slate-600 sm:text-lg">
              EntitleFlow is being shaped around real jurisdiction research so launch conversations can stay grounded in how approvals actually move in North Carolina.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {content.jurisdictionTeaser.map((item) => (
              <Card key={item}>
                <CardContent className="p-5 text-sm leading-6 text-slate-700">{item}</CardContent>
              </Card>
            ))}
            <Card className="border-slate-900 bg-slate-950 text-white md:col-span-2">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="font-display text-2xl font-semibold">Start with Greensboro and Raleigh.</div>
                  <p className="max-w-2xl text-sm leading-6 text-slate-300">
                    Two initial jurisdiction guides are live now. More NC workflow coverage is feeding into the launch site and early pilot conversations next.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                  <TrackedLinkButton eventName="guide_card_click" eventProps={{ title: "Greensboro guide" }} href="/nc-jurisdictions/greensboro" variant="secondary">
                    View Greensboro
                  </TrackedLinkButton>
                  <TrackedLinkButton eventName="guide_card_click" eventProps={{ title: "Raleigh guide" }} href="/nc-jurisdictions/raleigh" variant="outline">
                    View Raleigh
                  </TrackedLinkButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pt-8">
        <FinalCtaBand
          description="Book a walkthrough if your team wants cleaner reviewer comment handling, calmer resubmittals, or a clearer approval status layer before the next cycle gets noisy."
          title="Make approval operations easier to run before the chaos compounds."
        />
      </SectionShell>
    </>
  );
}

function PreviewStat({ label, value, sublabel }: { label: string; value: string; sublabel: string }) {
  return (
    <div className="rounded-[24px] border border-border p-4">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <div className="mt-2 font-display text-xl font-semibold text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{sublabel}</div>
    </div>
  );
}
