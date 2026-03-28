'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Building2,
  Zap,
  FileText,
  TrendingUp,
  Clock,
} from 'lucide-react'

interface Stats {
  totalUsers: number
  totalOrganizations: number
  activeProjects: number
  totalPermits: number
  marketingLeads: number
}

interface ActivityLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  timestamp: string
  user_email?: string
}

interface Profile {
  id: string
  email: string
  full_name?: string
  created_at: string
}

const KPICard = ({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode
  label: string
  value: number
  loading: boolean
}) => (
  <Card className="p-6 rounded-xl border" style={{ borderColor: '#E8E0D0', backgroundColor: '#fff' }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm" style={{ color: '#666' }}>
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-8 w-20 mt-2" />
        ) : (
          <p className="text-3xl font-bold mt-2" style={{ color: '#1B3B2D' }}>
            {value.toLocaleString()}
          </p>
        )}
      </div>
      <div className="p-3 rounded-lg" style={{ backgroundColor: '#FDFBF7', color: '#1B3B2D' }}>
        {Icon}
      </div>
    </div>
  </Card>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [recentSignups, setRecentSignups] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/stats')

        if (!response.ok) {
          throw new Error('Failed to fetch admin stats')
        }

        const data = await response.json()
        setStats(data.stats)
        setActivityLogs(data.activityLogs || [])
        setRecentSignups(data.recentSignups || [])
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes('create')) return '#D4A937'
    if (action.includes('update')) return '#1B3B2D'
    if (action.includes('delete')) return '#c94a4a'
    return '#666'
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className="p-6 rounded-xl border text-center"
          style={{ borderColor: '#E8E0D0', backgroundColor: '#fff' }}
        >
          <p style={{ color: '#c94a4a' }}>Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <div>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#1B3B2D' }}>
          Key Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            icon={<Users size={24} />}
            label="Total Users"
            value={stats?.totalUsers || 0}
            loading={loading}
          />
          <KPICard
            icon={<Building2 size={24} />}
            label="Total Organizations"
            value={stats?.totalOrganizations || 0}
            loading={loading}
          />
          <KPICard
            icon={<Zap size={24} />}
            label="Active Projects"
            value={stats?.activeProjects || 0}
            loading={loading}
          />
          <KPICard
            icon={<FileText size={24} />}
            label="Total Permits"
            value={stats?.totalPermits || 0}
            loading={loading}
          />
          <KPICard
            icon={<TrendingUp size={24} />}
            label="Marketing Leads"
            value={stats?.marketingLeads || 0}
            loading={loading}
          />
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#1B3B2D' }}>
          Recent Activity
        </h2>
        <Card className="overflow-hidden rounded-xl border" style={{ borderColor: '#E8E0D0' }}>
          {loading ? (
            <div className="divide-y" style={{ borderColor: '#E8E0D0' }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4">
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : activityLogs.length > 0 ? (
            <div className="divide-y" style={{ borderColor: '#E8E0D0' }}>
              {activityLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock size={16} style={{ color: '#D4A937' }} />
                    <div>
                      <p className="font-medium" style={{ color: '#1a1a1a' }}>
                        {log.action.replace(/_/g, ' ').charAt(0).toUpperCase() +
                          log.action.replace(/_/g, ' ').slice(1)}
                      </p>
                      <p className="text-xs" style={{ color: '#666' }}>
                        {log.user_email || log.user_id} •{' '}
                        {log.resource_type.charAt(0).toUpperCase() + log.resource_type.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: getActionBadgeColor(log.action),
                        color: '#fff',
                        borderColor: getActionBadgeColor(log.action),
                      }}
                    >
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                    <p className="text-xs" style={{ color: '#999' }}>
                      {formatDate(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center" style={{ color: '#999' }}>
              <p>No recent activity</p>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Signups Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#1B3B2D' }}>
          Recent Signups
        </h2>
        <Card className="overflow-hidden rounded-xl border" style={{ borderColor: '#E8E0D0' }}>
          {loading ? (
            <div className="divide-y" style={{ borderColor: '#E8E0D0' }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4">
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : recentSignups.length > 0 ? (
            <div className="divide-y" style={{ borderColor: '#E8E0D0' }}>
              {recentSignups.slice(0, 5).map((profile) => (
                <div key={profile.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: '#1a1a1a' }}>
                      {profile.full_name || 'Unknown User'}
                    </p>
                    <p className="text-sm" style={{ color: '#666' }}>
                      {profile.email}
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: '#999' }}>
                    {formatDate(profile.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center" style={{ color: '#999' }}>
              <p>No recent signups</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
