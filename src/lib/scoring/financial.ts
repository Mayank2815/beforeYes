import type { PartnerAData, PartnerBData } from '@/types'

function likertDiff(a: number, b: number): number {
  const diff = Math.abs(a - b)
  if (diff === 0) return 5
  if (diff === 1) return 4
  if (diff === 2) return 3
  if (diff === 3) return 1
  return 0
}

function dtiScore(emi: number, income: number): number {
  if (income <= 0) return 20
  const dti = (emi / income) * 100
  if (dti < 30) return 100
  if (dti < 40) return 80
  if (dti < 50) return 60
  if (dti < 60) return 40
  return 20
}

export interface FinancialBreakdown {
  dtiScore: number
  incomeBalanceScore: number
  savingsBufferScore: number
  spendingCompatScore: number
  riskCompatScore: number
  stressSimScore: number
  overall: number
  // Raw values for report
  avgDTI: number
  incomeRatio: number
  bufferMonths: number
  stressRatio: number
  combinedIncome: number
  totalEMI: number
}

export function calculateFinancial(
  partnerA: PartnerAData,
  partnerB: PartnerBData
): FinancialBreakdown {
  const incomeA = partnerA.financial.monthlyIncome
  const incomeB = partnerB.financialAnswers.monthlyIncome
  const emiA = partnerA.financial.monthlyEMI
  const emiB = partnerB.financialAnswers.monthlyEMI
  const savingsA = partnerA.financial.savings
  const savingsB = partnerB.financialAnswers.savings
  const totalEMI = emiA + emiB
  const combinedIncome = incomeA + incomeB

  // 1. DTI Score (weight 0.20)
  const dtiA = dtiScore(emiA, incomeA)
  const dtiB = dtiScore(emiB, incomeB)
  const avgDTIValue = ((emiA / incomeA + emiB / incomeB) / 2) * 100
  const dtiScoreVal = Math.round((dtiA + dtiB) / 2)

  // 2. Income Balance (weight 0.15)
  const incomeRatio = Math.min(incomeA, incomeB) / Math.max(incomeA, incomeB)
  let incomeBalanceScore: number
  if (incomeRatio >= 0.75) incomeBalanceScore = 100
  else if (incomeRatio >= 0.5) incomeBalanceScore = 80
  else if (incomeRatio >= 0.3) incomeBalanceScore = 60
  else incomeBalanceScore = 40

  // 3. Savings Buffer (weight 0.20)
  const denominator = totalEMI + 0.5 * combinedIncome
  const bufferMonths = denominator > 0 ? (savingsA + savingsB) / denominator : 0
  let savingsBufferScore: number
  if (bufferMonths >= 12) savingsBufferScore = 100
  else if (bufferMonths >= 6) savingsBufferScore = 80
  else if (bufferMonths >= 3) savingsBufferScore = 60
  else if (bufferMonths >= 1) savingsBufferScore = 40
  else savingsBufferScore = 20

  // 4. Spending Compatibility (weight 0.15)
  const spendingCompatScore = Math.round(
    (likertDiff(partnerA.financial.spendingStyle, partnerB.financialAnswers.spendingStyle) / 5) * 100
  )

  // 5. Risk Compatibility (weight 0.10)
  const riskCompatScore = Math.round(
    (likertDiff(partnerA.financial.riskAppetite, partnerB.financialAnswers.riskAppetite) / 5) * 100
  )

  // 6. One-Income Stress Simulation (weight 0.20)
  const higherIncome = Math.max(incomeA, incomeB)
  const stressRatio = higherIncome > 0 ? (totalEMI / higherIncome) * 100 : 100
  let stressSimScore: number
  if (stressRatio < 30) stressSimScore = 100
  else if (stressRatio < 50) stressSimScore = 70
  else if (stressRatio < 70) stressSimScore = 40
  else stressSimScore = 10

  const overall =
    dtiScoreVal * 0.2 +
    incomeBalanceScore * 0.15 +
    savingsBufferScore * 0.2 +
    spendingCompatScore * 0.15 +
    riskCompatScore * 0.1 +
    stressSimScore * 0.2

  return {
    dtiScore: dtiScoreVal,
    incomeBalanceScore: Math.round(incomeBalanceScore),
    savingsBufferScore: Math.round(savingsBufferScore),
    spendingCompatScore,
    riskCompatScore,
    stressSimScore: Math.round(stressSimScore),
    overall: Math.round(overall),
    avgDTI: Math.round(avgDTIValue),
    incomeRatio: Math.round(incomeRatio * 100) / 100,
    bufferMonths: Math.round(bufferMonths * 10) / 10,
    stressRatio: Math.round(stressRatio),
    combinedIncome,
    totalEMI,
  }
}
