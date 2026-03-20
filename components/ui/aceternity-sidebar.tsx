'use client';

import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

export interface SidebarProviderProps {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  animate?: boolean;
}

export const SidebarProvider = ({ children, open = true, setOpen, animate = true }: SidebarProviderProps) => {
  const [internalOpen, setInternalOpen] = useState(open);

  return (
    <SidebarContext.Provider value={{ open: internalOpen, setOpen: setOpen || setInternalOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export const Sidebar = ({ children, className }: SidebarProps) => {
  return (
    <div className={cn('h-screen flex flex-col bg-card border-r border-border', className)}>
      {children}
    </div>
  );
};

export interface SidebarBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarBody = ({ children, className }: SidebarBodyProps) => {
  return (
    <div className={cn('flex flex-col flex-1 overflow-y-auto overflow-x-hidden', className)}>
      {children}
    </div>
  );
};

export interface SidebarLinkProps {
  link: {
    label: string;
    href: string;
    icon: React.ReactNode;
  };
  className?: string;
  isActive?: boolean;
}

export const SidebarLink = ({ link, className, isActive }: SidebarLinkProps) => {
  return (
    <a
      href={link.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200',
        isActive
          ? 'bg-accent text-foreground font-medium'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
        className
      )}
    >
      {link.icon}
      <span className="flex-1">{link.label}</span>
    </a>
  );
};

export interface DesktopSidebarProps {
  children: React.ReactNode;
  className?: string;
}

export const DesktopSidebar = ({ children, className }: DesktopSidebarProps) => {
  const { open } = useSidebar();

  return (
    <motion.div
      className={cn('hidden h-screen md:flex md:flex-col overflow-hidden bg-card border-r border-border', className)}
      animate={{ width: open ? 260 : 60 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export interface MobileSidebarProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileSidebar = ({ children, className }: MobileSidebarProps) => {
  const { open, setOpen } = useSidebar();

  return (
    <>
      {/* Mobile menu button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed left-4 top-4 z-50 md:hidden"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3 }}
              className={cn('fixed left-0 top-0 z-50 h-screen w-60 overflow-y-auto bg-card border-r border-border md:hidden flex flex-col', className)}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};


