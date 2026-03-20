"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, HelpCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQAccordionBlockProps {
  faqs: FAQItem[]
  title?: string
  description?: string
  eyebrowLabel?: string
}

export function FAQAccordionBlock({
  faqs,
  title = "Frequently asked questions",
  description,
  eyebrowLabel = "FAQ",
}: FAQAccordionBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        {eyebrowLabel && (
          <Badge
            variant="outline"
            className="eyebrow-pill w-fit px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
          >
            {eyebrowLabel}
          </Badge>
        )}
        <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="text-base leading-7 text-muted-foreground sm:text-lg max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {faqs.map((item, index) => (
          <FAQAccordionItem
            key={index}
            index={index}
            question={item.question}
            answer={item.answer}
            isOpen={openIndex === index}
            onToggle={() => toggleItem(index)}
          />
        ))}
      </div>
    </div>
  )
}

interface FAQAccordionItemProps {
  index: number
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function FAQAccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: FAQAccordionItemProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-colors cursor-pointer",
        isOpen
          ? "border-border bg-background"
          : "border-border bg-background hover:bg-accent/50"
      )}
      onClick={onToggle}
    >
      {/* Question Header */}
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <div className="flex-shrink-0 pt-1">
          <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
        </div>
        <div className="flex-1 min-w-0">
          <button
            onClick={onToggle}
            className="w-full text-left flex items-center justify-between gap-4 focus:outline-none"
          >
            <h3 className="font-medium text-foreground text-base leading-relaxed">
              {question}
            </h3>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Answer Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="overflow-hidden">
              <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-muted-foreground leading-relaxed border-t border-border">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
