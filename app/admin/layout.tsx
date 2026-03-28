'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  BarChart3,
  Settings,
  Users,
  Building2,
  Zap,
  FileText,
  TrendingUp,
  Bell,
  LogOut,
  ArrowLeft,
  Key,
  ActivitySquare,
  Database,
  ClipboardCheck,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
  { name: 'Licenses', href: '/admin/licenses', icon: Key },
  { name: 'License Requests', href: '/admin/license-requests', icon: ClipboardCheck },
  { name: 'Leads', href: '/admin/leads', icon: Zap },
  { name: 'Permits', href: '/admin/permits', icon: FileText },
  { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  { name: 'Diagnostics', href: '/admin/diagnostics', icon: Database },
  { name: 'Announcements', href: '/admin/announcements', icon: Bell },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Password Mgmt', href: '/admin/password-management', icon: ActivitySquare },
]

interface User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [_loading, setLoading] = useState(true)
  const [pendingLicenseRequests, setPendingLicenseRequests] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          // Also fetch profile data for avatar_url
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single()

          setUser({
            id: user.id,
            email: user.email || '',
            user_metadata: {
              full_name: profileData?.full_name || user.user_metadata?.full_name,
              avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url,
            },
          })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    const getPendingLicenseRequests = async () => {
      try {
        const res = await fetch('/api/admin/license-requests?status=pending')
        if (res.ok) {
          const data = await res.json()
          const requests = Array.isArray(data) ? data : data.requests || []
          setPendingLicenseRequests(requests.length)
        }
      } catch (error) {
        console.error('Error fetching pending requests:', error)
      }
    }

    getUser()
    getPendingLicenseRequests()
  }, [supabase])

  const handleLogout = async () => {
    await supabase?.auth.signOut()
    window.location.href = '/'
  }

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'A'

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FDFBF7' }}>
      {/* Sidebar */}
      <aside
        className="w-[260px] border-r flex flex-col"
        style={{
          borderColor: '#E8E0D0',
          backgroundColor: '#FDFBF7',
        }}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b" style={{ borderColor: '#E8E0D0' }}>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold" style={{ color: '#1B3B2D' }}>
              Admin
            </h1>
            <Badge variant="outline" style={{ backgroundColor: '#1B3B2D', color: '#FDFBF7' }}>
              ADMIN
            </Badge>
          </div>
          <p className="text-sm mt-2" style={{ color: '#666' }}>
            Console
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const showBadge = item.href === '/admin/license-requests' && pendingLicenseRequests > 0
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: isActive ? '#1B3B2D' : 'transparent',
                  color: isActive ? '#FDFBF7' : '#1a1a1a',
                }}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.name}</span>
                {showBadge && (
                  <Badge
                    style={{
                      marginLeft: 'auto',
                      backgroundColor: isActive ? '#FDFBF7' : '#DC2626',
                      color: isActive ? '#DC2626' : '#FDFBF7',
                      fontSize: '11px',
                      padding: '2px 6px',
                    }}
                  >
                    {pendingLicenseRequests}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t space-y-3" style={{ borderColor: '#E8E0D0' }}>
          <div className="flex items-center gap-3 px-4 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.user_metadata?.avatar_url}
                alt={user?.user_metadata?.full_name || 'User'}
              />
              <AvatarFallback style={{ backgroundColor: '#D4A937', color: '#FDFBF7' }}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#1a1a1a' }}>
                {user?.user_metadata?.full_name || 'Admin'}
              </p>
              <p className="text-xs truncate" style={{ color: '#666' }}>
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleLogout}
              style={{
                borderColor: '#E8E0D0',
                color: '#1a1a1a',
              }}
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              style={{
                borderColor: '#E8E0D0',
                color: '#1a1a1a',
              }}
            >
              <Link href="/app/dashboard" title="Back to main app">
                <ArrowLeft size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#FDFBF7' }}>
        {/* Top Bar */}
        <header
          className="h-16 border-b px-8 flex items-center justify-between"
          style={{
            borderColor: '#E8E0D0',
            backgroundColor: '#FDFBF7',
          }}
        >
          <h2 className="text-xl font-semibold" style={{ color: '#1B3B2D' }}>
            Admin Console
          </h2>
          <div className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={user?.user_metadata?.avatar_url}
                alt={user?.user_metadata?.full_name || 'User'}
              />
              <AvatarFallback style={{ backgroundColor: '#D4A937', color: '#FDFBF7' }}>
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </div>
      </main>
    </div>
  )
}
