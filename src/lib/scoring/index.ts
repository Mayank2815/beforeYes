import type { PartnerAData, PartnerBData, ScoreResult } from '@/types'
import { calculateEmotional } from './emotional'
import { calculateFoundational } from './foundational'
import { calculateFinancial } from './financial'
import { detectRedFlags } from './redflags'

function stdDev(arr: number[]): number {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length
  return Math.sqrt(variance)
}

function calculateEngagementIndex(
  partnerA: PartnerAData,
  partnerB: PartnerBData
): number {
  let penalty = 0
  const aStdDev = stdDev(partnerA.values.answers)
  const bStdDev = stdDev(partnerB.emotionalAnswers)
  if (aStdDev < 0.5) penalty += 20
  if (bStdDev < 0.5) penalty += 20
  return Math.max(0, 100 - penalty)
}

export function calculateScores(
  partnerA: PartnerAData,
  partnerB: PartnerBData
): ScoreResult {
  const emotionalBreakdown = calculateEmotional(partnerA, partnerB)
  const foundationalBreakdown = calculateFoundational(partnerA, partnerB)
  const financialBreakdown = calculateFinancial(partnerA, partnerB)

  const riskFlags = detectRedFlags(partnerA, partnerB, {
    avgDTI: financialBreakdown.avgDTI,
    incomeRatio: financialBreakdown.incomeRatio,
    bufferMonths: financialBreakdown.bufferMonths,
    totalEMI: financialBreakdown.totalEMI,
    combinedIncome: financialBreakdown.combinedIncome,
  })

  const engagementIndex = calculateEngagementIndex(partnerA, partnerB)

  const overall = Math.round(
    foundationalBreakdown.overall * 0.35 +
    emotionalBreakdown.overall * 0.35 +
    financialBreakdown.overall * 0.30
  )

  return {
    foundational: foundationalBreakdown.overall,
    emotional: emotionalBreakdown.overall,
    financial: financialBreakdown.overall,
    overall,
    sectionBreakdown: {
      emotional: {
        coreValues: emotionalBreakdown.coreValues,
        conflictStyle: emotionalBreakdown.conflictStyle,
        emotionalStability: emotionalBreakdown.emotionalStability,
        lifestyleVision: emotionalBreakdown.lifestyleVision,
      },
      financial: {
        dtiScore: financialBreakdown.dtiScore,
        incomeBalanceScore: financialBreakdown.incomeBalanceScore,
        savingsBufferScore: financialBreakdown.savingsBufferScore,
        spendingCompatScore: financialBreakdown.spendingCompatScore,
        riskCompatScore: financialBreakdown.riskCompatScore,
        stressSimScore: financialBreakdown.stressSimScore,
      },
      foundational: {
        careerAlignment: foundationalBreakdown.careerAlignment,
        locationFlexibility: foundationalBreakdown.locationFlexibility,
        familyStructure: foundationalBreakdown.familyStructure,
        culturalFlexibility: foundationalBreakdown.culturalFlexibility,
        kidsTimeline: foundationalBreakdown.kidsTimeline,
        incomeBracket: foundationalBreakdown.incomeBracket,
      },
    },
    riskFlags,
    engagementIndex,
  }
}
