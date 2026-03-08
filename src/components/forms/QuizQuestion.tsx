'use client'
import { motion } from 'framer-motion'
import { LIKERT_LABELS } from '@/lib/quiz-questions'

interface QuizQuestionProps {
  questionNumber: number
  totalQuestions: number
  questionText: string
  selectedValue: number | null
  onSelect: (value: number) => void
}

export function QuizQuestion({
  questionNumber,
  totalQuestions,
  questionText,
  selectedValue,
  onSelect,
}: QuizQuestionProps) {
  return (
    <motion.div
      key={questionNumber}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="mb-2 font-body text-sm text-brand-muted">
        {questionNumber} of {totalQuestions}
      </div>
      <div className="w-full bg-brand-cream h-0.5 mb-10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand-gold rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <h2 className="font-heading text-2xl text-brand-ink leading-relaxed mb-12">
        {questionText}
      </h2>
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((value) => (
          <motion.button
            key={value}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(value)}
            className={`
              w-full p-4 text-left font-body text-base border transition-all duration-150
              ${selectedValue === value
                ? 'border-brand-gold bg-amber-50 text-brand-ink'
                : 'border-brand-cream bg-white text-brand-muted hover:border-brand-muted hover:text-brand-ink'
              }
            `}
          >
            <span className="font-mono text-xs text-brand-gold mr-3">{value}</span>
            {LIKERT_LABELS[value]}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
