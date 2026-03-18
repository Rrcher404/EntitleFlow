import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PreviewPanel as PreviewPanelType } from "@/lib/types";

type PreviewPanelProps = {
  panel: PreviewPanelType;
};

export function PreviewPanel({ panel }: PreviewPanelProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-slate-950 text-white">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Badge className="w-fit border-white/10 bg-white/10 text-white" variant="outline">
              {panel.eyebrow}
            </Badge>
            <CardTitle className="text-white">{panel.title}</CardTitle>
          </div>
          <Badge className="border-emerald-400/30 bg-emerald-500/15 text-emerald-100" variant="outline">
            {panel.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{panel.description}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {panel.stats.map((stat) => (
            <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-white dark:bg-slate-900 px-3 py-3 text-center" key={stat.label}>
              <div className="truncate font-display text-xl font-semibold text-slate-950 dark:text-white sm:text-2xl">{stat.value}</div>
              <div className="mt-1 truncate text-[0.65rem] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
        <ul className="space-y-3">
          {panel.notes.map((note) => (
            <li className="rounded-2xl bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm leading-6 text-slate-700 dark:text-slate-300" key={note}>
              {note}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
