'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Shield, Mail, Building2, Key } from 'lucide-react'

interface UserDetail {
  id: string
  email: string
  full_name: string
  organization: {
    id: string
    name: string
  }
  role: string
  license_type: string
  is_super_admin: boolean
  is_active: boolean
  created_at: string
  last_login: string | null
  permissions: string[]
  activity: Array<{
    id: string
    action: string
    resource_type: string
    timestamp: string
  }>
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = params.id as string

  useEffect(() => {
    const fetchUserDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/users/${userId}`)
        if (!res.ok) throw new Error('Failed to fetch user')
        const data = await res.json()
        setUser(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching user')
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetail()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error || !user) {
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
            <p className="text-red-700">{error || 'User not found'}</p>
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
                {user.full_name || user.email}
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                style={{
                  backgroundColor: user.is_active ? '#F0FDF4' : '#FEE2E2',
                  color: user.is_active ? '#166534' : '#991B1B',
                }}
              >
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {user.is_super_admin && (
                <Badge
                  variant="outline"
                  style={{
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                  }}
                >
                  <Shield size={12} className="mr-1" />
                  Super Admin
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 rounded-xl border" style={{ borderColor: '#E8E0D0' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
              Profile
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p style={{ color: '#1B3B2D' }} className="flex items-center gap-2 mt-1">
                  <Mail size={16} />
                  {user.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p style={{ color: '#1B3B2D' }}>{user.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">License Type</p>
                <p style={{ color: '#1B3B2D' }}>{user.license_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Joined</p>
                <p style={{ color: '#1B3B2D' }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-xl border" style={{ borderColor: '#E8E0D0' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
              Organization
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Organization</p>
                <p style={{ color: '#1B3B2D' }} className="flex items-center gap-2 mt-1">
                  <Building2 size={16} />
                  {user.organization.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Organization ID</p>
                <p style={{ color: '#1B3B2D' }} className="font-mono text-xs">
                  {user.organization.id}
                </p>
              </div>
              {user.last_login && (
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p style={{ color: '#1B3B2D' }}>
                    {new Date(user.last_login).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {user.permissions.length > 0 && (
          <Card className="p-6 rounded-xl border mb-8" style={{ borderColor: '#E8E0D0' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
              <div className="flex items-center gap-2">
                <Key size={20} />
                Permissions
              </div>
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((perm) => (
                <Badge
                  key={perm}
                  variant="outline"
                  style={{
                    backgroundColor: '#F5F3F0',
                    color: '#1B3B2D',
                  }}
                >
                  {perm}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {user.activity.length > 0 && (
          <Card className="p-6 rounded-xl border" style={{ borderColor: '#E8E0D0' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
              Activity History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#F5F3F0', borderBottom: '1px solid #E8E0D0' }}>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Resource
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {user.activity.slice(0, 50).map((activity) => (
                    <tr key={activity.id} style={{ borderBottom: '1px solid #E8E0D0' }}>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: '#1B3B2D' }}>
                        {activity.action}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {activity.resource_type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(activity.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}