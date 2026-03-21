'use client';

import { AppSidebar } from '@/components/app/app-sidebar';
import { AppTopbar } from '@/components/app/app-topbar';
import { OnboardingDialog } from '@/components/ui/onboarding-dialog';
import { SidebarProvider } from '@/components/ui/aceternity-sidebar';
import FloatingActionMenu from '@/components/ui/floating-action-menu';
import { useRouter } from 'next/navigation';
import { FileText, FolderPlus, Search, Sparkles } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const floatingMenuOptions = [
    {
      label: 'Ask FlowE',
      Icon: <Sparkles className="h-4 w-4" />,
      onClick: () => router.push('/app/flowe'),
    },
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
        console.log('Quick search triggered');
      },
    },
  ];

  return (
    <SidebarProvider>
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
      <OnboardingDialog />
    </SidebarProvider>
  );
}
