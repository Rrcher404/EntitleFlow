'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { StatusBadge } from './status-badge';

export function DashboardPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isHovered, setIsHovered] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  };

  const commentVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 p-0">
        {/* Header */}
        <div className="border-b border-border/50 bg-slate-950 px-6 py-4 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-display text-sm font-semibold text-white">
                Greensboro Stormwater Review
              </h4>
              <p className="mt-1 text-xs text-slate-400">Project ID: GRX-2024-0847</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status="in-progress" pulse>
                In Review
              </StatusBadge>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div className="divide-y divide-border/30 p-6">
          <motion.div
            className="pb-4"
            variants={commentVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  JM
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">
                    James Miller
                  </span>
                  <StatusBadge status="open">Need Revision</StatusBadge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Verify swale depth calculations per GRX standards
                </p>
                <div className="mt-2 flex gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Stormwater
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="py-4"
            variants={commentVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  SH
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">
                    Sarah Holmes
                  </span>
                  <StatusBadge status="ready-for-review">Approved</StatusBadge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Site plan layout meets zoning setbacks. Ready for engineering sign-off.
                </p>
                <div className="mt-2 flex gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Zoning
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="pt-4"
            variants={commentVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  DK
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">
                    David Kirkwood
                  </span>
                  <StatusBadge status="in-progress">In Progress</StatusBadge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Traffic study methodology clarified. Awaiting revised calcs.
                </p>
                <div className="mt-2 flex gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Transportation
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <div className="border-t border-border/50 bg-slate-50 px-6 py-4 dark:bg-slate-900/50">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Comments Mapped</p>
              <p className="mt-1 text-lg font-semibold text-foreground">3</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Response Matrix</p>
              <p className="mt-1 text-lg font-semibold text-foreground">67%</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Status</p>
              <p className="mt-1 text-lg font-semibold text-foreground">Active</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
