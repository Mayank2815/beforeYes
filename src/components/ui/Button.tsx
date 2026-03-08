'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-brand-gold text-white hover:bg-amber-700 border border-brand-gold',
  secondary: 'bg-transparent text-brand-ink border border-brand-ink hover:bg-brand-cream',
  ghost: 'bg-transparent text-brand-muted hover:text-brand-ink border border-transparent',
  danger: 'bg-brand-danger text-white hover:bg-red-700 border border-brand-danger',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={`
          font-body font-medium tracking-wide transition-all duration-150 disabled:opacity-50
          disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2
          ${variantClasses[variant as NonNullable<ButtonProps['variant']>]} ${sizeClasses[size as NonNullable<ButtonProps['size']>]} ${className}
        `}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </span>
        ) : children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
