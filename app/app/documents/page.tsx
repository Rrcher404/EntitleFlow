import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">Store and organize submission documents and approvals.</p>
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
