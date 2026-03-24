'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Users, TrendingUp, Package } from 'lucide-react'

interface LicenseStats {
  total_by_type: Record<string, number>
  total_active_licenses: number
  revenue_projection: number
  license_definitions: Array<{
    type: string
    price: number
    description: string
    features: string[]
  }>
  assignment_trends: Array<{
    date: string
    count: number
  }>
}

const KPICard = ({
  icon: Icon,
  label,
  value,
  loading,
  suffix = '',
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  loading: boolean
  suffix?: string
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
            {suffix}
          </p>
        )}
      </div>
      <div className="p-3 rounded-lg" style={{ backgroundColor: '#FDFBF7', color: '#1B3B2D' }}>
        {Icon}
      </div>
    </div>
  </Card>
)

export default function LicensesPage() {
  const [stats, setStats] = useState<LicenseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLicenses = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/licenses')
        if (!res.ok) throw new Error('Failed to fetch licenses')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching licenses')
      } finally {
        setLoading(false)
      }
    }

    fetchLicenses()
  }, [])

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
            License Management
          </h1>
          <p className="text-gray-600">Platform-wide license overview and management</p>
        </div>

        {error && (
          <Card className="mb-6 border p-4" style={{ borderColor: '#E8E0D0', backgroundColor: '#FEE2E2' }}>
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard
                  icon={<Package size={24} />}
                  label="Total Active Licenses"
                  value={stats.total_active_licenses}
                  loading={false}
                />
                <KPICard
                  icon={<DollarSign size={24} />}
                  label="Revenue Projection (Annual)"
                  value={stats.revenue_projection}
                  loading={false}
                  suffix=" USD"
                />
                <KPICard
                  icon={<Users size={24} />}
                  label="License Types"
                  value={Object.keys(stats.total_by_type).length}
                  loading={false}
                />
                <KPICard
                  icon={<TrendingUp size={24} />}
                  label="Avg Assignment/Day"
                  value={(stats.assignment_trends.slice(-7).reduce((sum, t) => sum + t.count, 0) / 7).toFixed(1)}
                  loading={false}
                />
              </div>

              <Card className="p-6 rounded-xl border mb-8" style={{ borderColor: '#E8E0D0' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
                  Licenses by Type
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(stats.total_by_type).map(([type, count]) => (
                    <div
                      key={type}
                      className="p-4 rounded-lg border"
                      style={{ borderColor: '#E8E0D0', backgroundColor: '#F5F3F0' }}
                    >
                      <p className="text-sm text-gray-600">{type}</p>
                      <p className="text-2xl font-bold mt-2" style={{ color: '#1B3B2D' }}>
                        {count}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {stats.license_definitions.length > 0 && (
                <Card className="p-6 rounded-xl border mb-8 overflow-hidden" style={{ borderColor: '#E8E0D0' }}>
                  <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
                    License Definitions
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: '#F5F3F0', borderBottom: '1px solid #E8E0D0' }}>
                          <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                            Description
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1B3B2D' }}>
                            Features
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.license_definitions.map((lic) => (
                          <tr key={lic.type} style={{ borderBottom: '1px solid #E8E0D0' }}>
                            <td className="px-4 py-3 text-sm font-medium" style={{ color: '#1B3B2D' }}>
                              {lic.type}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium" style={{ color: '#D4A937' }}>
                              ${lic.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {lic.description}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex flex-wrap gap-1">
                                {lic.features.map((feature) => (
                                  <Badge
                                    key={feature}
                                    variant="outline"
                                    style={{
                                      backgroundColor: '#F5F3F0',
                                      color: '#1B3B2D',
                                      fontSize: '0.7rem',
                                    }}
                                  >
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {stats.assignment_trends.length > 0 && (
                <Card className="p-6 rounded-xl border" style={{ borderColor: '#E8E0D0' }}>
                  <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B3B2D' }}>
                    Assignment Trends (Last 30 Days)
                  </h2>
                  <div className="space-y-3">
                    {stats.assignment_trends.slice(-30).map((trend) => (
                      <div key={trend.date} className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">{trend.date}</p>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.min(trend.count * 3, 200)}px`,
                              backgroundColor: '#D4A937',
                            }}
                          />
                          <p style={{ color: '#1B3B2D' }} className="font-medium min-w-[40px] text-right">
                            {trend.count}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )
        )}
      </div>
    </div>
  )
}