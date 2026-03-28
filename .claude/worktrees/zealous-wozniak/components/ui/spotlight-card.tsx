"use client"

import { ReactNode, useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface SpotlightCardProps {
  children: ReactNode
  className?: string
  spotlightColor?: string
  glowIntensity?: "light" | "medium" | "heavy"
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgb(31, 60, 53)",
  glowIntensity = "medium",
}: SpotlightCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const glowValues = {
    light: "blur(40px)",
    medium: "blur(60px)",
    heavy: "blur(100px)",
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    const container = containerRef.current
    if (container && isHovering) {
      container.addEventListener("mousemove", handleMouseMove)
      return () => {
        container.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [isHovering])

  return (
    <motion.div
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-background transition-all duration-300",
        isHovering && "border-primary/20",
        className
      )}
    >
      {/* Spotlight glow effect */}
      {isHovering && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute rounded-full transition-all duration-200"
            style={{
              width: "200px",
              height: "200px",
              left: mousePosition.x - 100,
              top: mousePosition.y - 100,
              background: `radial-gradient(circle, ${spotlightColor}40 0%, transparent 70%)`,
              filter: glowValues[glowIntensity],
            }}
          />
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

export function GlowCard({
  children,
  className,
  spotlightColor = "rgb(31, 60, 53)",
  glowIntensity = "medium",
}: SpotlightCardProps) {
  return (
    <SpotlightCard
      className={className}
      spotlightColor={spotlightColor}
      glowIntensity={glowIntensity}
    >
      {children}
    </SpotlightCard>
  )
}
