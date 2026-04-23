"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { primaryNav } from "@/data/site";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TrackedLink } from "@/components/site/tracked-link";
import { TrackedLinkButton } from "@/components/site/tracked-link-button";
import { Logo } from "@/components/site/Logo";
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
        <Link className="flex shrink-0 items-center" href="/">
          <Logo height={34} theme="light" />
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
          <TrackedLinkButton eventName="try_cta_click" href="/try" size="sm">
            Try it
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
                    <div className="space-y-2">
                      <Logo height={32} theme="light" />
                      <p className="text-sm leading-6 text-muted-foreground">
                        Reviewer redlines into structured comment lists for AEC teams.
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
                        <TrackedLinkButton
                          className="w-full justify-center"
                          eventName="try_cta_click"
                          href="/try"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Try it with your PDF
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
