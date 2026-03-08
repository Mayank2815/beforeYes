import type { PartnerAData, PartnerBData, RiskFlag } from '@/types'

export function detectRedFlags(
  partnerA: PartnerAData,
  partnerB: PartnerBData,
  financials: {
    avgDTI: number
    incomeRatio: number
    bufferMonths: number
    totalEMI: number
    combinedIncome: number
  }
): RiskFlag[] {
  const flags: RiskFlag[] = []

  // 1. HIGH_DTI
  if (financials.avgDTI > 50) {
    flags.push({
      id: 'HIGH_DTI',
      category: 'financial',
      severity: 'high',
      label: 'High Combined Debt Load',
      description:
        'Combined EMI obligations exceed 50% of income. This level of debt exposure can create sustained financial pressure and reduce flexibility in joint decision-making, especially during income disruptions.',
    })
  }

  // 2. INCOME_IMBALANCE
  if (financials.incomeRatio < 0.3) {
    flags.push({
      id: 'INCOME_IMBALANCE',
      category: 'financial',
      severity: 'high',
      label: 'Significant Income Disparity',
      description:
        "One partner earns less than 30% of the other's income. Significant income gaps can influence power dynamics, financial dependency, and long-term planning alignment. Open dialogue around contribution and autonomy is especially important.",
    })
  }

  // 3. LOW_SAVINGS
  if (financials.bufferMonths < 3) {
    flags.push({
      id: 'LOW_SAVINGS',
      category: 'financial',
      severity: 'moderate',
      label: 'Limited Financial Runway',
      description:
        'Combined savings cover less than 3 months of obligations. A thin savings buffer can amplify stress during unexpected events such as job transitions, medical needs, or large unplanned expenses.',
    })
  }

  // 4. EMOTIONAL_AVOIDANCE
  // Q8 = index 7 (withdrawal), Q12 = index 11 (prefers written)
  const aAvoidanceAvg = (partnerA.values.answers[7] + partnerA.values.answers[11]) / 2
  const bAvoidanceAvg = (partnerB.emotionalAnswers[7] + partnerB.emotionalAnswers[11]) / 2
  if (aAvoidanceAvg > 3.5 || bAvoidanceAvg > 3.5) {
    flags.push({
      id: 'EMOTIONAL_AVOIDANCE',
      category: 'emotional',
      severity: 'moderate',
      label: 'Emotional Avoidance Pattern Detected',
      description:
        'Response patterns suggest a tendency to avoid direct verbal communication during conflict. Avoidance-oriented communication styles can lead to unresolved tensions and emotional distance if not addressed with intentional communication practices.',
    })
  }

  // 5. CONFLICT_ESCALATION
  // Q7 = index 6 (talk immediately), Q9 = index 8 (resolve before sleep)
  const q7Diff = Math.abs(partnerA.values.answers[6] - partnerB.emotionalAnswers[6])
  const q9Diff = Math.abs(partnerA.values.answers[8] - partnerB.emotionalAnswers[8])
  if (q7Diff > 2 || q9Diff > 2) {
    flags.push({
      id: 'CONFLICT_ESCALATION',
      category: 'emotional',
      severity: 'moderate',
      label: 'Conflict Resolution Style Mismatch',
      description:
        'Partners show meaningfully different preferences for timing and urgency in resolving conflicts. Mismatched conflict pacing—one partner needing immediate resolution while the other needs space—is a common source of recurring friction.',
    })
  }

  // 6. SPENDING_EXTREMES
  const spendingGap = Math.abs(
    partnerA.financial.spendingStyle - partnerB.financialAnswers.spendingStyle
  )
  if (spendingGap >= 3) {
    flags.push({
      id: 'SPENDING_EXTREMES',
      category: 'financial',
      severity: 'high',
      label: 'Extreme Spending Philosophy Difference',
      description:
        'A gap of 3 or more on spending style often creates chronic friction around day-to-day financial decisions. Divergent attitudes toward spending—from extreme saving to free spending—require explicit agreements to prevent resentment.',
    })
  }

  return flags
}
