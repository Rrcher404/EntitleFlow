'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Search, LogOut, Settings, User, Bell, BarChart3, Users, FolderOpen, FileText, File, Loader2 } from 'lucide-react';
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

interface SearchResult {
  id: string;
  name: string;
  type: 'project' | 'permit' | 'document';
  subtitle: string;
  href: string;
}

export function AppTopbar() {
  const router = useRouter();
  const supabase = createClient();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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
        const parts = name.split(' ').filter(Boolean);
        const initials = parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : name.slice(0, 2).toUpperCase();
        setUserInitials(initials);
      }
    }
    fetchUser();
  }, [supabase]);

  // Debounced search against Supabase
  const runSearch = useCallback(async (query: string) => {
    if (!query.trim() || !supabase) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const results: SearchResult[] = [];
    const q = `%${query}%`;

    try {
      // Search projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, project_number, jurisdiction')
        .or(`name.ilike.${q},project_number.ilike.${q},address.ilike.${q}`)
        .limit(4);

      if (projects) {
        for (const p of projects) {
          results.push({
            id: p.id,
            name: p.name,
            type: 'project',
            subtitle: [p.project_number, p.jurisdiction].filter(Boolean).join(' • '),
            href: `/app/projects/${p.id}`,
          });
        }
      }

      // Search permits
      const { data: permits } = await supabase
        .from('permits')
        .select('id, title, permit_number, permit_type')
        .or(`title.ilike.${q},permit_number.ilike.${q}`)
        .limit(4);

      if (permits) {
        for (const p of permits) {
          results.push({
            id: p.id,
            name: p.title,
            type: 'permit',
            subtitle: [p.permit_number, p.permit_type].filter(Boolean).join(' • '),
            href: `/app/permits/${p.id}`,
          });
        }
      }

      // Search documents
      const { data: docs } = await supabase
        .from('documents')
        .select('id, file_name, document_type')
        .or(`file_name.ilike.${q}`)
        .limit(3);

      if (docs) {
        for (const d of docs) {
          results.push({
            id: d.id,
            name: d.file_name,
            type: 'document',
            subtitle: d.document_type || 'Document',
            href: `/app/documents`,
          });
        }
      }
    } catch (err) {
      console.error('Search error:', err);
    }

    setSearchResults(results);
    setSearching(false);
  }, [supabase]);

  // Debounce input
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(() => runSearch(value), 250);
  };

  const handleSearchSelect = (item: SearchResult) => {
    router.push(item.href);
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'project': return <FolderOpen className="h-4 w-4 text-primary" />;
      case 'permit': return <FileText className="h-4 w-4 text-primary" />;
      case 'document': return <File className="h-4 w-4 text-primary" />;
    }
  };

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Search */}
      <div ref={searchRef} className="relative w-80">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:border-primary/50 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-ring">
          <Search className="h-4 w-4 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search projects, permits..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
            className="bg-transparent flex-1 outline-none text-foreground placeholder:text-muted-foreground text-sm"
          />
          {searching && <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />}
        </div>
        {searchOpen && searchQuery.trim() && (
          <div className="absolute top-full left-0 mt-1 w-96 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden">
            {searching && searchResults.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground text-center">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div className="py-1 max-h-80 overflow-y-auto">
                {searchResults.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSearchSelect(item)}
                    className="w-full px-4 py-2.5 hover:bg-secondary transition-colors text-left flex items-start gap-3"
                  >
                    <div className="mt-0.5">{getTypeIcon(item.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {item.subtitle}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-muted-foreground text-center">No results found</div>
            )}
          </div>
        )}
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
