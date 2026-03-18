import { credibilitySignals } from "@/data/site";

export function TrustBand() {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {credibilitySignals.map((signal) => (
        <div className="surface-panel rounded-[26px] p-5" key={signal.title}>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{signal.title}</div>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{signal.description}</p>
        </div>
      ))}
    </div>
  );
}
