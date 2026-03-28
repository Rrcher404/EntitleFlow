"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface BentoCardProps {
  className?: string
  background?: ReactNode
  icon?: ReactNode
  name: string
  description: string
  href?: string
  cta?: string
  ctaHref?: string
  hoverEffect?: boolean
  children?: ReactNode
}

export interface BentoGridProps {
  children: ReactNode
  className?: string
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid w-full gap-4 auto-rows-max grid-cols-1 md:grid-cols-3 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  )
}

export function BentoCard({
  className,
  background,
  icon,
  name,
  description,
  href,
  cta,
  ctaHref,
  hoverEffect = true,
  children,
}: BentoCardProps) {
  const content = (
    <motion.div
      whileHover={hoverEffect ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-background p-6 transition-all duration-300",
        "hover:border-primary/30 hover:shadow-sm",
        className
      )}
    >
      {/* Background element */}
      {background && (
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {background}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col gap-4">
        {/* Icon */}
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <div className="text-primary">{icon}</div>
          </div>
        )}

        {/* Title and Description */}
        <div className="space-y-2 flex-1">
          <h3 className="font-semibold text-foreground text-lg leading-snug">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Children */}
        {children && <div>{children}</div>}

        {/* CTA */}
        {cta && (
          <a
            href={ctaHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors mt-2"
          >
            {cta}
            <span aria-hidden="true">&rarr;</span>
          </a>
        )}
      </div>
    </motion.div>
  )

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    )
  }

  return content
}
