import { footerNav } from "@/data/site";
import { siteConfig } from "@/lib/site-config";
import { TrackedLink } from "@/components/site/tracked-link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[rgba(255,254,250,0.8)]">
      <div className="container-shell grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="text-sm font-semibold tracking-[0.16em] text-slate-950">EntitleFlow NC</div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            EntitleFlow organizes reviewer comments, resubmittals, and approval workflow visibility for North Carolina teams managing real project complexity.
          </p>
          <p className="text-xs leading-6 text-slate-500">
            Workflow intelligence is informational only. Verify official requirements with the relevant jurisdiction before making permitting, zoning, or legal determinations.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-4">
            <div className="text-sm font-semibold text-slate-900">Site</div>
            <div className="space-y-3">
              {footerNav.map((item) => (
                <TrackedLink className="block text-sm text-slate-600 transition hover:text-slate-950" href={item.href} key={item.href}>
                  {item.label}
                </TrackedLink>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-sm font-semibold text-slate-900">Contact</div>
            <div className="space-y-3 text-sm text-slate-600">
              <p>{siteConfig.email}</p>
              <p>Built for regional teams managing North Carolina approvals.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
