import { CalendarRange, CheckCircle2 } from "lucide-react";

import { TrackedLinkButton } from "@/components/site/tracked-link-button";
import { Card, CardContent } from "@/components/ui/card";

type FormSuccessStateProps = {
  title: string;
  description: string;
  nextStepLabel?: string;
  nextStepHref?: string;
  nextStepEventName?: "walkthrough_cta_click" | "early_access_cta_click" | "calendly_handoff_click";
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function FormSuccessState({
  title,
  description,
  nextStepLabel,
  nextStepHref,
  nextStepEventName,
  secondaryLabel,
  secondaryHref,
}: FormSuccessStateProps) {
  return (
    <Card className="border-emerald-200 bg-emerald-50 shadow-none">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-800">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-2xl font-semibold text-emerald-950">{title}</h3>
            <p className="text-sm leading-7 text-emerald-950/80">{description}</p>
          </div>
        </div>

        {(nextStepLabel && nextStepHref) || (secondaryLabel && secondaryHref) ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            {nextStepLabel && nextStepHref ? (
              <TrackedLinkButton eventName={nextStepEventName} href={nextStepHref} size="lg">
                <CalendarRange className="h-4 w-4" />
                {nextStepLabel}
              </TrackedLinkButton>
            ) : null}
            {secondaryLabel && secondaryHref ? (
              <TrackedLinkButton eventName="walkthrough_cta_click" href={secondaryHref} size="lg" variant="outline">
                {secondaryLabel}
              </TrackedLinkButton>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
