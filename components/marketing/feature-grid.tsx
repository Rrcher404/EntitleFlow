'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  highlights: string[];
}

export interface FeatureGridProps {
  eyebrow: string;
  title: string;
  description: string;
  features: Feature[];
}

export function FeatureGrid({
  eyebrow,
  title,
  description,
  features,
}: FeatureGridProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  const cardHoverVariants = {
    rest: {
      y: 0,
    },
    hover: {
      y: -8,
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

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid gap-6 md:grid-cols-2 lg:gap-8"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                initial="rest"
                whileHover="hover"
              >
                <motion.div variants={cardHoverVariants}>
                  <Card className="group h-full rounded-xl border border-border bg-card">
                    <CardHeader>
                      <div className="mb-4 inline-flex rounded-lg bg-accent p-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                      <div className="space-y-2 pt-2">
                        {feature.highlights.map((highlight, hIdx) => (
                          <div
                            key={hIdx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span className="text-foreground">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
