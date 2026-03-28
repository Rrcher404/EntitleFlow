# Supabase Authentication Setup for EntitleFlow NC

## Overview
Complete Supabase authentication infrastructure has been installed and configured for EntitleFlow NC using Next.js 16.1.6 App Router with server-side rendering support via @supabase/ssr.

## Completed Setup

### 1. Dependencies Installed
- `@supabase/ssr` (^0.9.0) - Server-side rendering authentication support
- `@supabase/supabase-js` (^2.57.4) - Already present

### 2. Core Authentication Files

#### `/lib/supabase/client.ts`
- Browser client factory using `createBrowserClient`
- Typed with Database types
- Uses public Supabase URL and anon key

#### `/lib/supabase/server.ts`
- **New:** `createServerSupabaseClient()` - Authenticated server client using cookies
  - Automatically manages user session via cookie store
  - Safe for use in Server Components and Route Handlers
  - Persists auth state across requests
- **Updated:** `getSupabaseAdminClient()` - Admin/service role client
  - For server-only operations requiring elevated privileges
  - No cookie management (stateless)
  - Uses service role key when available

#### `/lib/supabase/middleware.ts`
- Session management middleware
- Protects routes in `/app/*` (redirects unauthenticated users to login)
- Redirects authenticated users away from login/signup pages
- Manages auth state via cookie synchronization

#### `/middleware.ts` (Root)
- Middleware matcher configuration
- Protects: `/app/:path*`, `/login`, `/signup`

### 3. Authentication Pages

#### `app/(auth)/layout.tsx`
- Centered auth page layout matching Anthropic aesthetic
- Cream background (bg-background)
- Rounded card container (max-w-md)
- EntitleFlow logo (E badge)
- Back to home link

#### `app/(auth)/login/page.tsx`
- Client component with React Hook Form + Zod validation
- Dual login methods:
  - Password-based: `signInWithPassword()`
  - Magic link: `signInWithOtp()` with email redirect
- Google OAuth placeholder (coming soon)
- Form validation with error display
- Loading states on submission
- Redirect to `/app/dashboard` on success
- Link to signup page

#### `app/(auth)/signup/page.tsx`
- Client component with React Hook Form + Zod validation
- Sign up form fields:
  - Full name (min 2 chars)
  - Work email
  - Password (min 8 chars)
  - Company name
  - Company type (dropdown: Contractor, Engineer, Architect, Developer, Property Manager, Other)
- `signUp()` with metadata storage
- Email confirmation flow
- Shows "Check your email" message after signup
- Link to login page

#### `app/(auth)/auth/callback/route.ts`
- OAuth/email confirmation callback handler
- Exchanges auth code for session
- Handles redirect from email confirmation links
- Error handling with redirect to login

### 4. Environment Variables Updated

Added to `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Existing variables preserved:
- `SUPABASE_URL` - Server-only project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Server-only admin key

## Next Steps

### 1. Configure Supabase Project
- [ ] Create Supabase project at https://supabase.com
- [ ] Copy project URL and keys into `.env.local`
- [ ] Set up authentication providers (email, OAuth, etc.)

### 2. Configure Email Templates
In Supabase Dashboard → Authentication → Email Templates:
- [ ] Customize confirmation email
- [ ] Customize password reset email
- [ ] Customize magic link email
- [ ] Ensure emails redirect to `http://localhost:3000/auth/callback` (dev) or your production domain

### 3. Set Redirect URL
In Supabase Dashboard → Authentication → URL Configuration:
- [ ] Add `http://localhost:3000` (development)
- [ ] Add your production domain (e.g., `https://entitleflownc.com`)
- [ ] Redirect URLs should point to `/auth/callback`

### 4. Optional: Configure OAuth Providers
In Supabase Dashboard → Authentication → Providers:
- [ ] Google OAuth (for "Sign in with Google" feature)
- [ ] GitHub OAuth
- [ ] Any other providers needed

### 5. Database Schema
- [ ] Set up user profiles table if custom user data beyond Supabase Auth is needed
- [ ] Add RLS (Row Level Security) policies for user data protection

## Usage Examples

### Client Component - Sign In
```typescript
'use client';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const supabase = createClient();
  
  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };
}
```

### Server Component - Get User
```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function Dashboard() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return <div>Not authenticated</div>;
  return <div>Welcome, {user.email}</div>;
}
```

### Route Handler - Protected API
```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.json({ data: 'protected content' });
}
```

## Security Notes

- All `.env` secrets are server-only (no `NEXT_PUBLIC_` prefix)
- Public keys (`NEXT_PUBLIC_SUPABASE_*`) are safe to expose to clients
- Service role key is **never** exposed to the browser
- Middleware protects `/app` routes from unauthenticated access
- Cookie-based session management prevents CSRF attacks
- All form inputs are validated with Zod schemas

## File Structure
```
/sessions/upbeat-ecstatic-cannon/mnt/PermitPilot/
├── middleware.ts                           (root middleware)
├── lib/supabase/
│   ├── client.ts                          (browser client)
│   ├── server.ts                          (server client + admin)
│   └── middleware.ts                      (session management)
├── app/(auth)/
│   ├── layout.tsx                         (auth page layout)
│   ├── login/
│   │   └── page.tsx                       (login page)
│   ├── signup/
│   │   └── page.tsx                       (signup page)
│   └── auth/callback/
│       └── route.ts                       (OAuth/email callback)
└── .env.example                           (updated with Supabase keys)
```

## Testing Locally

1. Copy `.env.example` to `.env.local` and fill in Supabase credentials
2. Run `npm run dev`
3. Visit `http://localhost:3000/signup` to create an account
4. Visit `http://localhost:3000/login` to sign in
5. After auth, you should be redirected to `/app/dashboard`
6. Unauthenticated `/app` routes should redirect to `/login`
