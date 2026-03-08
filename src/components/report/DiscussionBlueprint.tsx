'use client'
import type { AINarrative } from '@/types'

interface DiscussionBlueprintProps {
  narrative: AINarrative
}

export function DiscussionBlueprint({ narrative }: DiscussionBlueprintProps) {
  const groups = [
    { title: 'Financial & Practical', questions: narrative.discussionQuestions.slice(0, 5) },
    { title: 'Emotional & Relational', questions: narrative.discussionQuestions.slice(5, 10) },
    { title: 'Life Vision & Values', questions: narrative.discussionQuestions.slice(10, 15) },
  ]

  return (
    <div className="space-y-8">
      <p className="font-body text-sm text-brand-muted">
        These questions are drawn from your specific compatibility patterns. Use them as conversation starters — not a checklist.
      </p>
      {groups.map((group, gi) => (
        <div key={gi}>
          <h3 className="font-heading text-lg text-brand-gold mb-4">{group.title}</h3>
          <div className="space-y-3">
            {group.questions.map((q, qi) => (
              <div key={qi} className="flex gap-4 p-4 bg-white border border-brand-cream">
                <span className="font-heading text-2xl text-brand-cream leading-none min-w-[28px]">
                  {gi * 5 + qi + 1}
                </span>
                <p className="font-body text-sm text-brand-ink leading-relaxed pt-0.5">{q}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-8 p-5 bg-brand-cream font-body text-xs text-brand-muted leading-relaxed">
        <strong className="text-brand-ink">Disclaimer: </strong>{narrative.disclaimer}
      </div>
    </div>
  )
}
