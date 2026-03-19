'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Stage {
  number: string;
  title: string;
  job: string;
  value: string;
}

export interface HowItWorksProps {
  eyebrow: string;
  title: string;
  description: string;
  stages: Stage[];
}

export function HowItWorks({
  eyebrow,
  title,
  description,
  stages,
}: HowItWorksProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  };

  const lineVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 0.8, ease: 'easeOut' as const },
    },
  };

  return (
    <section ref={ref} className="py-20 lg:py-32">
      <div className="container-shell">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
          className="mx-auto mb-16 max-w-2xl text-center lg:mb-20"
        >
          <Badge variant="outline" className="eyebrow-pill mb-4">
            {eyebrow}
          </Badge>
          <h2 className="text-fluid-h2 font-display font-bold text-foreground">
            {title}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
        </motion.div>

        {/* Horizontal stepper on lg, vertical on mobile */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="space-y-8 lg:space-y-0"
        >
          {/* Desktop horizontal layout */}
          <div className="hidden lg:block">
            <div className="flex items-stretch gap-4">
              {stages.map((stage, idx) => (
                <div key={idx} className="flex-1 flex flex-col">
                  {/* Connecting line above (except first) */}
                  {idx > 0 && (
                    <motion.div
                      variants={lineVariants}
                      className="h-1 bg-gradient-to-r from-primary/50 to-primary mb-4"
                      style={{ originX: 0 }}
                    />
                  )}

                  {/* Step card */}
                  <motion.div variants={stepVariants} className="flex-1">
                    <Card className="h-full rounded-xl border border-border bg-card">
                      <CardHeader>
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                          <span className="text-xl font-display font-bold">
                            {stage.number}
                          </span>
                        </div>
                        <CardTitle className="text-lg">{stage.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {stage.job}
                          </p>
                        </div>
                        <p className="text-sm text-foreground font-semibold">
                          {stage.value}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile vertical layout */}
          <div className="space-y-6 lg:hidden">
            {stages.map((stage, idx) => (
              <motion.div
                key={idx}
                variants={stepVariants}
                className="relative"
              >
                {/* Vertical connector line (except last) */}
                {idx < stages.length - 1 && (
                  <motion.div
                    variants={lineVariants}
                    className="absolute left-6 top-20 h-12 w-1 bg-gradient-to-b from-primary/50 to-primary"
                    style={{ originY: 0 }}
                  />
                )}

                {/* Mobile step card */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
                      <span className="text-lg font-display font-bold">
                        {stage.number}
                      </span>
                    </div>
                  </div>
                  <Card className="flex-1 rounded-xl border border-border bg-card p-6">
                    <CardHeader>
                      <CardTitle className="text-base">{stage.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {stage.job}
                        </p>
                      </div>
                      <p className="text-sm text-foreground font-semibold">
                        {stage.value}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
