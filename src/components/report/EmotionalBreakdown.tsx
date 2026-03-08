'use client'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { RadarChartComponent } from '@/components/charts/RadarChart'
import type { ScoreResult, AINarrative } from '@/types'

interface EmotionalBreakdownProps {
  scores: ScoreResult
  narrative: AINarrative
}

export function EmotionalBreakdown({ scores, narrative }: EmotionalBreakdownProps) {
  const eb = scores.sectionBreakdown.emotional
  const radarData = [
    { subject: 'Core Values', score: eb.coreValues, fullMark: 100 },
    { subject: 'Conflict Style', score: eb.conflictStyle, fullMark: 100 },
    { subject: 'Emotional Stability', score: eb.emotionalStability, fullMark: 100 },
    { subject: 'Lifestyle Vision', score: eb.lifestyleVision, fullMark: 100 },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {radarData.map((d) => (
          <div key={d.subject} className="flex flex-col items-center gap-1">
            <ScoreRing score={d.score} size={80} strokeWidth={6} label={d.subject} />
          </div>
        ))}
      </div>
      <RadarChartComponent data={radarData} />
      <div className="bg-white border-l-4 border-brand-gold p-6">
        <h3 className="font-heading text-lg text-brand-ink mb-3">Emotional Insights</h3>
        <p className="font-body text-sm text-brand-ink leading-relaxed">{narrative.emotionalInsights}</p>
      </div>
    </div>
  )
}
