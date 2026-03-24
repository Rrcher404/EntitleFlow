'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck2,
  BarChart3,
  LogOut,
  Menu,
  X,
  Settings,
  ClipboardCheck,
  FileText,
  Bell,
} from 'lucide-react';
import { Logo } from '@/components/site/Logo';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/demo/dashboard', icon: LayoutDashboard },
  { label: 'Tasks', href: '/demo/tasks', icon: ClipboardCheck },
  { label: 'Projects', href: '/demo/projects', icon: FolderKanban },
  { label: 'Permits', href: '/demo/permits', icon: FileCheck2 },
  { label: 'Documents', href: '/demo/documents', icon: FileText },
  { label: 'Analytics', href: '/demo/analytics', icon: BarChart3 },
  { label: 'Notifications', href: '/demo/notifications', icon: Bell },
];

// Mock data to calculate notification badges
const mockProjects = [
  { id: 'PRJ-2024-0041', status: 'Resubmittal' },
  { id: 'PRJ-2024-0032', status: 'Submitted' },
  { id: 'PRJ-2024-0033', status: 'Draft' },
];

const mockPermits = [
  { id: 'PERMIT-2024-089', status: 'Resubmittal Required' },
  { id: 'PERMIT-2024-090', status: 'Resubmittal Required' },
];

export function PortalSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Calculate notification counts
  const projectBadgeCount = useMemo(
    () => mockProjects.filter((p) => p.status === 'Resubmittal' || p.status === 'Draft').length,
    []
  );

  const permitBadgeCount = useMemo(
    () => mockPermits.filter((p) => p.status === 'Resubmittal Required').length,
    []
  );

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-card transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-60'
      )}
    >
      {/* Logo / Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4 gap-2">
        {isCollapsed ? (
          <Logo variant="icon" height={32} theme="light" />
        ) : (
          <Logo height={30} theme="light" />
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-1.5 hover:bg-secondary transition-colors flex-shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          let badgeCount = 0;

          if (item.href === '/demo/projects') {
            badgeCount = projectBadgeCount;
          } else if (item.href === '/demo/permits') {
            badgeCount = permitBadgeCount;
          }

          return (
            <div key={item.href} className="relative">
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors relative',
                  isActive
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
              {badgeCount > 0 && (
                <div
                  className={cn(
                    'absolute top-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center',
                    isCollapsed ? 'right-1 h-5 w-5' : 'right-2 h-5 w-5'
                  )}
                >
                  {badgeCount}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-3 py-3 space-y-1">
        <Link
          href="/demo/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground w-full',
            isCollapsed && 'justify-center',
            pathname === '/demo/settings' && 'bg-accent text-foreground font-medium'
          )}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </Link>
        <Link
          href="/"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
            isCollapsed && 'justify-center'
          )}
          title={isCollapsed ? 'Exit demo' : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Exit demo</span>}
        </Link>
      </div>
    </aside>
  );
}
