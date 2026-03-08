import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'bordered'
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const base = 'bg-white rounded-sm'
  const variants = {
    default: 'p-6',
    elevated: 'p-6 shadow-md',
    bordered: 'p-6 border border-brand-cream',
  }
  return (
    <div className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}
