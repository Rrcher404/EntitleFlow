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

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  // Check if the request is for /admin/* routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // If not authenticated, redirect to login
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Fetch user profile to check if super_admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_super_admin')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile?.is_super_admin) {
      // Not a super admin, redirect to app dashboard
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
