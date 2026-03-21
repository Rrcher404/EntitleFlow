import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies()
  
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Handle cookies in middleware edge case
          }
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const isAppRoute = request.nextUrl.pathname.startsWith('/app')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  // Protected routes: redirect unauthenticated users to /login with redirect param
  if ((isAppRoute || isAdminRoute) && !session?.user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin routes: additionally check for super_admin role
  if (isAdminRoute && session?.user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_super_admin')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile?.is_super_admin) {
      return NextResponse.redirect(new URL('/app/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
    '/admin/:path*',
  ],
}
