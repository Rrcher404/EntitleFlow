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
    <div className="rounded-[32px] bg-slate-950 px-8 py-10 text-white shadow-[0_28px_80px_-34px_rgba(15,23,42,0.55)] sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
      <div className="max-w-2xl space-y-4">
        <Eyebrow className="border-white/10 bg-white/10 text-white" variant="outline">
          {eyebrow}
        </Eyebrow>
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        <p className="text-base leading-7 text-slate-300 sm:text-lg">{description}</p>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col">
        <TrackedLinkButton className="justify-center bg-white text-slate-950 hover:bg-white/90" eventName="walkthrough_cta_click" href="/walkthrough" size="lg" variant="secondary">
          Request a walkthrough
          <ArrowRight className="h-4 w-4" />
        </TrackedLinkButton>
        <TrackedLinkButton
          className="justify-center border-white/15 bg-transparent text-white hover:bg-white/10"
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
