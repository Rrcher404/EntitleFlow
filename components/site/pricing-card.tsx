import { ArrowRight } from "lucide-react";

import { TrackedLinkButton } from "@/components/site/tracked-link-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PricingTier } from "@/lib/types";

type PricingCardProps = {
  tier: PricingTier;
};

export function PricingCard({ tier }: PricingCardProps) {
  return (
    <Card className={tier.featured ? "border-slate-900 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)]" : ""}>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-2xl font-semibold text-slate-950">{tier.name}</h3>
            {tier.featured ? <Badge variant="success">Launch focus</Badge> : null}
          </div>
          <div className="text-3xl font-semibold tracking-tight text-slate-950">{tier.price}</div>
          <p className="text-sm leading-6 text-slate-600">{tier.description}</p>
          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">{tier.bestFor}</p>
        </div>

        <ul className="space-y-3 text-sm leading-6 text-slate-700">
          {tier.highlights.map((highlight) => (
            <li className="flex gap-3" key={highlight}>
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>

        <TrackedLinkButton
          className="w-full justify-center"
          eventName={tier.eventName}
          eventProps={{ tier: tier.name }}
          href={tier.ctaHref}
          variant={tier.featured ? "default" : "outline"}
        >
          {tier.ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </TrackedLinkButton>
      </CardContent>
    </Card>
  );
}
