'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardPreview } from './dashboard-preview';
import { cn } from '@/lib/utils';

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
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  };

  const textVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeOut' as const },
    },
  };

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Grid background pattern */}
      <div className="absolute inset-0 -z-10 opacity-[0.02]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'linear-gradient(0deg, transparent 24%, rgba(15, 60, 53, 0.05) 25%, rgba(15, 60, 53, 0.05) 26%, transparent 27%, transparent 74%, rgba(15, 60, 53, 0.05) 75%, rgba(15, 60, 53, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(15, 60, 53, 0.05) 25%, rgba(15, 60, 53, 0.05) 26%, transparent 27%, transparent 74%, rgba(15, 60, 53, 0.05) 75%, rgba(15, 60, 53, 0.05) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="container-shell">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center"
        >
          {/* Left content */}
          <div className="flex flex-col gap-8">
            {/* Eyebrow */}
            <motion.div variants={itemVariants}>
              <Badge variant="outline" className="eyebrow-pill">
                {eyebrow}
              </Badge>
            </motion.div>

            {/* Headline with animated gradient text */}
            <motion.div variants={textVariants}>
              <h1 className="text-fluid-h1 font-display font-bold text-foreground">
                {title.split(' ').map((word, idx) => (
                  <motion.span
                    key={idx}
                    className={cn(
                      idx === title.split(' ').length - 1
                        ? 'bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent'
                        : ''
                    )}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      ease: 'easeOut',
                      delay: 0.4 + idx * 0.08,
                    }}
                  >
                    {word}{' '}
                  </motion.span>
                ))}
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="max-w-lg text-lg text-muted-foreground leading-relaxed"
            >
              {description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="group relative overflow-hidden" asChild>
                <Link href="/walkthrough">
                  <span className="relative z-10">Request a walkthrough</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="group border-primary/30 hover:border-primary/50"
                asChild
              >
                <Link href="/early-access">
                  Join early access
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </span>
                </Link>
              </Button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-border/50"
            >
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <p className="text-sm font-semibold text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
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
          className="mt-12 lg:hidden"
        >
          <DashboardPreview />
        </motion.div>
      </div>
    </section>
  );
}
