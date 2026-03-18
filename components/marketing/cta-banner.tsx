'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface CTABannerProps {
  eyebrow?: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function CTABanner({
  eyebrow,
  title,
  description,
  primaryHref = '/walkthrough',
  primaryLabel = 'Request a walkthrough',
  secondaryHref = '/early-access',
  secondaryLabel = 'Join early access',
}: CTABannerProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Animated border beam effect */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          style={{
            animation: 'border-beam 3s linear infinite',
            backgroundSize: '200% 100%',
          }}
        />
      </div>

      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/5 rounded-full blur-3xl opacity-30" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="container-shell"
      >
        <div className="mx-auto max-w-2xl text-center space-y-8">
          {/* Eyebrow */}
          {eyebrow && (
            <motion.div variants={itemVariants}>
              <Badge
                variant="outline"
                className="bg-slate-800/50 border-slate-700 text-slate-200 hover:bg-slate-800/70"
              >
                {eyebrow}
              </Badge>
            </motion.div>
          )}

          {/* Headline */}
          <motion.h2
            variants={itemVariants}
            className="text-fluid-h2 font-display font-bold text-white"
          >
            {title}
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-lg text-slate-300 leading-relaxed"
          >
            {description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Button
              size="lg"
              className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground"
              asChild
            >
              <Link href={primaryHref}>
                <span className="relative z-10">{primaryLabel}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="group border-slate-600 hover:border-slate-500 text-slate-100 hover:bg-slate-800/50"
              asChild
            >
              <Link href={secondaryHref}>
                {secondaryLabel}
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">
                  →
                </span>
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
