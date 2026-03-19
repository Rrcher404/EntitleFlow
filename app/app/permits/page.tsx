import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PermitsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Permits</h1>
        <p className="mt-1 text-sm text-muted-foreground">View and manage permit applications and approvals.</p>
      </div>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground border border-border rounded-lg p-4 bg-card">
          Connect your Supabase project to see real data here. Currently showing placeholder content.
        </p>
        <Button asChild variant="outline">
          <Link href="/demo/permits">Go to demo</Link>
        </Button>
      </div>
    </div>
  );
}
