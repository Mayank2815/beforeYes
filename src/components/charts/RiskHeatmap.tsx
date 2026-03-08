'use client'
import type { RiskFlag } from '@/types'

const ALL_RISK_IDS = [
  { id: 'HIGH_DTI', label: 'High Debt Load', category: 'financial' as const },
  { id: 'INCOME_IMBALANCE', label: 'Income Disparity', category: 'financial' as const },
  { id: 'LOW_SAVINGS', label: 'Low Savings Buffer', category: 'financial' as const },
  { id: 'EMOTIONAL_AVOIDANCE', label: 'Emotional Avoidance', category: 'emotional' as const },
  { id: 'CONFLICT_ESCALATION', label: 'Conflict Style Mismatch', category: 'emotional' as const },
  { id: 'SPENDING_EXTREMES', label: 'Spending Philosophy Gap', category: 'financial' as const },
]

interface RiskHeatmapProps {
  riskFlags: RiskFlag[]
}

export function RiskHeatmap({ riskFlags }: RiskHeatmapProps) {
  const flagMap = new Map(riskFlags.map((f) => [f.id, f]))

  return (
    <div className="grid grid-cols-3 gap-3">
      {ALL_RISK_IDS.map((item) => {
        const flag = flagMap.get(item.id)
        const severity = flag?.severity
        const bgClass = !flag
          ? 'bg-brand-cream border-brand-cream'
          : severity === 'high'
            ? 'bg-red-50 border-brand-danger'
            : 'bg-amber-50 border-brand-warn'
        const dotClass = !flag
          ? 'bg-brand-muted/30'
          : severity === 'high'
            ? 'bg-brand-danger'
            : 'bg-brand-warn'
        const textClass = !flag ? 'text-brand-muted' : severity === 'high' ? 'text-brand-danger' : 'text-brand-warn'

        return (
          <div key={item.id} className={`p-3 border rounded-sm ${bgClass}`}>
            <div className={`w-2 h-2 rounded-full mb-2 ${dotClass}`} />
            <div className="font-body text-xs font-medium text-brand-ink leading-tight mb-1">
              {item.label}
            </div>
            <div className={`font-body text-xs ${textClass}`}>
              {flag ? flag.severity.toUpperCase() : 'OK'}
            </div>
          </div>
        )
      })}
    </div>
  )
}
