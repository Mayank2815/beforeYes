'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'
import { LoadingPulse } from '@/components/ui/LoadingPulse'
import { Button } from '@/components/ui/Button'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase-client'
import { timeUntilExpiry, isExpired } from '@/lib/utils'

interface SessionPageProps {
  params: { id: string }
}

export default function SessionPage({ params }: SessionPageProps) {
  const router = useRouter()
  const { id } = params
  const [quizUrl, setQuizUrl] = useState('')
  const [status, setStatus] = useState<string>('waiting_b')
  const [expiresAt, setExpiresAt] = useState<string>('')
  const [partnerAName, setPartnerAName] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState('')

  const appBase = process.env.NEXT_PUBLIC_APP_BASE_URL ?? ''
  const url = `${appBase}/quiz/${id}`

  useEffect(() => {
    setQuizUrl(url)
    QRCode.toDataURL(url, { margin: 1, color: { dark: '#1A1614', light: '#F7F3EE' } })
      .then(setQrDataUrl)
      .catch(() => {})
  }, [url])

  // Live Firestore listener
  useEffect(() => {
    const sessionRef = doc(db, 'sessions', id)
    const unsub = onSnapshot(sessionRef, (snap) => {
      setLoading(false)
      if (!snap.exists()) return
      const data = snap.data()
      setStatus(data.status)
      setPartnerAName(data.partnerAData?.personal?.name ?? '')
      const exp = data.expiresAt?.toDate?.()?.toISOString?.() ?? ''
      setExpiresAt(exp)
      if (data.status === 'preview') {
        router.push(`/preview/${id}`)
      }
    })
    return () => unsub()
  }, [id, router])

  // Countdown
  useEffect(() => {
    if (!expiresAt) return
    const tick = () => setTimeLeft(timeUntilExpiry(expiresAt))
    tick()
    const interval = setInterval(tick, 60000)
    return () => clearInterval(interval)
  }, [expiresAt])

  async function copyLink() {
    await navigator.clipboard.writeText(quizUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <main className="min-h-screen bg-brand-paper flex items-center justify-center">
      <LoadingPulse text="Loading session..." />
    </main>
  )

  const expired = expiresAt ? isExpired(expiresAt) : false

  if (expired) {
    return (
      <main className="min-h-screen bg-brand-paper flex flex-col items-center justify-center px-6 text-center gap-6">
        <Link href="/" className="font-heading text-xl text-brand-gold tracking-widest">BeforeYes</Link>
        <h2 className="font-heading text-2xl text-brand-ink">This session has expired</h2>
        <p className="font-body text-sm text-brand-muted max-w-sm">Sessions expire after 72 hours. Please start a new assessment.</p>
        <Link href="/start"><Button>Start New Assessment</Button></Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-paper py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="font-heading text-xl text-brand-gold tracking-widest block mb-12">BeforeYes</Link>

        <div className="mb-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse-slow" />
          <span className="font-body text-sm text-brand-muted">Waiting for your partner</span>
        </div>
        <h1 className="font-heading text-3xl text-brand-ink mb-4">
          Share this link with {partnerAName ? `your partner` : 'your partner'}
        </h1>
        <p className="font-body text-sm text-brand-muted mb-8">
          Once they complete their assessment, you&apos;ll automatically be redirected to your preview.
        </p>

        {qrDataUrl && (
          <div className="bg-white p-6 border border-brand-cream flex justify-center mb-6">
            <img src={qrDataUrl} alt="Quiz QR Code" className="w-40 h-40" />
          </div>
        )}

        <div className="bg-white border border-brand-cream p-4 flex items-center justify-between gap-3 mb-6">
          <span className="font-mono text-xs text-brand-muted truncate flex-1">{quizUrl}</span>
          <Button size="sm" variant="secondary" onClick={copyLink}>
            {copied ? '✓ Copied' : 'Copy Link'}
          </Button>
        </div>

        {timeLeft && (
          <div className="bg-amber-50 border border-brand-warn/30 px-4 py-3 font-body text-sm text-brand-warn">
            Link expires in <strong>{timeLeft}</strong>
          </div>
        )}
      </div>
    </main>
  )
}
