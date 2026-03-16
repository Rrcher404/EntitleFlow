import { CheckCircle2 } from "lucide-react";

import { FinalCtaBand } from "@/components/site/final-cta-band";
import { PageIntro } from "@/components/site/page-intro";
import { SectionShell } from "@/components/site/section-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/lib/site-config";
import { featureModules, productDifferentiators } from "@/data/product";

export const metadata = buildMetadata({
  title: "Development approval operations software for North Carolina",
  description:
    "EntitleFlow NC combines jurisdiction intelligence, reviewer comment management, resubmittal coordination, and approval visibility for regional teams.",
  path: "/product",
});

export default function ProductPage() {
  return (
    <>
      <SectionShell>
        <PageIntro
          description="EntitleFlow NC is designed as a control layer above fragmented approval systems so regional teams can manage comments, resubmittals, and visibility with less operational drag."
          eyebrow="Product"
          title="Development approval operations software for North Carolina."
        />
      </SectionShell>

      <SectionShell className="pt-4">
        <div className="grid gap-4 md:grid-cols-2">
          {featureModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.title}>
                <CardContent className="space-y-5 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-display text-2xl font-semibold text-slate-950">{module.title}</h2>
                    <p className="text-sm leading-7 text-slate-600">{module.description}</p>
                  </div>
                  <ul className="space-y-3">
                    {module.highlights.map((highlight) => (
                      <li className="flex gap-3 text-sm leading-6 text-slate-700" key={highlight}>
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

      <SectionShell>
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="space-y-4">
            <Badge className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]" variant="outline">
              Why it feels different
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Built around the real operating gap, not generic permitting software tropes.
            </h2>
            <p className="text-base leading-7 text-slate-600 sm:text-lg">
              EntitleFlow is not trying to be a portal replacement or a broad national abstraction. It is built for the work regional teams actually struggle to coordinate.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {productDifferentiators.map((item) => (
              <Card key={item}>
                <CardContent className="p-5 text-sm leading-7 text-slate-700">{item}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pt-8">
        <FinalCtaBand
          description="If your team needs cleaner reviewer comment workflows, better resubmittal prep, or a clearer NC operating layer, a walkthrough is the best next step."
          title="See the wedge in action before the next review cycle hits."
        />
      </SectionShell>
    </>
  );
}
