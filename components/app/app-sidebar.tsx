'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck2,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  MapPin,
  Bell,
  Sparkles,
  ClipboardCheck,
} from 'lucide-react';
import { Logo } from '@/components/site/Logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import {
  Sidebar,
  SidebarBody,
  DesktopSidebar,
  MobileSidebar,
  useSidebar,
} from '@/components/ui/aceternity-sidebar';
import Link from 'next/link';

const navItems = [
  { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { label: 'My Tasks', href: '/app/tasks', icon: ClipboardCheck },
  { label: 'Projects', href: '/app/projects', icon: FolderKanban },
  { label: 'Permits', href: '/app/permits', icon: FileCheck2 },
  { label: 'Map View', href: '/app/projects/map', icon: MapPin },
  { label: 'Analytics', href: '/app/analytics', icon: BarChart3 },
  { label: 'Documents', href: '/app/documents', icon: FileText },
  { label: 'Notifications', href: '/app/notifications', icon: Bell },
  { label: 'FlowE AI', href: '/app/flowe', icon: Sparkles },
];

const bottomItems = [
  { label: 'Settings', href: '/app/settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

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

  const handleMobileNavClick = () => {
    // Only close on mobile
    setOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <DesktopSidebar>
        <Sidebar>
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center gap-2.5 border-b border-border px-4 overflow-hidden">
            <Logo variant="icon" height={32} theme="light" className="flex-shrink-0" />
            <motion.div
              className="overflow-hidden"
              animate={{ opacity: open ? 1 : 0, width: open ? 'auto' : 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-sm font-semibold tracking-tight whitespace-nowrap" style={{ color: '#102034' }}>
                Entitle<span style={{ color: '#25a18e' }}>Flow</span>
              </div>
              <div className="text-[10px] text-muted-foreground whitespace-nowrap">Approval Ops</div>
            </motion.div>
          </div>

          {/* Nav */}
          <SidebarBody className="space-y-1 flex-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200 whitespace-nowrap overflow-hidden',
                    isActive
                      ? 'bg-accent text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                  title={item.label}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <motion.span
                    className="truncate"
                    animate={{ opacity: open ? 1 : 0, width: open ? 'auto' : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                </Link>
              );
            })}
          </SidebarBody>

          {/* Bottom nav */}
          <div className="space-y-1 border-t border-border px-3 py-4 flex-shrink-0">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200 whitespace-nowrap overflow-hidden',
                    isActive
                      ? 'bg-accent text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                  title={item.label}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <motion.span
                    className="truncate"
                    animate={{ opacity: open ? 1 : 0, width: open ? 'auto' : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                </Link>
              );
            })}

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors duration-200 whitespace-nowrap overflow-hidden"
              title="Sign out"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <motion.span
                className="truncate"
                animate={{ opacity: open ? 1 : 0, width: open ? 'auto' : 0 }}
                transition={{ duration: 0.2 }}
              >
                Sign out
              </motion.span>
            </button>
          </div>
        </Sidebar>
      </DesktopSidebar>

      {/* Mobile Sidebar */}
      <MobileSidebar>
        <Sidebar className="md:hidden">
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center gap-2.5 border-b border-border px-4 mt-12">
            <Logo height={32} theme="light" />
          </div>

          {/* Nav */}
          <SidebarBody className="space-y-1 flex-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleMobileNavClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200',
                    isActive
                      ? 'bg-accent text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </SidebarBody>

          {/* Bottom nav */}
          <div className="space-y-1 border-t border-border px-3 py-4 flex-shrink-0">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleMobileNavClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200',
                    isActive
                      ? 'bg-accent text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
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
              <span>Sign out</span>
            </Button>
          </div>
        </Sidebar>
      </MobileSidebar>
    </>
  );
}
