import { PortalSidebar } from '@/components/portal/portal-sidebar';
import { PortalTopbar } from '@/components/portal/portal-topbar';

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <PortalSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <PortalTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
