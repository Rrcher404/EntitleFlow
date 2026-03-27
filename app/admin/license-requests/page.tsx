'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ClipboardCheck,
  Check,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Mail,
  Building2,
  Zap,
} from 'lucide-react'

interface LicenseRequest {
  id: string
  organization_id: string
  organization_name: string
  requester_email: string
  requester_full_name: string
  target_user_email: string
  target_user_full_name: string
  current_license_type: string
  requested_license_type: string
  status: 'pending' | 'approved' | 'applied' | 'rejected'
  created_at: string
  applied_at: string | null
  contract_billing_term: string | null
  contract_prepayment_status: string | null
  review_notes: string | null
  invoice_reference: string | null
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'applied' | 'rejected'

const getLicenseBadgeColor = (
  licenseType: string
): { backgroundColor: string; color: string } => {
  const colors: Record<string, { backgroundColor: string; color: string }> = {
    free: { backgroundColor: '#E8F5E9', color: '#1B5E20' },
    starter: { backgroundColor: '#E3F2FD', color: '#0D47A1' },
    professional: { backgroundColor: '#F3E5F5', color: '#4A148C' },
    enterprise: { backgroundColor: '#FFF3E0', color: '#E65100' },
  }
  return colors[licenseType.toLowerCase()] || { backgroundColor: '#F5F5F5', color: '#333' }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock size={16} className="text-yellow-600" />
    case 'approved':
      return <CheckCircle2 size={16} className="text-blue-600" />
    case 'applied':
      return <Check size={16} className="text-green-600" />
    case 'rejected':
      return <AlertCircle size={16} className="text-red-600" />
    default:
      return null
  }
}

const getStatusLabel = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function LicenseRequestsPage() {
  const [requests, setRequests] = useState<LicenseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [approvalModal, setApprovalModal] = useState<string | null>(null)
  const [rejectionModal, setRejectionModal] = useState<string | null>(null)
  const [invoiceRef, setInvoiceRef] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')
  const [rejectionNotes, setRejectionNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fetch requests on mount and when filter changes
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true)
      setError(null)
      try {
        const url =
          statusFilter === 'all'
            ? '/api/admin/license-requests'
            : `/api/admin/license-requests?status=${statusFilter}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch license requests')
        const data = await res.json()
        setRequests(Array.isArray(data) ? data : data.requests || [])
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error fetching license requests'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [statusFilter])

  const handleApprove = async (requestId: string) => {
    if (!invoiceRef.trim()) {
      setSubmitError('Invoice reference is required')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/admin/license-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          action: 'approve',
          invoice_reference: invoiceRef,
          review_notes: reviewNotes || undefined,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to approve request')
      }

      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: 'approved' as const } : req
        )
      )

      setApprovalModal(null)
      setInvoiceRef('')
      setReviewNotes('')
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Error approving request'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!rejectionNotes.trim()) {
      setSubmitError('Rejection reason is required')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/admin/license-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          action: 'reject',
          review_notes: rejectionNotes,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to reject request')
      }

      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: 'rejected' as const } : req
        )
      )

      setRejectionModal(null)
      setRejectionNotes('')
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Error rejecting request'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length
  const filteredRequests =
    statusFilter === 'all'
      ? requests
      : requests.filter((r) => r.status === statusFilter)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFBF7' }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1
              className="text-3xl font-bold mb-1"
              style={{ color: '#1B3B2D' }}
            >
              License Change Requests
            </h1>
            <p className="text-gray-600">
              Manage and review license change requests from organizations
            </p>
          </div>
          <Badge
            style={{
              backgroundColor: pendingCount > 0 ? '#FEE2E2' : '#E8F5E9',
              color: pendingCount > 0 ? '#991B1B' : '#1B5E20',
            }}
          >
            {pendingCount} Pending
          </Badge>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card
          className="mb-6 border p-4"
          style={{ borderColor: '#E8E0D0', backgroundColor: '#FEE2E2' }}
        >
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-8 border-b" style={{ borderColor: '#E8E0D0' }}>
        {['all', 'pending', 'approved', 'applied', 'rejected'].map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as StatusFilter)}
              className="px-4 py-3 font-medium border-b-2 transition-colors"
              style={{
                color:
                  statusFilter === status ? '#25a18e' : '#666',
                borderColor:
                  statusFilter === status ? '#25a18e' : 'transparent',
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6" style={{ borderColor: '#E8E0D0' }}>
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card
          className="p-8 text-center"
          style={{ borderColor: '#E8E0D0', backgroundColor: '#fff' }}
        >
          <ClipboardCheck size={32} className="mx-auto mb-3" style={{ color: '#25a18e' }} />
          <p className="text-gray-600">No requests found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="p-6 border transition-all hover:shadow-md"
              style={{ borderColor: '#E8E0D0', backgroundColor: '#fff' }}
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 size={18} style={{ color: '#1B3B2D' }} />
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: '#1B3B2D' }}
                      >
                        {request.organization_name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">
                      Requested on{' '}
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: {
                          pending: '#FEF3C7',
                          approved: '#DBEAFE',
                          applied: '#DCFCE7',
                          rejected: '#FEE2E2',
                        }[request.status],
                        color: {
                          pending: '#92400E',
                          approved: '#1E40AF',
                          applied: '#166534',
                          rejected: '#991B1B',
                        }[request.status],
                        border: 'none',
                      }}
                    >
                      {getStatusLabel(request.status)}
                    </Badge>
                  </div>
                </div>

                {/* Requester & Target User Info */}
                <div className="grid md:grid-cols-2 gap-4 py-4 border-y" style={{ borderColor: '#E8E0D0' }}>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Requester (Admin)
                    </p>
                    <p className="font-medium" style={{ color: '#1B3B2D' }}>
                      {request.requester_full_name}
                    </p>
                    <a
                      href={`mailto:${request.requester_email}`}
                      className="text-sm flex items-center gap-1 mt-1"
                      style={{ color: '#25a18e' }}
                    >
                      <Mail size={14} />
                      {request.requester_email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Target User
                    </p>
                    <p className="font-medium" style={{ color: '#1B3B2D' }}>
                      {request.target_user_full_name}
                    </p>
                    <a
                      href={`mailto:${request.target_user_email}`}
                      className="text-sm flex items-center gap-1 mt-1"
                      style={{ color: '#25a18e' }}
                    >
                      <Mail size={14} />
                      {request.target_user_email}
                    </a>
                  </div>
                </div>

                {/* License Change */}
                <div className="py-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    License Change
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                      style={getLicenseBadgeColor(request.current_license_type)}
                    >
                      {request.current_license_type}
                    </div>
                    <Zap size={20} style={{ color: '#25a18e' }} />
                    <div
                      className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                      style={getLicenseBadgeColor(request.requested_license_type)}
                    >
                      {request.requested_license_type}
                    </div>
                  </div>
                </div>

                {/* Contract Info (if available) */}
                {(request.contract_billing_term || request.contract_prepayment_status) && (
                  <div className="py-4 px-4 rounded-lg" style={{ backgroundColor: '#FDFBF7' }}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Contract Details
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {request.contract_billing_term && (
                        <div>
                          <p className="text-gray-600">Billing Term</p>
                          <p className="font-semibold" style={{ color: '#1B3B2D' }}>
                            {request.contract_billing_term}
                          </p>
                        </div>
                      )}
                      {request.contract_prepayment_status && (
                        <div>
                          <p className="text-gray-600">Prepayment Status</p>
                          <p className="font-semibold" style={{ color: '#1B3B2D' }}>
                            {request.contract_prepayment_status}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Applied Date (for applied requests) */}
                {request.status === 'applied' && request.applied_at && (
                  <div className="py-2 px-4 rounded-lg" style={{ backgroundColor: '#DCFCE7' }}>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#166534' }}>
                      <CheckCircle2 size={16} />
                      Applied on {new Date(request.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Review Notes (if available) */}
                {request.review_notes && (
                  <div className="py-2 px-4 rounded-lg" style={{ backgroundColor: '#F0F0F0' }}>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      Review Notes
                    </p>
                    <p className="text-sm text-gray-700">{request.review_notes}</p>
                  </div>
                )}

                {/* Invoice Reference (if available) */}
                {request.invoice_reference && (
                  <div className="py-2 px-4 rounded-lg" style={{ backgroundColor: '#F0F0F0' }}>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      Invoice Reference
                    </p>
                    <p className="text-sm text-gray-700">{request.invoice_reference}</p>
                  </div>
                )}

                {/* Action Buttons (for pending requests only) */}
                {request.status === 'pending' && (
                  <div className="pt-4 flex gap-3 border-t" style={{ borderColor: '#E8E0D0' }}>
                    <Button
                      onClick={() => setApprovalModal(request.id)}
                      className="flex-1"
                      style={{
                        backgroundColor: '#25a18e',
                        color: '#fff',
                        borderRadius: '8px',
                      }}
                    >
                      <Check size={16} className="mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => setRejectionModal(request.id)}
                      variant="outline"
                      className="flex-1"
                      style={{
                        borderColor: '#E8E0D0',
                        color: '#991B1B',
                      }}
                    >
                      <X size={16} className="mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      {approvalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card
            className="w-full max-w-md border"
            style={{ borderColor: '#E8E0D0', backgroundColor: '#fff' }}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#1B3B2D' }}>
                Approve License Request
              </h2>

              {submitError && (
                <div
                  className="mb-4 p-3 rounded-lg text-sm"
                  style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
                >
                  {submitError}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1B3B2D' }}>
                    Invoice Reference *
                  </label>
                  <Input
                    value={invoiceRef}
                    onChange={(e) => setInvoiceRef(e.target.value)}
                    placeholder="e.g., INV-2026-001234"
                    className="rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1B3B2D' }}>
                    Review Notes (optional)
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add any notes about this approval..."
                    className="w-full p-3 border rounded-lg text-sm"
                    style={{ borderColor: '#E8E0D0' }}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setApprovalModal(null)
                    setInvoiceRef('')
                    setReviewNotes('')
                    setSubmitError(null)
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={submitting}
                  style={{ borderColor: '#E8E0D0', color: '#1B3B2D' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleApprove(approvalModal)}
                  className="flex-1"
                  disabled={submitting}
                  style={{
                    backgroundColor: '#25a18e',
                    color: '#fff',
                    borderRadius: '8px',
                  }}
                >
                  {submitting ? 'Approving...' : 'Approve'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card
            className="w-full max-w-md border"
            style={{ borderColor: '#E8E0D0', backgroundColor: '#fff' }}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#1B3B2D' }}>
                Reject License Request
              </h2>

              {submitError && (
                <div
                  className="mb-4 p-3 rounded-lg text-sm"
                  style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
                >
                  {submitError}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: '#1B3B2D' }}>
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                  className="w-full p-3 border rounded-lg text-sm"
                  style={{ borderColor: '#E8E0D0' }}
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setRejectionModal(null)
                    setRejectionNotes('')
                    setSubmitError(null)
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={submitting}
                  style={{ borderColor: '#E8E0D0', color: '#1B3B2D' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleReject(rejectionModal)}
                  className="flex-1"
                  disabled={submitting}
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#fff',
                    borderRadius: '8px',
                  }}
                >
                  {submitting ? 'Rejecting...' : 'Reject'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
