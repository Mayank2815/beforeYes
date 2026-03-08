'use client'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { partnerASchema, PartnerAInput } from '@/lib/validation'
import { QUIZ_QUESTIONS, LIKERT_LABELS } from '@/lib/quiz-questions'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { motion, AnimatePresence } from 'framer-motion'

type Step = 1 | 2 | '3a' | '3b'

const inputClass = `
  w-full border border-brand-cream bg-white px-4 py-3 font-body text-brand-ink
  focus:outline-none focus:border-brand-gold transition-colors
  placeholder:text-brand-muted/50
`

const labelClass = 'block font-body text-sm text-brand-muted mb-1.5'
const errorClass = 'text-brand-danger text-xs mt-1 font-body'

const CAREER_OPTIONS = [
  { value: 'stable', label: 'Stable (Government / Large Corp)' },
  { value: 'growth', label: 'Growth (Startup / Fast-paced)' },
  { value: 'entrepreneurial', label: 'Entrepreneurial (Self-employed / Founder)' },
  { value: 'flexible', label: 'Flexible (Freelance / Portfolio)' },
]

const FAMILY_OPTIONS = [
  { value: 'nuclear', label: 'Nuclear (Just us + kids)' },
  { value: 'joint', label: 'Joint (Live with / near extended family)' },
  { value: 'flexible', label: 'Flexible / Open' },
]

const KIDS_OPTIONS = [
  { value: 'within2', label: 'Within 2 years' },
  { value: '2to5', label: '2–5 years from now' },
  { value: 'after5', label: 'After 5 years' },
  { value: 'undecided', label: 'Undecided' },
  { value: 'no', label: "Don't want children" },
]

function LikertField({
  label,
  value,
  onChange,
  error,
}: {
  label: string
  value: number | undefined
  onChange: (v: number) => void
  error?: string
}) {
  return (
    <div className="mb-6">
      <p className="font-body text-sm text-brand-ink mb-3">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`flex-1 min-w-[48px] py-2.5 border font-body text-sm transition-all ${value === v
              ? 'border-brand-gold bg-amber-50 text-brand-ink'
              : 'border-brand-cream bg-white text-brand-muted hover:border-brand-muted'
              }`}
          >
            <div className="text-xs text-brand-gold mb-0.5">{v}</div>
            <div className="text-xs leading-tight">{LIKERT_LABELS[v].split(' ')[0]}</div>
          </button>
        ))}
      </div>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  )
}

export function PartnerAForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors },
    getValues,
  } = useForm<PartnerAInput>({
    resolver: zodResolver(partnerASchema),
    defaultValues: {
      values: { answers: Array(20).fill(3) },
    },
  })

  const stepFields: Record<Step, (keyof PartnerAInput)[]> = {
    1: ['personal'],
    2: ['financial'],
    '3a': ['values'],
    '3b': ['values'],
  }

  const totalSteps = 4
  const stepNumMap: Record<Step, number> = { 1: 1, 2: 2, '3a': 3, '3b': 4 }
  const stepNum = stepNumMap[step as Step]

  async function nextStep() {
    if (loading) return
    let fieldsToTrigger = stepFields[step as Step]

    // For values step, only trigger the current page's answers
    if (step === '3a') {
      fieldsToTrigger = Array.from({ length: 10 }, (_, i) => `values.answers.${i}` as any)
    }

    const valid = await trigger(fieldsToTrigger)
    if (valid) {
      if (step === 1) setStep(2)
      else if (step === 2) setStep('3a')
      else if (step === '3a') setStep('3b')
    }
  }

  async function onSubmit(data: PartnerAInput) {
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/session', { partnerAData: data })
      router.push(`/session/${res.data.sessionId}`)
    } catch (err: unknown) {
      const error = err as any
      setError(error.response?.data?.error ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xl mx-auto">
      <div className="mb-8">
        <ProgressBar current={stepNum} total={totalSteps} label="Your Profile" />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <h2 className="font-heading text-2xl text-brand-ink mb-8">Personal & Life Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Your Name</label>
                <input {...register('personal.name')} className={inputClass} placeholder="First name" />
                {errors.personal?.name && <p className={errorClass}>{errors.personal.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Age</label>
                  <input type="number" {...register('personal.age', { valueAsNumber: true })} className={inputClass} />
                  {errors.personal?.age && <p className={errorClass}>{errors.personal.age.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input {...register('personal.city')} className={inputClass} placeholder="Current city" />
                  {errors.personal?.city && <p className={errorClass}>{errors.personal.city.message}</p>}
                </div>
              </div>
              <div>
                <label className={labelClass}>Career Type</label>
                <Controller
                  name="personal.careerType"
                  control={control}
                  render={({ field }) => (
                    <select {...field} className={inputClass}>
                      <option value="">Select career type</option>
                      {CAREER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )}
                />
                {errors.personal?.careerType && <p className={errorClass}>{errors.personal.careerType.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Family Structure Preference</label>
                <Controller
                  name="personal.familyStructure"
                  control={control}
                  render={({ field }) => (
                    <select {...field} className={inputClass}>
                      <option value="">Select preference</option>
                      {FAMILY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )}
                />
                {errors.personal?.familyStructure && <p className={errorClass}>{errors.personal.familyStructure.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Children Timeline</label>
                <Controller
                  name="personal.kidsTimeline"
                  control={control}
                  render={({ field }) => (
                    <select {...field} className={inputClass}>
                      <option value="">Select timeline</option>
                      {KIDS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )}
                />
                {errors.personal?.kidsTimeline && <p className={errorClass}>{errors.personal.kidsTimeline.message}</p>}
              </div>
              <Controller
                name="personal.locationFlexibility"
                control={control}
                render={({ field }) => (
                  <LikertField
                    label="How open are you to relocating for career or family? (1=Not at all, 5=Fully flexible)"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.personal?.locationFlexibility?.message}
                  />
                )}
              />
              <Controller
                name="personal.culturalFlexibility"
                control={control}
                render={({ field }) => (
                  <LikertField
                    label="How open are you to different cultural backgrounds or practices? (1=Not at all, 5=Very open)"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.personal?.culturalFlexibility?.message}
                  />
                )}
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <h2 className="font-heading text-2xl text-brand-ink mb-8">Financial Profile</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Monthly Income (₹)</label>
                  <input type="number" {...register('financial.monthlyIncome', { valueAsNumber: true })} className={inputClass} placeholder="e.g. 80000" />
                  {errors.financial?.monthlyIncome && <p className={errorClass}>{errors.financial.monthlyIncome.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Total Savings (₹)</label>
                  <input type="number" {...register('financial.savings', { valueAsNumber: true })} className={inputClass} placeholder="e.g. 500000" />
                  {errors.financial?.savings && <p className={errorClass}>{errors.financial.savings.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Total Loan Amount (₹)</label>
                  <input type="number" {...register('financial.loanAmount', { valueAsNumber: true })} className={inputClass} placeholder="e.g. 1000000" />
                  {errors.financial?.loanAmount && <p className={errorClass}>{errors.financial.loanAmount.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Monthly EMI (₹)</label>
                  <input type="number" {...register('financial.monthlyEMI', { valueAsNumber: true })} className={inputClass} placeholder="e.g. 15000" />
                  {errors.financial?.monthlyEMI && <p className={errorClass}>{errors.financial.monthlyEMI.message}</p>}
                </div>
              </div>
              <Controller
                name="financial.spendingStyle"
                control={control}
                render={({ field }) => (
                  <LikertField
                    label="Spending Style: 1 = Extreme saver, 5 = Free spender"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.financial?.spendingStyle?.message}
                  />
                )}
              />
              <Controller
                name="financial.riskAppetite"
                control={control}
                render={({ field }) => (
                  <LikertField
                    label="Risk Appetite: 1 = Avoid all risk, 5 = High risk tolerance"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.financial?.riskAppetite?.message}
                  />
                )}
              />
            </div>
          </motion.div>
        )}

        {step === '3a' && (
          <motion.div key="step3a" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <h2 className="font-heading text-2xl text-brand-ink mb-2">Your Values — Part 1</h2>
            <p className="font-body text-sm text-brand-muted mb-8">Questions 1–10. Your partner will answer all 20 questions too.</p>
            {QUIZ_QUESTIONS.slice(0, 10).map((q, i) => (
              <Controller
                key={q.id}
                name={`values.answers.${i}` as any}
                control={control}
                render={({ field }) => (
                  <LikertField
                    label={`${q.id}. ${q.text}`}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            ))}
          </motion.div>
        )}

        {step === '3b' && (
          <motion.div key="step3b" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <h2 className="font-heading text-2xl text-brand-ink mb-2">Your Values — Part 2</h2>
            <p className="font-body text-sm text-brand-muted mb-8">Questions 11–20.</p>
            {QUIZ_QUESTIONS.slice(10, 20).map((q, i) => (
              <Controller
                key={q.id}
                name={`values.answers.${10 + i}` as any}
                control={control}
                render={({ field }) => (
                  <LikertField
                    label={`${q.id}. ${q.text}`}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-brand-danger text-brand-danger text-sm font-body">
          {error}
        </div>
      )}

      <div className="flex justify-between mt-10">
        {step !== 1 && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (step === '3b') setStep('3a')
              else if (step === '3a') setStep(2)
              else if (step === 2) setStep(1)
            }}
          >
            ← Back
          </Button>
        )}
        <div className={step === 1 ? 'ml-auto' : ''}>
          {step !== '3b' ? (
            <Button key="next-btn" type="button" onClick={nextStep}>Continue →</Button>
          ) : (
            <Button key="submit-btn" type="button" loading={loading} onClick={handleSubmit(onSubmit)}>Create Assessment →</Button>
          )}
        </div>
      </div>
    </form>
  )
}
