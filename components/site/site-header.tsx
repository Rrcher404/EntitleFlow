"use client";

import Link from "next/link";
import { Menu, Building2 } from "lucide-react";

import { primaryNav } from "@/data/site";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TrackedLink } from "@/components/site/tracked-link";
import { TrackedLinkButton } from "@/components/site/tracked-link-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-[rgba(246,245,240,0.92)] backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between gap-6">
        <Link className="flex items-center gap-3" href="/">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-semibold tracking-[0.14em] text-slate-950">EntitleFlow NC</div>
            <div className="text-xs text-slate-500">Development approval operations software</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {primaryNav.map((item) => (
            <TrackedLink className="text-sm font-medium text-slate-600 transition hover:text-slate-950" href={item.href} key={item.href}>
              {item.label}
            </TrackedLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <TrackedLink className="text-sm font-medium text-slate-600 transition hover:text-slate-950" eventName="early_access_cta_click" href="/early-access">
            Join early access
          </TrackedLink>
          <TrackedLinkButton eventName="walkthrough_cta_click" href="/walkthrough" size="sm">
            Request a walkthrough
          </TrackedLinkButton>
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button aria-label="Open menu" size="sm" variant="outline">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="space-y-8">
              <div className="space-y-1">
                <div className="text-sm font-semibold tracking-[0.16em] text-white">EntitleFlow NC</div>
                <p className="text-sm leading-6 text-slate-300">
                  North Carolina-first development approval operations software for comments, resubmittals, and workflow visibility.
                </p>
              </div>
              <nav className="space-y-4">
                {primaryNav.map((item) => (
                  <TrackedLink className="block text-lg font-medium text-white" href={item.href} key={item.href}>
                    {item.label}
                  </TrackedLink>
                ))}
                <TrackedLink className="block text-lg font-medium text-white" eventName="early_access_cta_click" href="/early-access">
                  Join early access
                </TrackedLink>
                <TrackedLinkButton className="w-full justify-center" eventName="walkthrough_cta_click" href="/walkthrough">
                  Request a walkthrough
                </TrackedLinkButton>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
