import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowRight, BookOpen, Monitor } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg text-center space-y-8">
        {/* Brand header */}
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary">EntitleFlow</p>
          <h1 className="text-7xl font-bold text-foreground font-display">404</h1>
          <p className="text-xl font-semibold text-foreground mt-2">
            Page not found
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Helpful links */}
        <div className="grid gap-3 text-left">
          {[
            { href: '/', icon: Home, label: 'Back to homepage', desc: 'Start from the beginning' },
            { href: '/demo/dashboard', icon: Monitor, label: 'Explore the demo', desc: 'See EntitleFlow in action' },
            { href: '/resources', icon: BookOpen, label: 'NC workflow guides', desc: 'Learn about permit workflows' },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </Link>
            );
          })}
        </div>

        <div className="pt-2">
          <Button size="lg" asChild className="w-full">
            <Link href="/walkthrough">Request a walkthrough</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
