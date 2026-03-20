'use client';

import { Bell, Search, LogOut, Settings, User, AlertCircle, BarChart3 } from 'lucide-react';
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
        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>No new notifications</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-medium text-primary">
                --
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-foreground">Loading...</div>
                <div className="text-[11px] text-muted-foreground">Authenticated user</div>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/settings">
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="h-4 w-4 mr-2" />
              <span>Notifications</span>
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
