'use client';

import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppTopbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground w-80">
        <Search className="h-4 w-4" />
        <span>Search projects, permits...</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-medium text-primary">
            --
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-foreground">Loading...</div>
            <div className="text-[11px] text-muted-foreground">Authenticated user</div>
          </div>
        </div>
      </div>
    </header>
  );
}
