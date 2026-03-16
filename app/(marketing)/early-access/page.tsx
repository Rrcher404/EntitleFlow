import { BellRing, MapPinned, NotebookText } from "lucide-react";

import { EarlyAccessForm } from "@/components/forms/early-access-form";
import { PageIntro } from "@/components/site/page-intro";
import { SectionShell } from "@/components/site/section-shell";
import { TrackedLinkButton } from "@/components/site/tracked-link-button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/lib/site-config";

export const metadata = buildMetadata({
  title: "Join early access",
  description:
    "Join the EntitleFlow NC early-access list for launch updates, pilot availability, and North Carolina workflow guide releases.",
  path: "/early-access",
});

export default function EarlyAccessPage() {
  return (
    <SectionShell>
      <div className="grid gap-10 lg:grid-cols-[0.76fr_1.24fr]">
        <div className="space-y-8">
          <PageIntro
            description="Early access is for firms that want to stay close to launch updates, guide releases, and pilot availability without booking a walkthrough right away."
            eyebrow="Early access"
            title="Stay close to the launch without forcing a sales call."
          />

          <div className="grid gap-4">
            {[
              {
                icon: BellRing,
                title: "Launch updates",
                body: "Hear when new workflow pages, offer updates, and pilot availability open up.",
              },
              {
                icon: MapPinned,
                title: "NC guide releases",
                body: "Get notified as more North Carolina jurisdiction coverage lands on the site.",
              },
              {
                icon: NotebookText,
                title: "Operational guidance",
                body: "See when new comment and resubmittal workflow resources become available.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title}>
                  <CardContent className="flex gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-display text-xl font-semibold text-slate-950">{item.title}</div>
                      <p className="text-sm leading-6 text-slate-600">{item.body}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <TrackedLinkButton eventName="walkthrough_cta_click" href="/walkthrough" size="lg" variant="outline">
            Need to talk sooner? Request a walkthrough
          </TrackedLinkButton>
        </div>

        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold text-slate-950">Join the list</h2>
              <p className="text-sm leading-6 text-slate-600">
                This is the lighter path if you want updates on launch progress, NC workflow guides, and pilot availability without starting with a full walkthrough.
              </p>
            </div>
            <EarlyAccessForm sourcePath="/early-access" />
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}
