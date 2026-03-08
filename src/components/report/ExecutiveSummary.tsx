'use client'
import { ScoreRing } from '@/components/ui/ScoreRing'
import type { ScoreResult, AINarrative } from '@/types'
import { scoreToLabel } from '@/lib/utils'

interface ExecutiveSummaryProps {
  scores: ScoreResult
  narrative: AINarrative
}

export function ExecutiveSummary({ scores, narrative }: ExecutiveSummaryProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-2 py-6">
        <ScoreRing score={scores.overall} size={160} strokeWidth={10} label="Overall Score" />
        <p className="font-heading text-xl text-brand-gold">{scoreToLabel(scores.overall)}</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center gap-2 p-4 bg-brand-cream rounded-sm">
          <ScoreRing score={scores.emotional} size={80} strokeWidth={6} label="Emotional" />
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-brand-cream rounded-sm">
          <ScoreRing score={scores.financial} size={80} strokeWidth={6} label="Financial" />
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-brand-cream rounded-sm">
          <ScoreRing score={scores.foundational} size={80} strokeWidth={6} label="Foundational" />
        </div>
      </div>
      <div className="bg-white border-l-4 border-brand-gold p-6">
        <p className="font-body text-base text-brand-ink leading-relaxed">{narrative.summary}</p>
      </div>
    </div>
  )
}
