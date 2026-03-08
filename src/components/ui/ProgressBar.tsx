'use client'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  current: number
  total: number
  label?: string
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2 text-xs text-brand-muted font-body">
          <span>{label}</span>
          <span>{current} of {total}</span>
        </div>
      )}
      <div className="h-1 bg-brand-cream rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand-gold rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
