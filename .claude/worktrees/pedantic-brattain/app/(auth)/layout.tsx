import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Header with back button */}
      <div className="w-full max-w-md mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      {/* Logo and content card */}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
            E
          </div>
        </div>

        {/* Auth content card */}
        <div className="bg-card border border-border rounded-lg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
