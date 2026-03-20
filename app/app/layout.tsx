'use client';

import { AppSidebar } from '@/components/app/app-sidebar';
import { AppTopbar } from '@/components/app/app-topbar';
import FloatingActionMenu from '@/components/ui/floating-action-menu';
import { useRouter } from 'next/navigation';
import { FileText, FolderPlus, Search } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const floatingMenuOptions = [
    {
      label: 'New Project',
      Icon: <FolderPlus className="h-4 w-4" />,
      onClick: () => router.push('/app/projects'),
    },
    {
      label: 'New Permit',
      Icon: <FileText className="h-4 w-4" />,
      onClick: () => router.push('/app/permits'),
    },
    {
      label: 'Quick Search',
      Icon: <Search className="h-4 w-4" />,
      onClick: () => {
        // This could trigger a modal or focus the search input
        // For now, we'll just log it
        console.log('Quick search triggered');
      },
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <FloatingActionMenu options={floatingMenuOptions} />
    </div>
  );
}
