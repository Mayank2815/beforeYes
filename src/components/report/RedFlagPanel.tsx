'use client'
import type { RiskFlag, AINarrative } from '@/types'
import { RiskHeatmap } from '@/components/charts/RiskHeatmap'

interface RedFlagPanelProps {
  riskFlags: RiskFlag[]
  narrative: AINarrative
}

export function RedFlagPanel({ riskFlags, narrative }: RedFlagPanelProps) {
  return (
    <div className="space-y-8">
      <RiskHeatmap riskFlags={riskFlags} />
      {riskFlags.length === 0 ? (
        <div className="bg-green-50 border-l-4 border-brand-safe p-5 font-body text-sm text-brand-ink">
          No significant risk indicators were detected in this assessment.
        </div>
      ) : (
        <div className="space-y-4">
          {riskFlags.map((flag) => (
            <div
              key={flag.id}
              className={`p-5 border-l-4 ${
                flag.severity === 'high'
                  ? 'bg-red-50 border-brand-danger'
                  : 'bg-amber-50 border-brand-warn'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-body font-semibold text-brand-ink">{flag.label}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono uppercase
                  ${flag.severity === 'high' ? 'bg-brand-danger text-white' : 'bg-brand-warn text-white'}`}>
                  {flag.severity}
                </span>
              </div>
              <p className="font-body text-sm text-brand-ink leading-relaxed">{flag.description}</p>
            </div>
          ))}
        </div>
      )}
      <div className="bg-white border-l-4 border-brand-gold p-6">
        <h3 className="font-heading text-lg text-brand-ink mb-3">Context</h3>
        <p className="font-body text-sm text-brand-ink leading-relaxed">{narrative.redFlagContext}</p>
      </div>
    </div>
  )
}
