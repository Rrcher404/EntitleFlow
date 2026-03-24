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
    <section className="bg-primary text-primary-foreground py-20 lg:py-32">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="container-shell"
      >
        <div className="mx-auto max-w-2xl text-center space-y-8">
          {/* Headline */}
          <motion.h2
            variants={itemVariants}
            className="text-fluid-h2 font-display font-bold"
          >
            {title}
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-lg text-primary-foreground/70 leading-relaxed"
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
              className="bg-white text-foreground hover:bg-white/90"
              asChild
            >
              <Link href={primaryHref}>
                {primaryLabel}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link href={secondaryHref}>
                {secondaryLabel}
                <span className="ml-2">
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
