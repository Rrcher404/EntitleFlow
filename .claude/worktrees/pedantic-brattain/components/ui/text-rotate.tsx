"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface TextRotateProps {
  words: string[]
  interval?: number
  className?: string
}

export function TextRotate({
  words,
  interval = 3000,
  className = "",
}: TextRotateProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, interval)

    return () => clearInterval(timer)
  }, [words.length, interval])

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className={className}
      >
        {words[index]}
      </motion.span>
    </AnimatePresence>
  )
}
