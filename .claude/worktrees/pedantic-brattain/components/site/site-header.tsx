"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Building2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { primaryNav } from "@/data/site";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TrackedLink } from "@/components/site/tracked-link";
import { TrackedLinkButton } from "@/components/site/tracked-link-button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-200",
        isScrolled
          ? "border-b border-border bg-background/95 backdrop-blur-md"
          : "border-b border-transparent bg-background"
      )}
    >
      <div className="container-shell flex h-16 items-center justify-between gap-6">
        {/* Logo */}
        <Link className="flex shrink-0 items-center gap-2.5" href="/">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="hidden space-y-0 sm:block">
            <div className="text-sm font-semibold tracking-tight text-foreground">EntitleFlow NC</div>
            <div className="text-[11px] text-muted-foreground">Approval operations</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {primaryNav.map((item) => (
            <TrackedLink
              key={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              href={item.href}
            >
              {item.label}
            </TrackedLink>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <TrackedLink
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            eventName="login_click"
            href="/login"
          >
            Log in
          </TrackedLink>
          <TrackedLink
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            eventName="early_access_cta_click"
            href="/early-access"
          >
            Join early access
          </TrackedLink>
          <TrackedLinkButton eventName="walkthrough_cta_click" href="/walkthrough" size="sm">
            Request a walkthrough
          </TrackedLinkButton>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button aria-label="Open menu" size="icon" variant="ghost">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full space-y-0 p-0 sm:w-80">
              <AnimatePresence mode="wait">
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8 p-6"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-semibold tracking-tight text-foreground">EntitleFlow NC</div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Development approval operations software for North Carolina teams.
                      </p>
                    </div>
                    <nav className="space-y-3">
                      {primaryNav.map((item) => (
                        <TrackedLink
                          key={item.href}
                          className="block text-base font-medium text-foreground transition hover:text-primary"
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </TrackedLink>
                      ))}
                      <div className="space-y-3 border-t border-border pt-3">
                        <TrackedLink
                          className="block text-base font-medium text-foreground transition hover:text-primary"
                          eventName="login_click"
                          href="/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Log in
                        </TrackedLink>
                        <TrackedLink
                          className="block text-base font-medium text-foreground transition hover:text-primary"
                          eventName="early_access_cta_click"
                          href="/early-access"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Join early access
                        </TrackedLink>
                        <TrackedLinkButton
                          className="w-full justify-center"
                          eventName="walkthrough_cta_click"
                          href="/walkthrough"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Request a walkthrough
                        </TrackedLinkButton>
                      </div>
                    </nav>
                  </motion.div>
                )}
              </AnimatePresence>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
