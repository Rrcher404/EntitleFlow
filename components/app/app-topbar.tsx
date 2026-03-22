'use client';

import { useEffect, useState } from 'react';
import { Search, LogOut, Settings, User, Bell, BarChart3, Users } from 'lucide-react';
import { NotificationBell } from '@/components/app/notification-bell';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export function AppTopbar() {
  const router = useRouter();
  const supabase = createClient();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState('');

  useEffect(() => {
    async function fetchUser() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const meta = user.user_metadata;
        const name = meta?.full_name || meta?.name || user.email?.split('@')[0] || 'User';
        const email = user.email || '';
        setUserName(name);
        setUserEmail(email);
        // Generate initials from name
        const parts = name.split(' ').filter(Boolean);
        const initials = parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : name.slice(0, 2).toUpperCase();
        setUserInitials(initials);
      }
    }
    fetchUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground w-80">
        <Search className="h-4 w-4" />
        <span>Search projects, permits...</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications Bell */}
        <NotificationBell />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-medium text-primary">
                {userInitials || '..'}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-foreground">{userName || 'Loading...'}</div>
                <div className="text-[11px] text-muted-foreground">{userEmail || ''}</div>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app/settings/profile">
                <User className="h-4 w-4 mr-2" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/settings">
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/notifications">
                <Bell className="h-4 w-4 mr-2" />
                <span>Notifications</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/settings/team">
                <Users className="h-4 w-4 mr-2" />
                <span>Team</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span>Admin Panel</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
