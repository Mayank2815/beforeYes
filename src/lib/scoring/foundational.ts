import type { PartnerAData, PartnerBData } from '@/types'

export interface FoundationalBreakdown {
  careerAlignment: number
  locationFlexibility: number
  familyStructure: number
  culturalFlexibility: number
  kidsTimeline: number
  incomeBracket: number
  overall: number
}

function careerAlignmentScore(
  aCareer: PartnerAData['personal']['careerType'],
  bCareer: PartnerBData['name'] // we derive B's career from emotional context — but spec says use A's data
  // NOTE: PartnerB doesn't have careerType in spec; we use A's score as proxy
): number {
  // Per spec: careerAlignment uses both A's data
  // Since Partner B doesn't have a careerType field, we default to 75 (partial alignment)
  return 75
}

function careerAlignmentScoreAA(
  aCareer: PartnerAData['personal']['careerType']
): number {
  // When both careers are the same type (only A is known), score 75 as best estimate
  // In a full implementation, B would provide careerType too
  switch (aCareer) {
    case 'stable': return 80
    case 'growth': return 80
    case 'entrepreneurial': return 70
    case 'flexible': return 90
    default: return 75
  }
}

function familyStructureScore(
  aFamily: 'nuclear' | 'joint' | 'flexible',
  // B doesn't have this field per spec — use A's flexibility as proxy
): number {
  if (aFamily === 'flexible') return 70
  if (aFamily === 'nuclear') return 75
  return 70
}

function kidsTimelineScore(
  aKids: PartnerAData['personal']['kidsTimeline']
): number {
  // B doesn't provide kidsTimeline per spec — return neutral score
  if (aKids === 'no') return 60
  if (aKids === 'undecided') return 65
  return 80
}

function incomeBracketScore(incomeA: number, incomeB: number): number {
  const ratio = Math.min(incomeA, incomeB) / Math.max(incomeA, incomeB)
  if (ratio >= 0.75) return 100
  if (ratio >= 0.5) return 75
  if (ratio >= 0.3) return 50
  return 25
}

export function calculateFoundational(
  partnerA: PartnerAData,
  partnerB: PartnerBData
): FoundationalBreakdown {
  const careerAlignment = careerAlignmentScoreAA(partnerA.personal.careerType)
  const locationFlexibility = partnerA.personal.locationFlexibility * 20
  const familyStructure = familyStructureScore(partnerA.personal.familyStructure)
  const culturalFlexibility = partnerA.personal.culturalFlexibility * 20
  const kidsTimeline = kidsTimelineScore(partnerA.personal.kidsTimeline)
  const incomeBracket = incomeBracketScore(
    partnerA.financial.monthlyIncome,
    partnerB.financialAnswers.monthlyIncome
  )

  const overall =
    careerAlignment * 0.2 +
    locationFlexibility * 0.15 +
    familyStructure * 0.2 +
    culturalFlexibility * 0.15 +
    kidsTimeline * 0.2 +
    incomeBracket * 0.1

  return {
    careerAlignment: Math.round(careerAlignment),
    locationFlexibility: Math.round(locationFlexibility),
    familyStructure: Math.round(familyStructure),
    culturalFlexibility: Math.round(culturalFlexibility),
    kidsTimeline: Math.round(kidsTimeline),
    incomeBracket: Math.round(incomeBracket),
    overall: Math.round(overall),
  }
}
