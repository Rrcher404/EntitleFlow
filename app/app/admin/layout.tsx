'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Users,
  Shield,
  FolderTree,
  HardDrive,
  Activity,
  Settings,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  UserCog,
  UserCheck,
  Eye,
  Crown,
} from 'lucide-react';

interface NavSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  items: NavItem[];
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    company: true,
    users: true,
    security: true,
    storage: true,
    activity: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const sections: Record<string, NavSection> = {
    company: {
      title: 'Company Tree',
      icon: Building2,
      expanded: expandedSections.company,
      items: [
        { label: 'Company Overview', href: '/app/admin/dashboard', icon: Building2 },
        { label: 'User Groups', href: '/app/admin/groups', icon: FolderTree },
      ],
    },
    users: {
      title: 'User Management',
      icon: Users,
      expanded: expandedSections.users,
      items: [
        { label: 'All Users', href: '/app/admin/users', icon: Users },
        { label: 'Admins', href: '/app/admin/users?role=admin', icon: Crown },
        { label: 'Project Managers', href: '/app/admin/users?role=manager', icon: UserCog },
        { label: 'Contributors', href: '/app/admin/users?role=contributor', icon: UserCheck },
        { label: 'Guest Viewers', href: '/app/admin/users?role=viewer', icon: Eye },
      ],
    },
    security: {
      title: 'Security',
      icon: Shield,
      expanded: expandedSections.security,
      items: [
        { label: 'Password Policies', href: '/app/admin/security', icon: Shield },
        { label: 'Permissions', href: '/app/admin/permissions', icon: UserCog },
      ],
    },
    storage: {
      title: 'Storage & Files',
      icon: HardDrive,
      expanded: expandedSections.storage,
      items: [
        { label: 'File Limits', href: '/app/admin/storage', icon: HardDrive },
        { label: 'Storage Usage', href: '/app/admin/storage', icon: HardDrive },
      ],
    },
    activity: {
      title: 'Activity',
      icon: Activity,
      expanded: expandedSections.activity,
      items: [
        { label: 'Audit Trail', href: '/app/admin/audit', icon: Activity },
        { label: 'Export Reports', href: '/app/admin/audit', icon: Activity },
      ],
    },
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-screen bg-[#FDFBF7]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1B3B2D] text-white overflow-y-auto border-r border-[#25a18e]">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#25a18e]">
          <Link
            href="/app"
            className="flex items-center gap-2 text-white hover:text-[#E8E0D0] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to App</span>
          </Link>
          <h1 className="text-xl font-bold text-[#E8E0D0] font-display">
            Admin Panel
          </h1>
          <p className="text-xs text-[#25a18e] mt-1">Company Administration</p>
        </div>

        {/* Navigation Sections */}
        <nav className="p-4 space-y-2">
          {Object.entries(sections).map(([key, section]) => {
            const SectionIcon = section.icon;
            const isExpanded = section.expanded;

            return (
              <div key={key}>
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium text-[#E8E0D0] hover:bg-[#25a18e] hover:bg-opacity-20 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <SectionIcon className="w-4 h-4" />
                    {section.title}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {/* Expandable Items */}
                {isExpanded && (
                  <div className="ml-4 space-y-1 mt-1">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      const active = isActive(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                            active
                              ? 'bg-[#D4A937] text-[#1B3B2D] font-medium'
                              : 'text-[#E8E0D0] hover:bg-[#25a18e] hover:bg-opacity-20'
                          }`}
                        >
                          <ItemIcon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="absolute bottom-0 w-64 border-t border-[#25a18e] p-4 bg-[#1B3B2D]">
          <Link
            href="/app/admin/settings"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#E8E0D0] hover:bg-[#25a18e] hover:bg-opacity-20 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="border-b border-[#e2e5e5] bg-white px-8 py-6 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-[#1B3B2D]" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
            Company Admin
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your organization settings and users
          </p>
        </div>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
