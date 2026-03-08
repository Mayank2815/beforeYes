import type { Timestamp } from 'firebase-admin/firestore'

export interface PartnerAData {
  personal: {
    name: string
    age: number
    city: string
    careerType: 'stable' | 'growth' | 'entrepreneurial' | 'flexible'
    locationFlexibility: 1 | 2 | 3 | 4 | 5
    familyStructure: 'nuclear' | 'joint' | 'flexible'
    culturalFlexibility: 1 | 2 | 3 | 4 | 5
    kidsTimeline: 'within2' | '2to5' | 'after5' | 'undecided' | 'no'
  }
  financial: {
    monthlyIncome: number
    savings: number
    loanAmount: number
    monthlyEMI: number
    spendingStyle: 1 | 2 | 3 | 4 | 5
    riskAppetite: 1 | 2 | 3 | 4 | 5
  }
  values: {
    answers: number[] // length 20, Likert 1–5
  }
}

export interface PartnerBData {
  name: string
  emotionalAnswers: number[] // 20 answers, Likert 1–5
  financialAnswers: {
    monthlyIncome: number
    savings: number
    loanAmount: number
    monthlyEMI: number
    spendingStyle: 1 | 2 | 3 | 4 | 5
    riskAppetite: 1 | 2 | 3 | 4 | 5
  }
}

export interface ScoreResult {
  foundational: number
  emotional: number
  financial: number
  overall: number
  sectionBreakdown: {
    emotional: {
      coreValues: number
      conflictStyle: number
      emotionalStability: number
      lifestyleVision: number
    }
    financial: {
      dtiScore: number
      incomeBalanceScore: number
      savingsBufferScore: number
      spendingCompatScore: number
      riskCompatScore: number
      stressSimScore: number
    }
    foundational: {
      careerAlignment: number
      locationFlexibility: number
      familyStructure: number
      culturalFlexibility: number
      kidsTimeline: number
      incomeBracket: number
    }
  }
  riskFlags: RiskFlag[]
  engagementIndex: number
}

export interface RiskFlag {
  id: string
  category: 'financial' | 'emotional' | 'foundational'
  severity: 'low' | 'moderate' | 'high'
  label: string
  description: string
}

export interface Session {
  sessionId: string
  createdAt: Timestamp
  expiresAt: Timestamp
  partnerAData: PartnerAData
  partnerBData?: PartnerBData
  scores?: ScoreResult
  paymentStatus: 'pending' | 'paid'
  paymentOrderId?: string
  paymentId?: string
  aiNarrative?: AINarrative
  pdfUrl?: string
  status: 'waiting_b' | 'scoring' | 'preview' | 'paid' | 'complete'
}

export interface AINarrative {
  summary: string
  emotionalInsights: string
  financialInsights: string
  foundationalInsights: string
  redFlagContext: string
  discussionQuestions: string[] // exactly 15
  disclaimer: string
}

// Client-safe session (no Firebase Timestamp)
export interface ClientSession {
  sessionId: string
  createdAt: string
  expiresAt: string
  partnerAData: PartnerAData
  partnerBData?: PartnerBData
  scores?: ScoreResult
  paymentStatus: 'pending' | 'paid'
  paymentOrderId?: string
  paymentId?: string
  aiNarrative?: AINarrative
  pdfUrl?: string | null
  status: 'waiting_b' | 'scoring' | 'preview' | 'paid' | 'complete'
}

export interface CreateSessionResponse {
  sessionId: string
  quizUrl: string
}

export interface CreateOrderResponse {
  orderId: string
  amount: number
  currency: string
  keyId: string
}

export interface VerifyPaymentRequest {
  sessionId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface ReportResponse {
  ready: boolean
  session?: ClientSession
}
