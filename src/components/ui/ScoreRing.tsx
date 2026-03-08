'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { scoreToColor } from '@/lib/utils'

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  label?: string
  animated?: boolean
}

export function ScoreRing({ score, size = 120, strokeWidth = 8, label, animated = true }: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(animated ? 0 : score)
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (displayed / 100) * circumference
  const color = scoreToColor(score)

  useEffect(() => {
    if (!animated) return
    let frame: number
    const start = performance.now()
    const duration = 1200
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(score * eased))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [score, animated])

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EDE8E2"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-2xl leading-none" style={{ color }}>
          {displayed}
        </span>
        {label && (
          <span className="font-body text-xs text-brand-muted mt-1 text-center leading-tight px-1">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
