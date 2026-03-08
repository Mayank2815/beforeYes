'use client'
import { ReactNode } from 'react'

interface BlurOverlayProps {
  children: ReactNode
  blurred?: boolean
}

export function BlurOverlay({ children, blurred = true }: BlurOverlayProps) {
  if (!blurred) return <>{children}</>
  return (
    <div className="relative overflow-hidden">
      <div className="select-none pointer-events-none" style={{ filter: 'blur(6px)', userSelect: 'none' }}>
        {children}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-paper/50 to-brand-paper" />
    </div>
  )
}
