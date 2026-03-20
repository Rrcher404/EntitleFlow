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
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  DesktopSidebar,
  MobileSidebar,
  useSidebar,
} from '@/components/ui/aceternity-sidebar';

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
          <div className="flex h-16 flex-shrink-0 items-center gap-2.5 border-b border-border px-5 overflow-hidden whitespace-nowrap">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <motion.div
              className="flex flex-col min-w-0"
              animate={{ opacity: open ? 1 : 0, width: open ? 'auto' : 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-sm font-semibold tracking-tight text-foreground truncate">EntitleFlow</div>
              <div className="text-[10px] text-muted-foreground whitespace-nowrap">Approval Ops</div>
            </motion.div>
          </div>

          {/* Nav */}
          <SidebarBody className="space-y-1 flex-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
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
                </a>
              );
            })}
          </SidebarBody>

          {/* Bottom nav */}
          <div className="space-y-1 border-t border-border px-3 py-4 flex-shrink-0">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
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
                </a>
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
          <div className="flex h-16 flex-shrink-0 items-center gap-2.5 border-b border-border px-5 mt-12">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-sm font-semibold tracking-tight text-foreground truncate">EntitleFlow</div>
              <div className="text-[10px] text-muted-foreground whitespace-nowrap">Approval Ops</div>
            </div>
          </div>

          {/* Nav */}
          <SidebarBody className="space-y-1 flex-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <a
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
                </a>
              );
            })}
          </SidebarBody>

          {/* Bottom nav */}
          <div className="space-y-1 border-t border-border px-3 py-4 flex-shrink-0">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <a
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
                </a>
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
