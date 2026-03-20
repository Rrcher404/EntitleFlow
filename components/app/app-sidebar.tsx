'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck2,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/app/projects', icon: FolderKanban },
  { label: 'Permits', href: '/app/permits', icon: FileCheck2 },
  { label: 'Analytics', href: '/app/analytics', icon: BarChart3 },
  { label: 'Documents', href: '/app/documents', icon: FileText },
];

const bottomItems = [
  { label: 'Settings', href: '/app/settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  const handleSignOut = async () => {
    const supabase = createClient();
    if (!supabase) return;

    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight text-foreground">EntitleFlow</div>
          <div className="text-[10px] text-muted-foreground">Approval Ops</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="space-y-1 border-t border-border px-3 py-4">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {/* Sign out button */}
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
