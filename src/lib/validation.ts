import { z } from 'zod'

const noHtml = z.string().regex(/^[^<>{}]*$/, 'Invalid characters detected')
const safeName = noHtml.trim().min(1).max(50)

export const partnerASchema = z.object({
  personal: z.object({
    name: safeName,
    age: z.number().int().min(18).max(100),
    city: safeName,
    careerType: z.enum(['stable', 'growth', 'entrepreneurial', 'flexible']),
    locationFlexibility: z.number().int().min(1).max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
    familyStructure: z.enum(['nuclear', 'joint', 'flexible']),
    culturalFlexibility: z.number().int().min(1).max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
    kidsTimeline: z.enum(['within2', '2to5', 'after5', 'undecided', 'no']),
  }),
  financial: z.object({
    monthlyIncome: z.number().min(1000).max(10000000),
    savings: z.number().min(0).max(100000000),
    loanAmount: z.number().min(0).max(100000000),
    monthlyEMI: z.number().min(0),
    spendingStyle: z.number().int().min(1).max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
    riskAppetite: z.number().int().min(1).max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
  }).refine(
    (data) => data.monthlyEMI <= data.monthlyIncome * 0.9,
    { message: 'EMI cannot exceed 90% of income', path: ['monthlyEMI'] }
  ),
  values: z.object({
    answers: z
      .array(z.number().int().min(1).max(5))
      .length(20, 'Exactly 20 answers required'),
  }),
})

export const partnerBSchema = z.object({
  name: safeName,
  emotionalAnswers: z
    .array(z.number().int().min(1).max(5))
    .length(20, 'Exactly 20 answers required'),
  financialAnswers: z.object({
    monthlyIncome: z.number().min(1000).max(10000000),
    savings: z.number().min(0).max(100000000),
    loanAmount: z.number().min(0).max(100000000),
    monthlyEMI: z.number().min(0),
    spendingStyle: z.number().int().min(1).max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
    riskAppetite: z.number().int().min(1).max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
  }).refine(
    (data) => data.monthlyEMI <= data.monthlyIncome * 0.9,
    { message: 'EMI cannot exceed 90% of income', path: ['monthlyEMI'] }
  ),
})

export type PartnerAInput = z.infer<typeof partnerASchema>
export type PartnerBInput = z.infer<typeof partnerBSchema>
