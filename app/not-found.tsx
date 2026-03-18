import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="text-2xl font-semibold text-foreground">
            Page not found
          </p>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Home className="w-8 h-8 text-primary" />
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          asChild
        >
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
