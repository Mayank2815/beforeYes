'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { ScoreRing } from '@/components/ui/ScoreRing'
// import { BlurOverlay } from '@/components/ui/BlurOverlay'
// import { RazorpayButton } from '@/components/payment/RazorpayButton'
import { LoadingPulse } from '@/components/ui/LoadingPulse'
import { RiskHeatmap } from '@/components/charts/RiskHeatmap'
import { timeUntilExpiry, isExpired, scoreToLabel } from '@/lib/utils'
import type { ClientSession } from '@/types'

export default function PreviewPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [session, setSession] = useState<ClientSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`/api/report/${id}`)
      .then((res) => setSession(res.data.session))
      .catch((err) => setError(err.response?.data?.error ?? 'Session not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-paper flex items-center justify-center">
        <LoadingPulse text="Loading preview..." />
      </main>
    )
  }

  if (error || !session?.scores) {
    return (
      <main className="min-h-screen bg-brand-paper flex flex-col items-center justify-center px-6 text-center gap-6">
        <Link href="/" className="font-heading text-xl text-brand-gold tracking-widest">BeforeYes</Link>
        <h2 className="font-heading text-2xl text-brand-ink">Preview unavailable</h2>
        <p className="font-body text-sm text-brand-muted">{error || 'This session may have expired or payment is pending.'}</p>
        <Link href="/start"><button className="bg-brand-gold text-white px-6 py-3 font-body">Start New Assessment</button></Link>
      </main>
    )
  }

  const { scores } = session
  const expired = isExpired(session.expiresAt)
  const timeLeft = timeUntilExpiry(session.expiresAt)

  if (expired) {
    return (
      <main className="min-h-screen bg-brand-paper flex flex-col items-center justify-center px-6 text-center gap-6">
        <Link href="/" className="font-heading text-xl text-brand-gold tracking-widest">BeforeYes</Link>
        <h2 className="font-heading text-2xl text-brand-ink">This session has expired</h2>
        <p className="font-body text-sm text-brand-muted max-w-sm">Your data has been deleted. Please start a new assessment.</p>
        <Link href="/start"><button className="bg-brand-gold text-white px-6 py-3 font-body">Start New Assessment</button></Link>
      </main>
    )
  }

  const partnerAName = session.partnerAData.personal.name

  return (
    <main className="min-h-screen bg-brand-paper py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="font-heading text-xl text-brand-gold tracking-widest block mb-12">BeforeYes</Link>

        {/* Expiry warning */}
        <div className="mb-6 bg-amber-50 border border-brand-warn/30 px-4 py-3 font-body text-sm text-brand-warn">
          This session expires in <strong>{timeLeft}</strong>.
        </div>

        <h1 className="font-heading text-3xl text-brand-ink mb-2">Your Compatibility Preview</h1>
        <p className="font-body text-sm text-brand-muted mb-10">Showing your results. View the full report below.</p>

        {/* Visible scores */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="flex flex-col items-center gap-2 p-6 bg-white border border-brand-cream">
            <ScoreRing score={scores.overall} size={80} strokeWidth={6} label="Overall" />
          </div>
          <div className="flex flex-col items-center gap-2 p-6 bg-white border border-brand-cream">
            <ScoreRing score={scores.emotional} size={80} strokeWidth={6} label="Emotional" />
          </div>
          <div className="flex flex-col items-center gap-2 p-6 bg-white border border-brand-cream">
            <ScoreRing score={scores.financial} size={80} strokeWidth={6} label="Financial" />
          </div>
        </div>

        {/* One risk indicator preview */}
        {scores.riskFlags.length > 0 && (
          <div className={`mb-6 p-4 border-l-4 ${scores.riskFlags[0].severity === 'high' ? 'border-brand-danger bg-red-50' : 'border-brand-warn bg-amber-50'}`}>
            <div className="font-body text-xs uppercase tracking-wide text-brand-muted mb-1">Risk Indicator Detected</div>
            <div className="font-body font-semibold text-brand-ink">{scores.riskFlags[0].label}</div>
            <div className="font-body text-xs text-brand-muted mt-0.5">{scores.riskFlags[0].severity} severity · {scores.riskFlags.length} total indicator{scores.riskFlags.length > 1 ? 's' : ''}</div>
          </div>
        )}

        {/* CTA — redirects directly to full report (payment bypassed for now) */}
        <div className="bg-brand-ink p-8 text-center">
          <h2 className="font-heading text-2xl text-brand-paper mb-2">View Your Full Report</h2>
          <p className="font-body text-sm text-brand-muted mb-6">
            Foundational scores · AI narrative · 15 discussion questions · Downloadable PDF
          </p>
          <button
            onClick={() => {
              axios.post(`/api/report/${id}/generate`).catch(() => { })
              router.push(`/report/${id}`)
            }}
            className="bg-brand-gold text-white px-8 py-4 font-body font-medium tracking-wide hover:bg-amber-700 transition-colors"
          >
            View Full Report →
          </button>

          {/* TODO: Re-enable Razorpay payment before going live */}
          {/* <RazorpayButton sessionId={id} partnerAName={partnerAName} /> */}
          {/* <p className="mt-4 font-body text-xs text-brand-muted/50">
            Your report is saved. Complete payment to unlock.
          </p> */}
        </div>
      </div>
    </main>
  )
}
