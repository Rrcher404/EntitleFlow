'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyType: z.string().min(1, 'Please select a company type'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationSent, setIsConfirmationSent] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setError('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.');
      setIsLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            company_name: data.companyName,
            company_type: data.companyType,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setConfirmedEmail(data.email);
        setIsConfirmationSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isConfirmationSent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground mt-1">
            We&apos;ve sent a confirmation link to{' '}
            <span className="font-medium text-foreground">{confirmedEmail}</span>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          Click the link in your email to confirm your account and complete your signup.
        </div>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setIsConfirmationSent(false);
            setConfirmedEmail('');
          }}
        >
          Back to signup
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Join EntitleFlow to streamline your NC permit processes
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            Full name
          </label>
          <Input
            id="fullName"
            placeholder="John Doe"
            {...register('fullName')}
            disabled={isLoading}
            className={errors.fullName ? 'border-destructive' : ''}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Work email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            {...register('email')}
            disabled={isLoading}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="companyName" className="text-sm font-medium">
            Company name
          </label>
          <Input
            id="companyName"
            placeholder="Acme Corp"
            {...register('companyName')}
            disabled={isLoading}
            className={errors.companyName ? 'border-destructive' : ''}
          />
          {errors.companyName && (
            <p className="text-xs text-destructive">{errors.companyName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="companyType" className="text-sm font-medium">
            Company type
          </label>
          <select
            id="companyType"
            {...register('companyType')}
            disabled={isLoading}
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              errors.companyType ? 'border-destructive' : ''
            }`}
          >
            <option value="">Select a type...</option>
            <option value="general_contractor">General Contractor</option>
            <option value="specialty_contractor">Specialty Contractor</option>
            <option value="engineer">Engineer</option>
            <option value="architect">Architect</option>
            <option value="developer">Developer</option>
            <option value="property_manager">Property Manager</option>
            <option value="other">Other</option>
          </select>
          {errors.companyType && (
            <p className="text-xs text-destructive">{errors.companyType.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            disabled={isLoading}
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
