import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import PermitsClient from './permits-client';

function PermitsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Permits</h1>
        <p className="mt-1 text-sm text-muted-foreground">View and manage permit applications and approvals.</p>
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}

export default function PermitsPage() {
  return (
    <Suspense fallback={<PermitsLoading />}>
      <PermitsClient />
    </Suspense>
  );
}
