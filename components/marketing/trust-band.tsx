'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { CheckCircle, Users, Zap, Shield } from 'lucide-react';

interface TrustBandItem {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  description: string;
}

export interface TrustBandProps {
  items?: TrustBandItem[];
}

const defaultItems: TrustBandItem[] = [
  {
    icon: CheckCircle,
    value: 'NC-first depth',
    description: 'Built on real Greensboro, Raleigh, Charlotte workflow research',
  },
  {
    icon: Zap,
    value: 'Post-submission focus',
    description: 'Designed for the messy work between comments and approvals',
  },
  {
    icon: Users,
    value: 'Regional operators',
    description: 'Made for architecture and civil teams managing repeat approvals',
  },
  {
    icon: Shield,
    value: 'Founder-led launch',
    description: 'Guided walkthroughs and workflow audits from day one',
  },
];

export function TrustBand({ items = defaultItems }: TrustBandProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={index}
            variants={itemVariants}
            className="surface-panel rounded-[26px] p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 dark:bg-primary/20">
                <Icon className="h-5 w-5 text-primary dark:text-primary" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">
                {item.value}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
