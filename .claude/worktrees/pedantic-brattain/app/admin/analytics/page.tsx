'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsData {
  totalSignups: number;
  signupsTrend: Array<{ month: string; count: number }>;
  permitsByStatus: Record<string, number>;
  permitsByJurisdiction: Record<string, number>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const statsData = await res.json();
        setData(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
              Analytics
            </h1>
            <p className="text-gray-600">Platform analytics and insights</p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
              Analytics
            </h1>
          </div>
          <Card className="border p-4" style={{ borderColor: '#E8E0D0', backgroundColor: '#FEE2E2' }}>
            <p className="text-red-700">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  const signupMax = Math.max(
    ...(data?.signupsTrend.map((item) => item.count) || [1])
  );
  const statusMax = Math.max(
    ...(Object.values(data?.permitsByStatus || {}) as number[])
  );
  const jurisdictionMax = Math.max(
    ...(Object.values(data?.permitsByJurisdiction || {}) as number[])
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
            Analytics
          </h1>
          <p className="text-gray-600">Platform analytics and insights</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="border p-6" style={{ borderColor: '#E8E0D0' }}>
              <h2 className="text-lg font-semibold mb-6" style={{ color: '#1B3B2D' }}>
                Summary Stats
              </h2>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-600 text-sm">Total Signups</p>
                  <p className="text-4xl font-bold mt-2" style={{ color: '#1B3B2D' }}>
                    {data?.totalSignups || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total Permits</p>
                  <p className="text-4xl font-bold mt-2" style={{ color: '#1B3B2D' }}>
                    {Object.values(data?.permitsByStatus || {}).reduce(
                      (a, b) => a + b,
                      0
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Jurisdictions</p>
                  <p className="text-4xl font-bold mt-2" style={{ color: '#1B3B2D' }}>
                    {Object.keys(data?.permitsByJurisdiction || {}).length}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border p-6" style={{ borderColor: '#E8E0D0' }}>
              <h2 className="text-lg font-semibold mb-6" style={{ color: '#1B3B2D' }}>
                Signups Over Time
              </h2>
              <div className="space-y-4">
                {data?.signupsTrend.map((item, idx) => (
                  <motion.div
                    key={item.month}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: idx * 0.1,
                    }}
                    style={{ originX: 0 }}
                    className="flex items-center gap-4"
                  >
                    <span className="w-20 text-sm font-medium" style={{ color: '#1B3B2D' }}>
                      {item.month}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: '#1B3B2D',
                          width: `${(item.count / signupMax) * 100}%`,
                        }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(item.count / signupMax) * 100}%`,
                        }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                      />
                    </div>
                    <span className="w-12 text-sm text-right text-gray-700">
                      {item.count}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border p-6" style={{ borderColor: '#E8E0D0' }}>
              <h2 className="text-lg font-semibold mb-6" style={{ color: '#1B3B2D' }}>
                Permits by Status
              </h2>
              <div className="space-y-4">
                {Object.entries(data?.permitsByStatus || {}).map(
                  ([status, count], idx) => (
                    <motion.div
                      key={status}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: idx * 0.1,
                      }}
                      style={{ originX: 0 }}
                      className="flex items-center gap-4"
                    >
                      <span className="w-20 text-sm font-medium capitalize" style={{ color: '#1B3B2D' }}>
                        {status}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: '#D4A937',
                            width: `${(count / statusMax) * 100}%`,
                          }}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(count / statusMax) * 100}%`,
                          }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                        />
                      </div>
                      <span className="w-12 text-sm text-right text-gray-700">
                        {count}
                      </span>
                    </motion.div>
                  )
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border p-6" style={{ borderColor: '#E8E0D0' }}>
              <h2 className="text-lg font-semibold mb-6" style={{ color: '#1B3B2D' }}>
                Permits by Jurisdiction
              </h2>
              <div className="space-y-4">
                {Object.entries(data?.permitsByJurisdiction || {}).map(
                  ([jurisdiction, count], idx) => (
                    <motion.div
                      key={jurisdiction}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: idx * 0.1,
                      }}
                      style={{ originX: 0 }}
                      className="flex items-center gap-4"
                    >
                      <span className="w-32 text-sm font-medium truncate" style={{ color: '#1B3B2D' }}>
                        {jurisdiction}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: '#1B3B2D',
                            width: `${(count / jurisdictionMax) * 100}%`,
                          }}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(count / jurisdictionMax) * 100}%`,
                          }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                        />
                      </div>
                      <span className="w-12 text-sm text-right text-gray-700">
                        {count}
                      </span>
                    </motion.div>
                  )
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
