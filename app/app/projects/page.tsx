import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectsClient from './projects-client';

function ProjectsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Projects</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage and track all your active projects.</p>
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsLoading />}>
      <ProjectsClient />
    </Suspense>
  );
}
