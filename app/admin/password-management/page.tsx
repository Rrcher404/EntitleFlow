'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Send, Mail, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

interface PasswordReset {
  id: string
  user_email: string
  user_full_name: string
  reset_token: string
  created_at: string
  expires_at: string
  used_at: string | null
  status: 'pending' | 'used' | 'expired'
}

export default function PasswordManagementPage() {
  const [resets, setResets] = useState<PasswordReset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResets = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/password-management')
        if (!res.ok) throw new Error('Failed to fetch password resets')
        const data = await res.json()
        setResets(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching password resets')
      } finally {
        setLoading(false)
      }
    }

    fetchResets()
  }, [])

  const handleSendReset = async () => {
    if (!email.trim()) {
      setSendError('Please enter an email address')
      return
    }

    setSending(true)
    setSendError(null)
    setSendSuccess(null)

    try {
      const res = await fetch('/api/admin/password-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to send password reset')
      }

      const data = await res.json()
      setSendSuccess(`Password reset link sent to ${email}`)
      setEmail('')

      // Refresh resets list
      const res2 = await fetch('/api/admin/password-management')
      if (res2.ok) {
        const updatedResets = await res2.json()
        setResets(updatedResets)
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Error sending password reset')
    } finally {
      setSending(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'used':
        return { backgroundColor: '#F0FDF4', color: '#166534' }
      case 'expired':
        return { backgroundColor: '#FEE2E2', color: '#991B1B' }
      case 'pending':
      default:
        return { backgroundColor: '#FEF3C7', color: '#92400E' }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'used':
        return <CheckCircle2 size={16} />
      case 'expired':
        return <AlertCircle size={16} />
      case 'pending':
      default:
        return <Clock size={16} />
    }
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
            Password Management
          </h1>
          <p className="text-gray-600">Send password reset links and manage reset history</p>
        </div>

        <Card className="p-6 rounded-xl border mb-8" style={{ borderColor: '#E8E0D0' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
            Send Password Reset Link
          </h2>
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="Enter user email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendReset()}
              disabled={sending}
              style={{
                borderColor: '#E8E0D0',
              }}
              className="flex-1"
            />
            <Button
              onClick={handleSendReset}
              disabled={sending || !email.trim()}
              style={{
                backgroundColor: sending ? '#D1D5DB' : '#D4A937',
                color: '#FDFBF7',
                cursor: sending ? 'not-allowed' : 'pointer',
              }}
            >
              <Send size={16} className="mr-2" />
              {sending ? 'Sending...' : 'Send'}
            </Button>
          </div>

          {sendSuccess && (
            <div
              className="mt-4 p-4 rounded-lg border flex items-center gap-2"
              style={{
                borderColor: '#86EFAC',
                backgroundColor: '#F0FDF4',
              }}
            >
              <CheckCircle2 size={18} style={{ color: '#166534' }} />
              <p style={{ color: '#166534' }}>{sendSuccess}</p>
            </div>
          )}

          {sendError && (
            <div
              className="mt-4 p-4 rounded-lg border flex items-center gap-2"
              style={{
                borderColor: '#FCA5A5',
                backgroundColor: '#FEE2E2',
              }}
            >
              <AlertCircle size={18} style={{ color: '#991B1B' }} />
              <p style={{ color: '#991B1B' }}>{sendError}</p>
            </div>
          )}
        </Card>

        {error && (
          <Card className="mb-6 border p-4" style={{ borderColor: '#E8E0D0', backgroundColor: '#FEE2E2' }}>
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        <Card className="rounded-xl border overflow-hidden" style={{ borderColor: '#E8E0D0' }}>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
              Recent Password Reset Requests
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : resets.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No password reset requests yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#F5F3F0', borderBottom: '1px solid #E8E0D0' }}>
                      <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                        Expires
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resets.map((reset) => (
                      <tr key={reset.id} style={{ borderBottom: '1px solid #E8E0D0' }}>
                        <td className="px-4 py-3 text-sm" style={{ color: '#1B3B2D' }}>
                          {reset.user_full_name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 flex items-center gap-2">
                          <Mail size={14} />
                          {reset.user_email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {new Date(reset.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {new Date(reset.expires_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge
                            variant="outline"
                            style={getStatusBadgeColor(reset.status)}
                            className="flex items-center gap-1 w-fit"
                          >
                            {getStatusIcon(reset.status)}
                            <span>
                              {reset.status === 'used'
                                ? `Used ${new Date(reset.used_at!).toLocaleDateString()}`
                                : reset.status.charAt(0).toUpperCase() + reset.status.slice(1)}
                            </span>
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}