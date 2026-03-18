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
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-border/50 bg-background/80 backdrop-blur-xl dark:bg-background/80"
          : "border-b border-transparent bg-background dark:bg-background"
      )}
    >
      <div className="container-shell flex h-20 items-center justify-between gap-6">
        {/* Logo */}
        <Link className="flex shrink-0 items-center gap-3" href="/">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 dark:bg-slate-50 text-white dark:text-slate-950">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="hidden space-y-0.5 sm:block">
            <div className="text-sm font-semibold tracking-tight text-foreground">EntitleFlow NC</div>
            <div className="text-xs text-muted-foreground">Approval operations</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {primaryNav.map((item) => (
            <div key={item.href} className="relative group">
              <TrackedLink
                className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                href={item.href}
              >
                {item.label}
              </TrackedLink>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-primary/50 transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </nav>

        {/* Desktop CTA & Theme Toggle */}
        <div className="hidden items-center gap-4 md:flex">
          <TrackedLink
            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            eventName="early_access_cta_click"
            href="/early-access"
          >
            Join early access
          </TrackedLink>
          <TrackedLinkButton eventName="walkthrough_cta_click" href="/walkthrough" size="sm">
            Request a walkthrough
          </TrackedLinkButton>
          <div className="pl-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Menu & Theme Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button aria-label="Open menu" size="sm" variant="ghost">
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
