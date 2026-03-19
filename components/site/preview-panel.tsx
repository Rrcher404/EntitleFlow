import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PreviewPanel as PreviewPanelType } from "@/lib/types";

type PreviewPanelProps = {
  panel: PreviewPanelType;
};

export function PreviewPanel({ panel }: PreviewPanelProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-primary text-primary-foreground">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Badge className="w-fit border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground" variant="outline">
              {panel.eyebrow}
            </Badge>
            <CardTitle className="text-primary-foreground">{panel.title}</CardTitle>
          </div>
          <Badge className="border-emerald-400/30 bg-emerald-500/15 text-emerald-100" variant="outline">
            {panel.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <p className="text-sm leading-7 text-slate-600">{panel.description}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {panel.stats.map((stat) => (
            <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-white px-3 py-3 text-center" key={stat.label}>
              <div className="truncate font-display text-xl font-semibold text-slate-950 sm:text-2xl">{stat.value}</div>
              <div className="mt-1 truncate text-[0.65rem] uppercase tracking-[0.1em] text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
        <ul className="space-y-3">
          {panel.notes.map((note) => (
            <li className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700" key={note}>
              {note}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
