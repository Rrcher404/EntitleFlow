import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create a response that we'll modify with refreshed auth cookies
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update request cookies so downstream code sees refreshed tokens
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          // Update response cookies so the browser gets refreshed tokens
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Use getUser() not getSession() — getUser() validates the JWT
  // server-side and triggers a token refresh if expired. getSession() only
  // reads from the cookie without verification, which leads to stale tokens
  // and auth.uid() returning NULL in RLS policies.
  const { data: { user } } = await supabase.auth.getUser()

  const isAppRoute = request.nextUrl.pathname.startsWith('/app')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  // Protected routes: redirect unauthenticated users to /login with redirect param
  if ((isAppRoute || isAdminRoute) && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin routes: additionally check for super_admin role
  if (isAdminRoute && user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_super_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_super_admin) {
      return NextResponse.redirect(new URL('/app/dashboard', request.url))
    }
  }

  // Auth pages: redirect to dashboard if already authenticated
  if (
    user &&
    (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')
  ) {
    return NextResponse.redirect(new URL('/app/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
    '/admin/:path*',
  ],
}
