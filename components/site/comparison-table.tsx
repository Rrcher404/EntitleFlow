import { Card, CardContent } from "@/components/ui/card";
import type { ComparisonRow } from "@/lib/types";

type ComparisonTableProps = {
  rows: ComparisonRow[];
};

export function ComparisonTable({ rows }: ComparisonTableProps) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-border bg-white shadow-[0_24px_70px_-34px_rgba(15,23,42,0.3)]">
      <div className="grid grid-cols-1 border-b border-border bg-slate-950 text-white lg:grid-cols-[0.95fr_1fr_1fr_1fr]">
        <div className="border-b border-white/10 px-6 py-4 text-sm font-semibold tracking-[0.16em] text-slate-300 lg:border-b-0">Buyer need</div>
        <div className="border-b border-white/10 px-6 py-4 text-sm font-semibold lg:border-b-0 lg:border-l lg:border-white/10">EntitleFlow NC</div>
        <div className="border-b border-white/10 px-6 py-4 text-sm font-semibold lg:border-b-0 lg:border-l lg:border-white/10">Spreadsheets + email + portals</div>
        <div className="px-6 py-4 text-sm font-semibold lg:border-l lg:border-white/10">Generic national software</div>
      </div>

      {rows.map((row) => (
        <div className="grid border-b border-border last:border-b-0 lg:grid-cols-[0.95fr_1fr_1fr_1fr]" key={row.label}>
          <div className="bg-slate-50 dark:bg-slate-800 px-6 py-5 text-sm font-semibold text-slate-900 dark:text-slate-100 lg:border-r lg:border-border">{row.label}</div>
          <Cell value={row.entitleFlow} />
          <Cell value={row.manual} />
          <Cell value={row.generic} />
        </div>
      ))}
    </div>
  );
}

function Cell({ value }: { value: string }) {
  return (
    <Card className="rounded-none border-0 border-t border-border shadow-none lg:border-l lg:border-t-0">
      <CardContent className="h-full p-6 text-sm leading-7 text-slate-600 dark:text-slate-300">{value}</CardContent>
    </Card>
  );
}
