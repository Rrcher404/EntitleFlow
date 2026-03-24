'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Database,
  Users,
  Building2,
  FileText,
  HardDrive,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

interface DiagnosticsData {
  summary: {
    total_organizations: number
    total_users: number
    total_projects: number
    total_permits: number
    total_documents: number
  }
  storage: {
    total_used_bytes: number
    total_allocated_bytes: number
    percentage_used: number
  }
  top_orgs_by_storage: Array<{
    name: string
    storage_used_bytes: number
    storage_limit_bytes: number
  }>
  top_orgs_by_users: Array<{
    name: string
    user_count: number
  }>
  database_stats: Record<string, number>
  recent_errors: Array<{
    id: string
    message: string
    timestamp: string
    count: number
  }>
  system_config: Record<string, string | number | boolean>
}

const KPICard = ({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  loading: boolean
}) => (
  <Card className="p-6 rounded-xl border" style={{ borderColor: '#E8E0D0', backgroundColor: '#fff' }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm" style={{ color: '#666' }}>
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-8 w-24 mt-2" />
        ) : (
          <p className="text-3xl font-bold mt-2" style={{ color: '#1B3B2D' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        )}
      </div>
      <div className="p-3 rounded-lg" style={{ backgroundColor: '#FDFBF7', color: '#1B3B2D' }}>
        {Icon}
      </div>
    </div>
  </Card>
)

export default function DiagnosticsPage() {
  const [data, setData] = useState<DiagnosticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDiagnostics = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/diagnostics')
        if (!res.ok) throw new Error('Failed to fetch diagnostics')
        const diagnosticsData = await res.json()
        setData(diagnosticsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching diagnostics')
      } finally {
        setLoading(false)
      }
    }

    fetchDiagnostics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8" style={{ color: '#1B3B2D' }}>
            Platform Diagnostics
          </h1>
          <Card className="p-6 border" style={{ borderColor: '#E8E0D0', backgroundColor: '#FEE2E2' }}>
            <p className="text-red-700">{error || 'Failed to load diagnostics'}</p>
          </Card>
        </div>
      </div>
    )
  }

  const storageGB = (data.storage.total_used_bytes / 1024 / 1024 / 1024).toFixed(2)
  const storageLimitGB = (data.storage.total_allocated_bytes / 1024 / 1024 / 1024).toFixed(2)

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
            Platform Diagnostics
          </h1>
          <p className="text-gray-600">System health and platform-wide statistics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <KPICard
            icon={<Building2 size={24} />}
            label="Organizations"
            value={data.summary.total_organizations}
            loading={false}
          />
          <KPICard
            icon={<Users size={24} />}
            label="Users"
            value={data.summary.total_users}
            loading={false}
          />
          <KPICard
            icon={<FileText size={24} />}
            label="Projects"
            value={data.summary.total_projects}
            loading={false}
          />
          <KPICard
            icon={<Database size={24} />}
            label="Permits"
            value={data.summary.total_permits}
            loading={false}
          />
          <KPICard
            icon={<HardDrive size={24} />}
            label="Documents"
            value={data.summary.total_documents}
            loading={false}
          />
        </div>

        <Card className="p-6 rounded-xl border mb-8" style={{ borderColor: '#E8E0D0' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
            Storage Usage
          </h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600">Total Storage</p>
                <p style={{ color: '#1B3B2D' }} className="text-sm font-medium">
                  {storageGB} GB / {storageLimitGB} GB
                </p>
              </div>
              <div
                className="w-full h-3 rounded-full"
                style={{ backgroundColor: '#E8E0D0' }}
              >
                <div
                  className="h-3 rounded-full"
                  style={{
                    width: `${Math.min(data.storage.percentage_used, 100)}%`,
                    backgroundColor:
                      data.storage.percentage_used > 80 ? '#EF4444' : '#D4A937',
                  }}
                />
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {data.storage.percentage_used.toFixed(1)}% used
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 rounded-xl border overflow-hidden" style={{ borderColor: '#E8E0D0' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
              Top 10 Organizations by Storage
            </h2>
            <div className="space-y-2">
              {data.top_orgs_by_storage.slice(0, 10).map((org, idx) => {
                const usagePercent = (org.storage_used_bytes / org.storage_limit_bytes) * 100
                return (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-gray-700">{org.name}</p>
                      <p className="text-xs text-gray-600">
                        {(org.storage_used_bytes / 1024 / 1024).toFixed(0)}MB
                      </p>
                    </div>
                    <div
                      className="w-full h-2 rounded-full"
                      style={{ backgroundColor: '#E8E0D0' }}
                    >
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.min(usagePercent, 100)}%`,
                          backgroundColor: usagePercent > 80 ? '#EF4444' : '#D4A937',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-6 rounded-xl border" style={{ borderColor: '#E8E0D0' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
              Top 10 Organizations by Users
            </h2>
            <div className="space-y-2">
              {data.top_orgs_by_users.slice(0, 10).map((org, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <p className="text-sm text-gray-700">{org.name}</p>
                  <Badge
                    variant="outline"
                    style={{ backgroundColor: '#F5F3F0', color: '#1B3B2D' }}
                  >
                    {org.user_count} users
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {Object.keys(data.database_stats).length > 0 && (
          <Card className="p-6 rounded-xl border mb-8" style={{ borderColor: '#E8E0D0' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
              Database Table Counts
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(data.database_stats).map(([table, count]) => (
                <div
                  key={table}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: '#E8E0D0', backgroundColor: '#F5F3F0' }}
                >
                  <p className="text-sm text-gray-600 truncate">{table}</p>
                  <p className="text-2xl font-bold mt-2" style={{ color: '#1B3B2D' }}>
                    {(count as number).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {data.recent_errors.length > 0 && (
          <Card className="p-6 rounded-xl border mb-8 border-red-200" style={{ borderColor: '#E8E0D0' }}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#991B1B' }}>
              <AlertCircle size={20} />
              Recent Errors
            </h2>
            <div className="space-y-3">
              {data.recent_errors.slice(0, 10).map((err) => (
                <div
                  key={err.id}
                  className="p-3 rounded-lg border"
                  style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-red-900">{err.message}</p>
                      <p className="text-xs text-red-700 mt-1">
                        {new Date(err.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                      {err.count} times
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {Object.keys(data.system_config).length > 0 && (
          <Card className="p-6 rounded-xl border" style={{ borderColor: '#E8E0D0' }}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#1B3B2D' }}>
              <CheckCircle2 size={20} />
              System Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.system_config).map(([key, value]) => (
                <div key={key} className="p-3 rounded-lg" style={{ backgroundColor: '#F5F3F0' }}>
                  <p className="text-xs text-gray-600 uppercase">{key}</p>
                  <p className="text-sm font-medium mt-1" style={{ color: '#1B3B2D' }}>
                    {typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}