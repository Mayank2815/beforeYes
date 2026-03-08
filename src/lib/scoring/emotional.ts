import type { PartnerAData, PartnerBData } from '@/types'

function likertDiff(a: number, b: number): number {
  const diff = Math.abs(a - b)
  if (diff === 0) return 5
  if (diff === 1) return 4
  if (diff === 2) return 3
  if (diff === 3) return 1
  return 0 // diff >= 4
}

function sectionScore(aAnswers: number[], bAnswers: number[], indices: number[]): number {
  const rawScores = indices.map((i) => likertDiff(aAnswers[i], bAnswers[i]))
  const avg = rawScores.reduce((sum, s) => sum + s, 0) / rawScores.length
  return (avg / 5) * 100 // normalize to 0–100
}

export interface EmotionalBreakdown {
  coreValues: number
  conflictStyle: number
  emotionalStability: number
  lifestyleVision: number
  overall: number
}

export function calculateEmotional(
  partnerA: PartnerAData,
  partnerB: PartnerBData
): EmotionalBreakdown {
  const aAnswers = partnerA.values.answers
  const bAnswers = partnerB.emotionalAnswers

  const coreValues = sectionScore(aAnswers, bAnswers, [0, 1, 2, 3, 4, 5])
  const conflictStyle = sectionScore(aAnswers, bAnswers, [6, 7, 8, 9, 10, 11])
  const emotionalStability = sectionScore(aAnswers, bAnswers, [12, 13, 14, 15])
  const lifestyleVision = sectionScore(aAnswers, bAnswers, [16, 17, 18, 19])

  const overall =
    coreValues * 0.3 +
    conflictStyle * 0.3 +
    emotionalStability * 0.2 +
    lifestyleVision * 0.2

  return {
    coreValues: Math.round(coreValues),
    conflictStyle: Math.round(conflictStyle),
    emotionalStability: Math.round(emotionalStability),
    lifestyleVision: Math.round(lifestyleVision),
    overall: Math.round(overall),
  }
}
