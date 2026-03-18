import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrackedLink } from "@/components/site/tracked-link";
import type { GuideCard as GuideCardType } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type GuideCardProps = {
  guide: GuideCardType;
};

export function GuideCard({ guide }: GuideCardProps) {
  const badgeVariant = guide.status === "Available now" ? "success" : guide.status === "Research preview" ? "outline" : "warning";

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-5 p-6">
        <div className="flex items-center justify-between gap-3">
          <Badge variant={badgeVariant}>{guide.status}</Badge>
          <span className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{guide.category}</span>
        </div>
        <div className="space-y-3">
          <h3 className="font-display text-xl font-semibold text-slate-950 dark:text-white">{guide.title}</h3>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{guide.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-4">
          <span className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Updated {formatDate(guide.updatedAt)}</span>
          <TrackedLink
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100 transition hover:text-emerald-800"
            eventName="guide_card_click"
            eventProps={{ title: guide.title }}
            href={guide.href}
          >
            {guide.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </TrackedLink>
        </div>
      </CardContent>
    </Card>
  );
}
