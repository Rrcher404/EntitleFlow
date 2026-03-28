'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Our team has been notified.
          </p>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <Button
          onClick={reset}
          className="w-full"
          size="lg"
        >
          Try again
        </Button>

        <Button
          variant="outline"
          className="w-full"
          asChild
        >
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
