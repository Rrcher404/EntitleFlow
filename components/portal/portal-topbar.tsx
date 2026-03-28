'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Popover from '@radix-ui/react-popover';

// Mock data for search
const mockProjects = [
  {
    id: 'PRJ-2024-0045',
    name: 'Brightwater Mixed-Use',
    type: 'project',
    href: '/demo/projects',
  },
  {
    id: 'PRJ-2024-0038',
    name: 'Oak Hills Subdivision Ph. 3',
    type: 'project',
    href: '/demo/projects',
  },
  {
    id: 'PRJ-2024-0041',
    name: 'Downtown Lofts Renovation',
    type: 'project',
    href: '/demo/projects',
  },
  {
    id: 'PRJ-2024-0032',
    name: 'Parkside Senior Living',
    type: 'project',
    href: '/demo/projects',
  },
];

const mockPermits = [
  {
    id: 'PERMIT-2024-089',
    name: 'Building Permit - Mixed-Use Complex',
    type: 'permit',
    href: '/demo/permits',
  },
  {
    id: 'PERMIT-2024-090',
    name: 'Stormwater Review - Oak Hills',
    type: 'permit',
    href: '/demo/permits',
  },
  {
    id: 'PERMIT-2024-091',
    name: 'Historic Preservation - Downtown Lofts',
    type: 'permit',
    href: '/demo/permits',
  },
  {
    id: 'PERMIT-2024-092',
    name: 'Zoning Variance - Senior Living',
    type: 'permit',
    href: '/demo/permits',
  },
];

const mockNotifications = [
  {
    id: 1,
    message: 'Permit PERMIT-2024-089 approved',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    message: 'Project PRJ-2024-0041 resubmittal required',
    timestamp: '5 hours ago',
    read: false,
  },
  {
    id: 3,
    message: 'Comment added to Downtown Lofts Renovation',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: 4,
    message: 'Stakeholder review completed',
    timestamp: '2 days ago',
    read: true,
  },
];

export function PortalTopbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Filter search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const projects = mockProjects
      .filter((p) => p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query))
      .map((p) => ({ ...p, searchType: 'project' }));

    const permits = mockPermits
      .filter((p) => p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query))
      .map((p) => ({ ...p, searchType: 'permit' }));

    return [...projects, ...permits].slice(0, 8);
  }, [searchQuery]);

  const handleSearchSelect = (item: Record<string, unknown>) => {
    router.push(item.href as string);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Search */}
      <Popover.Root open={searchOpen} onOpenChange={setSearchOpen}>
        <Popover.Trigger asChild>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground w-80 cursor-text hover:border-primary/50 transition-colors">
            <Search className="h-4 w-4" />
            <input
              type="text"
              placeholder="Search projects, permits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              className="bg-transparent flex-1 outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </Popover.Trigger>
        {searchQuery && searchResults.length > 0 && (
          <Popover.Content
            className="w-96 rounded-lg border border-border bg-card shadow-lg p-0 mt-1 z-50"
            align="start"
            sideOffset={4}
          >
            <div className="py-2">
              {searchResults.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSearchSelect(item)}
                  className="w-full px-4 py-2.5 hover:bg-secondary transition-colors text-left border-b border-border/30 last:border-b-0"
                >
                  <div className="text-sm font-medium text-foreground">{item.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {item.searchType === 'project' ? 'Project' : 'Permit'} • {item.id}
                  </div>
                </button>
              ))}
            </div>
          </Popover.Content>
        )}
        {searchQuery && searchResults.length === 0 && (
          <Popover.Content
            className="w-96 rounded-lg border border-border bg-card shadow-lg p-4 mt-1 z-50"
            align="start"
            sideOffset={4}
          >
            <div className="text-sm text-muted-foreground text-center">No results found</div>
          </Popover.Content>
        )}
      </Popover.Root>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Popover.Root open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <Popover.Trigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Button>
          </Popover.Trigger>
          <Popover.Content
            className="w-96 rounded-lg border border-border bg-card shadow-lg p-0 mt-1 z-50"
            align="end"
            sideOffset={4}
          >
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-border/30 last:border-b-0 cursor-pointer hover:bg-secondary/50 transition-colors ${
                    !notification.read ? 'bg-secondary/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground">{notification.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Popover.Content>
        </Popover.Root>

        {/* User Menu */}
        <Popover.Root open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <Popover.Trigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-secondary transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-medium text-primary">
                JM
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-foreground">Jene Maybury</div>
                <div className="text-[11px] text-muted-foreground">Demo account</div>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
            </button>
          </Popover.Trigger>
          <Popover.Content
            className="w-48 rounded-lg border border-border bg-card shadow-lg p-0 mt-1 z-50"
            align="end"
            sideOffset={4}
          >
            <button className="w-full px-4 py-2.5 hover:bg-secondary transition-colors text-left border-b border-border/30 text-sm text-foreground font-medium">
              Profile
            </button>
            <button className="w-full px-4 py-2.5 hover:bg-secondary transition-colors text-left border-b border-border/30 text-sm text-foreground font-medium">
              Settings
            </button>
            <Link
              href="/"
              className="block w-full px-4 py-2.5 hover:bg-secondary transition-colors text-left text-sm text-foreground font-medium"
            >
              Sign out
            </Link>
          </Popover.Content>
        </Popover.Root>
      </div>
    </header>
  );
}
