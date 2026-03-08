import { customAlphabet } from 'nanoid'

// URL-safe nanoid, 21 chars = 126 bits of entropy
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-'
export const generateSessionId = customAlphabet(alphabet, 21)

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n)
}

export function getExpiresAt(): Date {
  const d = new Date()
  d.setHours(d.getHours() + 72)
  return d
}

export function timeUntilExpiry(expiresAt: string | Date): string {
  const exp = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt
  const now = new Date()
  const diffMs = exp.getTime() - now.getTime()
  if (diffMs <= 0) return 'Expired'
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

export function isExpired(expiresAt: string | Date): boolean {
  const exp = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt
  return new Date() > exp
}

export function scoreToLabel(score: number): string {
  if (score >= 80) return 'Strong'
  if (score >= 65) return 'Good'
  if (score >= 50) return 'Moderate'
  if (score >= 35) return 'Needs Attention'
  return 'Significant Gaps'
}

export function scoreToColor(score: number): string {
  if (score >= 80) return '#27AE60'
  if (score >= 65) return '#2ECC71'
  if (score >= 50) return '#E67E22'
  if (score >= 35) return '#E74C3C'
  return '#C0392B'
}

export function sanitizeString(input: string): string {
  return input
    .trim()
    .slice(0, 100)
    .replace(/[<>{}]/g, '')
}

export function maskSessionId(sessionId: string): string {
  return sessionId.slice(-8)
}
