export interface QuizQuestion {
  id: number
  text: string
  section: 'coreValues' | 'conflictStyle' | 'emotionalStability' | 'lifestyleVision'
  weight: number
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // CORE VALUES (Q1–Q6, 30% weight)
  {
    id: 1,
    text: 'Religion and spirituality play an important role in my daily life.',
    section: 'coreValues',
    weight: 0.30,
  },
  {
    id: 2,
    text: 'I believe in clearly defined gender roles within a marriage.',
    section: 'coreValues',
    weight: 0.30,
  },
  {
    id: 3,
    text: 'Honesty, even when painful, is non-negotiable for me.',
    section: 'coreValues',
    weight: 0.30,
  },
  {
    id: 4,
    text: 'I value personal ambition over family time.',
    section: 'coreValues',
    weight: 0.30,
  },
  {
    id: 5,
    text: 'I expect my partner to share household responsibilities equally.',
    section: 'coreValues',
    weight: 0.30,
  },
  {
    id: 6,
    text: 'Maintaining family traditions is very important to me.',
    section: 'coreValues',
    weight: 0.30,
  },
  // CONFLICT STYLE (Q7–Q12, 30% weight)
  {
    id: 7,
    text: "When I'm upset, I prefer to talk about it immediately.",
    section: 'conflictStyle',
    weight: 0.30,
  },
  {
    id: 8,
    text: 'I tend to go silent or withdraw when there is a conflict.',
    section: 'conflictStyle',
    weight: 0.30,
  },
  {
    id: 9,
    text: 'I believe arguments should be resolved before sleeping.',
    section: 'conflictStyle',
    weight: 0.30,
  },
  {
    id: 10,
    text: "I find it easy to apologize, even when I think I'm right.",
    section: 'conflictStyle',
    weight: 0.30,
  },
  {
    id: 11,
    text: 'I expect my partner to never bring up past conflicts.',
    section: 'conflictStyle',
    weight: 0.30,
  },
  {
    id: 12,
    text: 'I prefer written communication (text/email) over verbal discussion for serious matters.',
    section: 'conflictStyle',
    weight: 0.30,
  },
  // EMOTIONAL STABILITY (Q13–Q16, 20% weight)
  {
    id: 13,
    text: 'I feel comfortable expressing vulnerability to a partner.',
    section: 'emotionalStability',
    weight: 0.20,
  },
  {
    id: 14,
    text: 'I need significant alone time to recharge emotionally.',
    section: 'emotionalStability',
    weight: 0.20,
  },
  {
    id: 15,
    text: 'I sometimes feel overwhelmed by my own emotions.',
    section: 'emotionalStability',
    weight: 0.20,
  },
  {
    id: 16,
    text: 'I have a strong support system outside of my romantic relationship.',
    section: 'emotionalStability',
    weight: 0.20,
  },
  // LIFESTYLE VISION (Q17–Q20, 20% weight)
  {
    id: 17,
    text: 'I see myself living in a metropolitan city long-term.',
    section: 'lifestyleVision',
    weight: 0.20,
  },
  {
    id: 18,
    text: 'Traveling internationally at least once a year is important to me.',
    section: 'lifestyleVision',
    weight: 0.20,
  },
  {
    id: 19,
    text: 'I want a large social life with frequent gatherings.',
    section: 'lifestyleVision',
    weight: 0.20,
  },
  {
    id: 20,
    text: 'My career will always be my top priority, even after marriage.',
    section: 'lifestyleVision',
    weight: 0.20,
  },
]

export const SECTION_LABELS = {
  coreValues: 'Core Values',
  conflictStyle: 'Conflict Style',
  emotionalStability: 'Emotional Stability',
  lifestyleVision: 'Lifestyle Vision',
}

export const LIKERT_LABELS = [
  '',
  'Strongly Disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly Agree',
]
