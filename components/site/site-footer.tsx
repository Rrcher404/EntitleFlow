"use client";

import { useState } from "react";
import { Linkedin, Twitter, Mail } from "lucide-react";

import { footerNav } from "@/data/site";
import { siteConfig } from "@/lib/site-config";
import { TrackedLink } from "@/components/site/tracked-link";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setSubscriptionStatus("error");
      return;
    }

    setSubscriptionStatus("loading");
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubscriptionStatus("success");
    setEmail("");

    setTimeout(() => {
      setSubscriptionStatus("idle");
    }, 3000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">

      <div className="container-shell space-y-12 py-16 lg:py-20">
        {/* Main footer grid */}
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand column */}
          <div className="space-y-6 md:col-span-4">
            <div className="space-y-3">
              <Logo height={30} theme="light" />
              <p className="text-sm leading-7 text-muted-foreground">
                Reviewer redlines become a structured comment list in under two minutes. Then owners, responses, and the resubmittal package live in one workspace.
              </p>
            </div>
            <p className="text-xs leading-6 text-muted-foreground">
              Workflow intelligence is informational only. Verify official requirements with the relevant jurisdiction before making permitting, zoning, or legal determinations.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                aria-label="Email"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Site Links */}
          <div className="space-y-4 md:col-span-2 md:col-start-6">
            <div className="text-sm font-semibold text-foreground">Site</div>
            <div className="space-y-3">
              {footerNav.slice(0, 3).map((item) => (
                <TrackedLink
                  key={item.href}
                  className="block text-sm text-muted-foreground transition hover:text-foreground"
                  href={item.href}
                >
                  {item.label}
                </TrackedLink>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4 md:col-span-2">
            <div className="text-sm font-semibold text-foreground">Resources</div>
            <div className="space-y-3">
              {footerNav.slice(3, 6).map((item) => (
                <TrackedLink
                  key={item.href}
                  className="block text-sm text-muted-foreground transition hover:text-foreground"
                  href={item.href}
                >
                  {item.label}
                </TrackedLink>
              ))}
            </div>
          </div>

          {/* Newsletter signup */}
          <div className="space-y-4 md:col-span-3 md:col-start-10">
            <div className="text-sm font-semibold text-foreground">Stay updated</div>
            <p className="text-sm text-muted-foreground">Subscribe for updates on launches and new features.</p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscriptionStatus === "loading"}
                  className={cn(
                    "flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition",
                    "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20",
                    subscriptionStatus === "error" && "border-red-500/50",
                    "disabled:opacity-50"
                  )}
                  aria-label="Email address"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={subscriptionStatus === "loading"}
                  className={cn(subscriptionStatus === "success" && "bg-green-600 hover:bg-green-700")}
                >
                  {subscriptionStatus === "loading" && <span className="animate-pulse">...</span>}
                  {subscriptionStatus === "success" && "✓"}
                  {subscriptionStatus === "idle" || subscriptionStatus === "error" ? "Join" : ""}
                </Button>
              </div>
              {subscriptionStatus === "success" && (
                <p className="text-xs text-green-600">Thank you for subscribing!</p>
              )}
              {subscriptionStatus === "error" && (
                <p className="text-xs text-red-500">Please enter a valid email.</p>
              )}
            </form>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
            <p>&copy; {currentYear} EntitleFlow. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <TrackedLink href="/privacy" className="transition hover:text-foreground">
                Privacy
              </TrackedLink>
              <TrackedLink href="/terms" className="transition hover:text-foreground">
                Terms
              </TrackedLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
