import { ArrowRight } from "lucide-react";

import { Eyebrow } from "@/components/site/eyebrow";
import { TrackedLinkButton } from "@/components/site/tracked-link-button";

type FinalCtaBandProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function FinalCtaBand({
  eyebrow = "Launch with clearer approval operations",
  title,
  description,
}: FinalCtaBandProps) {
  return (
    <div className="rounded-xl bg-primary px-8 py-10 text-primary-foreground shadow-lg sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
      <div className="max-w-2xl space-y-4">
        <Eyebrow className="border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground" variant="outline">
          {eyebrow}
        </Eyebrow>
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        <p className="text-base leading-7 text-primary-foreground/70 sm:text-lg">{description}</p>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col">
        <TrackedLinkButton className="justify-center bg-white text-slate-950 hover:bg-white/90" eventName="walkthrough_cta_click" href="/walkthrough" size="lg" variant="secondary">
          Request a walkthrough
          <ArrowRight className="h-4 w-4" />
        </TrackedLinkButton>
        <TrackedLinkButton
          className="justify-center border-primary-foreground/15 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
          eventName="early_access_cta_click"
          href="/early-access"
          size="lg"
          variant="outline"
        >
          Join early access
        </TrackedLinkButton>
      </div>
    </div>
  );
}
