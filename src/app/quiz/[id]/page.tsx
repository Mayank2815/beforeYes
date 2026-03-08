'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { partnerBSchema, PartnerBInput } from '@/lib/validation'
import { QUIZ_QUESTIONS, LIKERT_LABELS } from '@/lib/quiz-questions'
import { QuizQuestion } from '@/components/forms/QuizQuestion'
import { Button } from '@/components/ui/Button'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import Link from 'next/link'

const inputClass = 'w-full border border-brand-cream bg-white px-4 py-3 font-body text-brand-ink focus:outline-none focus:border-brand-gold transition-colors placeholder:text-brand-muted/50'
const labelClass = 'block font-body text-sm text-brand-muted mb-1.5'
const errorClass = 'text-brand-danger text-xs mt-1 font-body'

type Phase = 'intro' | 'financial' | 'quiz' | 'done'

export default function QuizPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<number[]>(Array(20).fill(0))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<PartnerBInput>({
    resolver: zodResolver(partnerBSchema),
    defaultValues: {
      emotionalAnswers: Array(20).fill(3),
      financialAnswers: {
        monthlyIncome: undefined,
        savings: undefined,
        loanAmount: undefined,
        monthlyEMI: undefined,
        spendingStyle: undefined,
        riskAppetite: undefined,
      },
    },
  })

  const [isTransitioning, setIsTransitioning] = useState(false)

  function handleQuizAnswer(value: number) {
    if (isTransitioning) return

    const next = [...answers]
    next[currentQ] = value
    setAnswers(next)

    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentQ((q) => q + 1)
        setIsTransitioning(false)
      }, 300)
    } else {
      setPhase('done')
    }
  }

  async function submitAll(data: PartnerBInput) {
    setLoading(true)
    setError('')
    const finalAnswers = answers.map((a: number, i: number) => (a === 0 ? data.emotionalAnswers[i] ?? 3 : a))
    try {
      await axios.post(`/api/quiz/${id}`, {
        partnerBData: {
          ...data,
          emotionalAnswers: finalAnswers,
        },
      })
      router.push(`/preview/${id}`)
    } catch (err: unknown) {
      const error = err as any
      setError(error.response?.data?.error ?? 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (phase === 'intro') {
    return (
      <main className="min-h-screen bg-brand-paper flex flex-col items-center justify-center px-6 py-12">
        <Link href="/" className="font-heading text-xl text-brand-gold tracking-widest mb-12">BeforeYes</Link>
        <div className="max-w-md text-center">
          <h1 className="font-heading text-3xl text-brand-ink mb-4">Your partner invites you</h1>
          <p className="font-body text-sm text-brand-muted leading-relaxed mb-8">
            This is a private compatibility assessment. You&apos;ll answer 20 questions and provide some financial context.
            Results are only visible after unlocking the report together.
          </p>
          <p className="font-body text-xs text-brand-muted mb-8 bg-brand-cream p-4">
            Takes approximately 8–10 minutes. Your answers are anonymous and session-based.
          </p>
          <Button size="lg" onClick={() => setPhase('financial')}>Begin →</Button>
        </div>
      </main>
    )
  }

  if (phase === 'financial') {
    return (
      <main className="min-h-screen bg-brand-paper py-12 px-4">
        <div className="max-w-lg mx-auto">
          <Link href="/" className="font-heading text-xl text-brand-gold tracking-widest block mb-12">BeforeYes</Link>
          <h2 className="font-heading text-2xl text-brand-ink mb-2">Your Profile</h2>
          <p className="font-body text-sm text-brand-muted mb-8">Financial context helps build an accurate compatibility picture.</p>
          <form>
            <div className="space-y-4 mb-8">
              <div>
                <label className={labelClass}>Your Name</label>
                <input {...register('name')} className={inputClass} placeholder="First name" />
                {errors.name && <p className={errorClass}>{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Monthly Income (₹)</label>
                  <input type="number" {...register('financialAnswers.monthlyIncome', { valueAsNumber: true })} className={inputClass} />
                  {errors.financialAnswers?.monthlyIncome && <p className={errorClass}>{errors.financialAnswers.monthlyIncome.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Total Savings (₹)</label>
                  <input type="number" {...register('financialAnswers.savings', { valueAsNumber: true })} className={inputClass} />
                  {errors.financialAnswers?.savings && <p className={errorClass}>{errors.financialAnswers.savings.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Total Loan Amount (₹)</label>
                  <input type="number" {...register('financialAnswers.loanAmount', { valueAsNumber: true })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Monthly EMI (₹)</label>
                  <input type="number" {...register('financialAnswers.monthlyEMI', { valueAsNumber: true })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Spending Style: 1 = Extreme saver, 5 = Free spender</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(v => (
                    <Controller key={v} name="financialAnswers.spendingStyle" control={control} render={({ field }) => (
                      <button type="button" onClick={() => field.onChange(v)}
                        className={`flex-1 py-2.5 border font-body text-sm transition-all ${field.value === v ? 'border-brand-gold bg-amber-50' : 'border-brand-cream bg-white text-brand-muted'}`}>
                        <div className="text-xs text-brand-gold">{v}</div>
                      </button>
                    )} />
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Risk Appetite: 1 = No risk, 5 = High risk</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(v => (
                    <Controller key={v} name="financialAnswers.riskAppetite" control={control} render={({ field }) => (
                      <button type="button" onClick={() => field.onChange(v)}
                        className={`flex-1 py-2.5 border font-body text-sm transition-all ${field.value === v ? 'border-brand-gold bg-amber-50' : 'border-brand-cream bg-white text-brand-muted'}`}>
                        <div className="text-xs text-brand-gold">{v}</div>
                      </button>
                    )} />
                  ))}
                </div>
              </div>
            </div>
            <Button type="button" onClick={async () => {
              const valid = await trigger(['name', 'financialAnswers'])
              if (valid) setPhase('quiz')
            }}>Continue to Questions →</Button>
          </form>
        </div>
      </main>
    )
  }

  if (phase === 'quiz') {
    return (
      <main className="min-h-screen bg-brand-paper flex flex-col items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          <QuizQuestion
            key={currentQ}
            questionNumber={currentQ + 1}
            totalQuestions={QUIZ_QUESTIONS.length}
            questionText={QUIZ_QUESTIONS[currentQ].text}
            selectedValue={answers[currentQ] || null}
            onSelect={handleQuizAnswer}
          />
        </AnimatePresence>
      </main>
    )
  }

  // Phase: done — review and submit
  return (
    <main className="min-h-screen bg-brand-paper flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        <h2 className="font-heading text-3xl text-brand-ink mb-4">You&apos;re done</h2>
        <p className="font-body text-sm text-brand-muted mb-8">
          Your answers have been recorded. Submit to generate the compatibility assessment.
        </p>
        {error && <p className="text-brand-danger text-sm mb-4 bg-red-50 p-3 border border-brand-danger">{error}</p>}
        <Button size="lg" loading={loading} onClick={handleSubmit(submitAll)}>
          Submit & See Results →
        </Button>
      </div>
    </main>
  )
}
