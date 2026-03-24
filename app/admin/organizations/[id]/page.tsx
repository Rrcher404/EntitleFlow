'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Users,
  Database,
  Calendar,
  Package,
  AlertCircle,
} from 'lucide-react'

interface OrganizationDetail {
  id: string
  name: string
  slug: string
  type: string
  created_at: string
  subscription_tier: string
  storage_used: number
  storage_limit: number
  max_users: number
  user_count: number
  is_active: boolean
  users: Array<{
    id: string
    email: string
    full_name: string
    license_type: string
    role: string
  }>
  licenses: Array<{
    type: string
    count: number
  }>
  activity: Array<{
    id: string
    action: string
    timestamp: string
    user_email: string
  }>
}

export default function OrganizationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [org, setOrg] = useState<OrganizationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orgId = params.id as string

  useEffect(() => {
    const fetchOrgDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/organizations/${orgId}`)
        if (!res.ok) throw new Error('Failed to fetch organization')
        const data = await res.json()
        setOrg(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching organization')
      } finally {
        setLoading(false)
      }
    }

    fetchOrgDetail()
  }, [orgId])

  const storagePercentage = org ? (org.storage_used / org.storage_limit) * 100 : 0
  const usersPercentage = org ? (org.user_count / org.max_users) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-2 gap-6 mb-8">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error || !org) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
        <div className="max-w-6xl mx-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            style={{ borderColor: '#E8E0D0', color: '#1B3B2D' }}
            className="mb-6"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <Card className="p-6 border" style={{ borderColor: '#E8E0D0', backgroundColor: '#FEE2E2' }}>
            <p className="text-red-700">{error || 'Organization not found'}</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="max-w-6xl mx-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          style={{ borderColor: '#E8E0D0', color: '#1B3B2D' }}
          className="mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
                {org.name}
              </h1>
              <p className="text-gray-600">{org.slug}</p>
            </div>
            <Badge
              variant="outline"
              style={{
                backgroundColor: org.is_active ? '#F0FDF4' : '#FEE2E2',
                color: org.is_active ? '#166534' : '#991B1B',
              }}
            >
              {org.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 rounded-xl border" style={{ borderColor: '#E8E0D0' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
              Organization Info
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p style={{ color: '#1B3B2D' }}>{org.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Subscription Tier</p>
                <p style={{ color: '#1B3B2D' }}>{org.subscription_tier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p style={{ color: '#1B3B2D' }}>
                  {new Date(org.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-xl border" style={{ borderColor: '#E8E0D0' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
              Storage Usage
            </h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">Used vs Limit</p>
                  <p style={{ color: '#1B3B2D' }} className="text-sm font-medium">
                    {(org.storage_used / 1024 / 1024).toFixed(2)} MB / {(org.storage_limit / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div
                  className="w-full h-2 rounded-full"
                  style={{ backgroundColor: '#E8E0D0' }}
                >
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(storagePercentage, 100)}%`,
                      backgroundColor: storagePercentage > 80 ? '#EF4444' : '#D4A937',
                    }}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-600">
                {storagePercentage.toFixed(1)}% used
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 rounded-xl border mb-8" style={{ borderColor: '#E8E0D0' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: '#1B3B2D' }}>
              User Count
            </h2>
            <Users size={20} style={{ color: '#D4A937' }} />
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600">Users vs Max Limit</p>
              <p style={{ color: '#1B3B2D' }} className="text-sm font-medium">
                {org.user_count} / {org.max_users}
              </p>
            </div>
            <div
              className="w-full h-2 rounded-full"
              style={{ backgroundColor: '#E8E0D0' }}
            >
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${Math.min(usersPercentage, 100)}%`,
                  backgroundColor: usersPercentage > 80 ? '#EF4444' : '#D4A937',
                }}
              />
            </div>
          </div>
          <div className="text-xs text-gray-600">
            {usersPercentage.toFixed(1)}% of max users
          </div>
        </Card>

        {org.licenses.length > 0 && (
          <Card className="p-6 rounded-xl border mb-8" style={{ borderColor: '#E8E0D0' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
              License Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {org.licenses.map((lic) => (
                <div key={lic.type} className="p-4 rounded-lg" style={{ backgroundColor: '#F5F3F0' }}>
                  <p className="text-sm text-gray-600">{lic.type}</p>
                  <p className="text-2xl font-bold" style={{ color: '#1B3B2D' }}>
                    {lic.count}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6 rounded-xl border mb-8 overflow-hidden" style={{ borderColor: '#E8E0D0' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
            Organization Users
          </h2>
          {org.users.length === 0 ? (
            <p className="text-gray-600">No users in this organization</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#F5F3F0', borderBottom: '1px solid #E8E0D0' }}>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      License
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {org.users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #E8E0D0' }}>
                      <td className="px-4 py-3 text-sm">{user.full_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="outline" style={{ backgroundColor: '#F5F3F0', color: '#1B3B2D' }}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">{user.license_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {org.activity.length > 0 && (
          <Card className="p-6 rounded-xl border" style={{ borderColor: '#E8E0D0' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
              Recent Activity
            </h2>
            <div className="space-y-3">
              {org.activity.slice(0, 10).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between p-3 rounded-lg"
                  style={{ backgroundColor: '#F5F3F0' }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1B3B2D' }}>
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-600">{activity.user_email}</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    {new Date(activity.timestamp).toLocaleString()}
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