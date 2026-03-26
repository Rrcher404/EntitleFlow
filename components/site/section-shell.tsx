"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type SectionShellProps = {
  id?: string;
  className?: string;
  animate?: boolean;
  children: React.ReactNode;
};

export function SectionShell({ id, className, animate = true, children }: SectionShellProps) {
  const ref = useRef<HTMLElement>(null);

  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const shouldAnimate = animate && !prefersReducedMotion;

  if (!shouldAnimate) {
    return (
      <section className={cn("py-14 sm:py-16", className)} id={id} ref={ref}>
        <div className="container-shell">{children}</div>
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      id={id}
      className={cn("py-14 sm:py-16", className)}
      initial={{ opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px", amount: "some" }}
      transition={{
        duration: 0.6,
        ease: [0.23, 1, 0.82, 1],
      }}
    >
      <div className="container-shell">{children}</div>
    </motion.section>
  );
}
