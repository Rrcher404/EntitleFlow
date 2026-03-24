import { Suspense } from 'react';
import UsersPageClient from './users-client';

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      }
    >
      <UsersPageClient />
    </Suspense>
  );
}
