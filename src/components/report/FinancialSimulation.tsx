'use client'
import { BarChartComponent } from '@/components/charts/BarChart'
import type { ScoreResult, AINarrative } from '@/types'
import { scoreToLabel, scoreToColor } from '@/lib/utils'

interface FinancialSimulationProps {
  scores: ScoreResult
  narrative: AINarrative
  partnerAIncome: number
  partnerBIncome: number
  totalEMI: number
}

export function FinancialSimulation({
  scores,
  narrative,
  partnerAIncome,
  partnerBIncome,
  totalEMI,
}: FinancialSimulationProps) {
  const fb = scores.sectionBreakdown.financial
  const chartData = [
    { name: 'DTI', score: fb.dtiScore },
    { name: 'Income Balance', score: fb.incomeBalanceScore },
    { name: 'Savings Buffer', score: fb.savingsBufferScore },
    { name: 'Spending Compat.', score: fb.spendingCompatScore },
    { name: 'Risk Compat.', score: fb.riskCompatScore },
    { name: '1-Income Stress', score: fb.stressSimScore },
  ]

  const combinedIncome = partnerAIncome + partnerBIncome
  const higherIncome = Math.max(partnerAIncome, partnerBIncome)
  const normalRatio = combinedIncome > 0 ? (totalEMI / combinedIncome * 100).toFixed(0) : 'N/A'
  const stressRatio = higherIncome > 0 ? (totalEMI / higherIncome * 100).toFixed(0) : 'N/A'

  const stressStatus = (ratio: number) =>
    ratio < 30 ? 'Resilient' : ratio < 50 ? 'Manageable' : ratio < 70 ? 'Stressed' : 'High Risk'

  return (
    <div className="space-y-8">
      <BarChartComponent data={chartData} />
      <div className="overflow-x-auto">
        <table className="w-full font-body text-sm">
          <thead>
            <tr className="border-b border-brand-cream">
              <th className="text-left py-2 text-brand-muted font-medium">Scenario</th>
              <th className="text-right py-2 text-brand-muted font-medium">Monthly Obligation</th>
              <th className="text-right py-2 text-brand-muted font-medium">Income Available</th>
              <th className="text-right py-2 text-brand-muted font-medium">Ratio</th>
              <th className="text-right py-2 text-brand-muted font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-brand-cream">
              <td className="py-2 text-brand-ink">Both Incomes</td>
              <td className="py-2 text-right">₹{totalEMI.toLocaleString('en-IN')}</td>
              <td className="py-2 text-right">₹{combinedIncome.toLocaleString('en-IN')}</td>
              <td className="py-2 text-right">{normalRatio}%</td>
              <td className="py-2 text-right font-medium"
                style={{ color: scoreToColor(fb.dtiScore) }}>
                {stressStatus(Number(normalRatio))}
              </td>
            </tr>
            <tr>
              <td className="py-2 text-brand-ink">One Income (higher earner)</td>
              <td className="py-2 text-right">₹{totalEMI.toLocaleString('en-IN')}</td>
              <td className="py-2 text-right">₹{higherIncome.toLocaleString('en-IN')}</td>
              <td className="py-2 text-right">{stressRatio}%</td>
              <td className="py-2 text-right font-medium"
                style={{ color: scoreToColor(fb.stressSimScore) }}>
                {stressStatus(Number(stressRatio))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="bg-white border-l-4 border-brand-gold p-6">
        <h3 className="font-heading text-lg text-brand-ink mb-3">Financial Insights</h3>
        <p className="font-body text-sm text-brand-ink leading-relaxed">{narrative.financialInsights}</p>
      </div>
    </div>
  )
}
