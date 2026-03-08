'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { LoadingPulse } from '@/components/ui/LoadingPulse'
import { ExecutiveSummary } from '@/components/report/ExecutiveSummary'
import { EmotionalBreakdown } from '@/components/report/EmotionalBreakdown'
import { FinancialSimulation } from '@/components/report/FinancialSimulation'
import { RedFlagPanel } from '@/components/report/RedFlagPanel'
import { DiscussionBlueprint } from '@/components/report/DiscussionBlueprint'
import { FALLBACK_NARRATIVE } from '@/lib/ai/explainer'
import type { ClientSession } from '@/types'

const TABS = ['Summary', 'Emotional', 'Financial', 'Risk', 'Discussion'] as const
type Tab = typeof TABS[number]

export default function ReportPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [session, setSession] = useState<ClientSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('Summary')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await axios.get(`/api/report/${id}`)
        setSession(data.session)

        // Poll if AI narrative not ready yet (but not stuck polling if complete)
        // Note: the background generation is triggered by the Preview 'View Full Report' button
        if (!data.session?.aiNarrative && data.session?.status !== 'complete') {
          setTimeout(fetchReport, 5000)
        }
      } catch (err: unknown) {
        const error = err as any
        setError(error.response?.data?.error ?? 'Unable to load report.')
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [id])

  const handleDownloadPdf = async () => {
    // Helper that opens a URL or triggers a download for data: URIs
    const openPdf = (url: string) => {
      if (url.startsWith('data:')) {
        const a = document.createElement('a')
        a.href = url
        a.download = `beforeyes-report-${id}.pdf`
        a.click()
      } else {
        window.open(url, '_blank')
      }
    }

    if (session?.pdfUrl) {
      openPdf(session.pdfUrl)
      return
    }

    setIsGeneratingPdf(true)
    try {
      const { data } = await axios.post(`/api/report/${id}/generate`)
      if (data.pdfUrl) {
        setSession((prev) => prev ? { ...prev, pdfUrl: data.pdfUrl } : prev)
        openPdf(data.pdfUrl)
      } else {
        alert('PDF generation failed. Please try again.')
      }
    } catch (err) {
      console.error(err)
      alert('Error generating PDF. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-paper flex items-center justify-center">
        <LoadingPulse text="Loading your report..." />
      </main>
    )
  }

  if (error || !session?.scores) {
    return (
      <main className="min-h-screen bg-brand-paper flex flex-col items-center justify-center gap-6 px-6 text-center">
        <Link href="/" className="font-heading text-xl text-brand-gold tracking-widest">BeforeYes</Link>
        <h2 className="font-heading text-2xl text-brand-ink">Report not available</h2>
        <p className="font-body text-sm text-brand-muted">{error}</p>
      </main>
    )
  }

  const { scores, partnerAData, partnerBData, pdfUrl, aiNarrative } = session
  const narrative = aiNarrative ?? FALLBACK_NARRATIVE

  return (
    <main className="min-h-screen bg-brand-paper">
      {/* Header */}
      <header className="bg-brand-ink px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-heading text-lg text-brand-gold tracking-widest">BeforeYes</Link>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className={`font-body text-sm text-brand-paper px-4 py-2 transition-colors flex items-center gap-2 ${isGeneratingPdf ? 'bg-brand-gold/50 cursor-not-allowed' : 'bg-brand-gold hover:bg-amber-700'
                }`}
            >
              {isGeneratingPdf ? (
                <>
                  <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Generating...
                </>
              ) : (
                'Download PDF'
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Tab Nav */}
      <div className="border-b border-brand-cream bg-white sticky top-14 z-40">
        <div className="max-w-4xl mx-auto px-6 flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                font-body text-sm px-5 py-4 border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab
                  ? 'border-brand-gold text-brand-ink'
                  : 'border-transparent text-brand-muted hover:text-brand-ink'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        {activeTab === 'Summary' && (
          <ExecutiveSummary scores={scores} narrative={narrative} />
        )}
        {activeTab === 'Emotional' && (
          <EmotionalBreakdown scores={scores} narrative={narrative} />
        )}
        {activeTab === 'Financial' && (
          <FinancialSimulation
            scores={scores}
            narrative={narrative}
            partnerAIncome={partnerAData.financial.monthlyIncome}
            partnerBIncome={partnerBData?.financialAnswers.monthlyIncome ?? 0}
            totalEMI={partnerAData.financial.monthlyEMI + (partnerBData?.financialAnswers.monthlyEMI ?? 0)}
          />
        )}
        {activeTab === 'Risk' && (
          <RedFlagPanel riskFlags={scores.riskFlags} narrative={narrative} />
        )}
        {activeTab === 'Discussion' && (
          <DiscussionBlueprint narrative={narrative} />
        )}
      </div>
    </main>
  )
}
