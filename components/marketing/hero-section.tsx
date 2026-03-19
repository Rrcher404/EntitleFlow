'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardPreview } from './dashboard-preview';

export interface HeroSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  stats: Array<{ value: string; label: string }>;
}

export function HeroSection({
  eyebrow,
  title,
  description,
  stats,
}: HeroSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  return (
    <section className="relative py-20 lg:py-28">
      <div className="container-shell">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center"
        >
          {/* Left content */}
          <div className="flex flex-col gap-6">
            {/* Eyebrow */}
            <motion.div variants={itemVariants}>
              <Badge variant="outline" className="eyebrow-pill">
                {eyebrow}
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.div variants={itemVariants}>
              <h1 className="text-fluid-h1 font-display text-foreground">
                {title}
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="max-w-lg text-base text-muted-foreground leading-relaxed"
            >
              {description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start gap-3 pt-2">
              <Button size="lg" asChild>
                <Link href="/walkthrough">
                  Request a walkthrough
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/early-access">
                  Join early access
                </Link>
              </Button>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Or explore the demo portal
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-border"
            >
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <p className="text-sm font-semibold text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right side - Dashboard Preview */}
          <motion.div
            variants={itemVariants}
            className="hidden lg:block"
          >
            <DashboardPreview />
          </motion.div>
        </motion.div>

        {/* Mobile dashboard preview */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mt-12 lg:hidden"
        >
          <DashboardPreview />
        </motion.div>
      </div>
    </section>
  );
}
