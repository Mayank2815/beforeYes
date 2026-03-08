// AI Narrative Generator — Google Gemini
// TODO: Original Anthropic implementation is preserved below as comments.
// To switch back, swap the import and generateNarrative function.

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ScoreResult, AINarrative } from '@/types'

// ──────────────────────────────────────────────────────────
// Original Anthropic implementation (commented out)
// ──────────────────────────────────────────────────────────
// import Anthropic from '@anthropic-ai/sdk'
//
// const client = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY!,
// })
// ──────────────────────────────────────────────────────────

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPT = `You are a structured data interpreter for a compatibility assessment tool.
Your ONLY role is to translate numerical scores and patterns into human-readable context.

STRICT RULES — NEVER VIOLATE:
1. NEVER predict relationship outcomes.
2. NEVER make guarantees about compatibility.
3. NEVER use language like "you will", "this means you should", "this relationship will succeed/fail".
4. NEVER give therapeutic advice or recommendations.
5. NEVER mention specific numbers from the input in your output.
6. ALWAYS frame output as "indicators suggest" or "patterns reflect".
7. ALWAYS use neutral, respectful, non-judgmental language.
8. ALWAYS frame insights as starting points for discussion.
9. Output ONLY valid JSON matching the AINarrative interface.
10. Partners are always "Partner A" and "Partner B" — never invent names.`

function getScoreLevel(score: number): string {
  if (score >= 80) return 'strong'
  if (score >= 65) return 'good'
  if (score >= 50) return 'moderate'
  if (score >= 35) return 'needs-attention'
  return 'significant-gaps'
}

export async function generateNarrative(scores: ScoreResult): Promise<AINarrative> {
  const userPrompt = `Analyze this compatibility assessment data and return a JSON object with the structure:
{ "summary", "emotionalInsights", "financialInsights", "foundationalInsights", "redFlagContext", "discussionQuestions" (array of exactly 15 strings), "disclaimer" }

Input data:
- Overall Score Level: ${getScoreLevel(scores.overall)}
- Emotional Score Level: ${getScoreLevel(scores.emotional)} | Breakdown: coreValues=${getScoreLevel(scores.sectionBreakdown.emotional.coreValues)}, conflictStyle=${getScoreLevel(scores.sectionBreakdown.emotional.conflictStyle)}, emotionalStability=${getScoreLevel(scores.sectionBreakdown.emotional.emotionalStability)}, lifestyleVision=${getScoreLevel(scores.sectionBreakdown.emotional.lifestyleVision)}
- Financial Score Level: ${getScoreLevel(scores.financial)} | Breakdown: dti=${getScoreLevel(scores.sectionBreakdown.financial.dtiScore)}, incomeBalance=${getScoreLevel(scores.sectionBreakdown.financial.incomeBalanceScore)}, savingsBuffer=${getScoreLevel(scores.sectionBreakdown.financial.savingsBufferScore)}, spendingCompat=${getScoreLevel(scores.sectionBreakdown.financial.spendingCompatScore)}, riskCompat=${getScoreLevel(scores.sectionBreakdown.financial.riskCompatScore)}, stressSim=${getScoreLevel(scores.sectionBreakdown.financial.stressSimScore)}
- Foundational Score Level: ${getScoreLevel(scores.foundational)}
- Active Risk Flags: ${scores.riskFlags.map((f) => `${f.id}(${f.severity})`).join(', ') || 'none'}
- Engagement Index Level: ${getScoreLevel(scores.engagementIndex)}

Do not reference specific numbers. Interpret patterns only.
Each insight section: 80–120 words.
Discussion questions: practical, open-ended, non-leading.
Disclaimer: one paragraph, standard clinical-style disclaimer.

Return ONLY valid JSON. No markdown, no preamble.`

  // ──────────────────────────────────────────────────────────
  // Original Anthropic call (commented out)
  // ──────────────────────────────────────────────────────────
  // const response = await client.messages.create({
  //   model: 'claude-sonnet-4-6',
  //   max_tokens: 2000,
  //   temperature: 0,
  //   system: SYSTEM_PROMPT,
  //   messages: [{ role: 'user', content: userPrompt }],
  // })
  //
  // const text = response.content[0].type === 'text' ? response.content[0].text : ''
  // ──────────────────────────────────────────────────────────

  // Gemini implementation — uses flash-lite model (separate quota from flash)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 2000,
      responseMimeType: 'application/json',
    },
  })

  let text: string
  try {
    const result = await model.generateContent(userPrompt)
    text = result.response.text()
  } catch (firstErr: unknown) {
    const status = (firstErr as any)?.status ?? (firstErr as any)?.errorDetails?.[0]
    // Retry once after delay on quota errors
    if ((firstErr as any)?.status === 429) {
      console.warn('Gemini 429 – retrying after 45s...')
      await new Promise((r) => setTimeout(r, 45000))
      const result = await model.generateContent(userPrompt)
      text = result.response.text()
    } else {
      throw firstErr
    }
  }

  const cleaned = text.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(cleaned) as AINarrative

  // Validate structure
  if (!parsed.summary || !parsed.emotionalInsights || !parsed.financialInsights) {
    throw new Error('Invalid AI response structure')
  }
  if (!Array.isArray(parsed.discussionQuestions) || parsed.discussionQuestions.length !== 15) {
    throw new Error('AI response must contain exactly 15 discussion questions')
  }

  return parsed
}

export const FALLBACK_NARRATIVE: AINarrative = {
  summary:
    'Your assessment has been recorded and is being processed. The compatibility patterns captured in this assessment reflect a range of dimensions across emotional alignment, financial compatibility, and foundational life choices. A deeper analysis is being prepared.',
  emotionalInsights:
    'Emotional compatibility indicators have been captured across four key dimensions: core values alignment, conflict resolution style, emotional stability patterns, and shared lifestyle vision. These indicators provide a foundation for meaningful conversations about how both partners approach emotional connection and communication.',
  financialInsights:
    'Financial compatibility patterns have been assessed across debt management, income balance, savings resilience, spending philosophies, risk tolerance, and single-income stress scenarios. These patterns reflect how partners may navigate joint financial decision-making over time.',
  foundationalInsights:
    'Foundational compatibility reflects alignment on life-structure dimensions including career orientation, geographic flexibility, family structure preferences, cultural adaptability, family planning timelines, and economic proximity. These are often the most consequential — yet least discussed — dimensions before marriage.',
  redFlagContext:
    'Any identified risk indicators represent patterns worth exploring in conversation — not predictions of outcomes. Each indicator is an invitation to discuss, understand, and proactively align on important life dimensions.',
  discussionQuestions: [
    'How do we each define financial security, and how does that shape our daily decisions?',
    'When we disagree, what does resolution look like for each of us?',
    'How do we each handle stress — and how do we want to support each other through it?',
    'What does an ideal week look like for each of us, five years from now?',
    'How do we imagine dividing household and financial responsibilities?',
    'What role does extended family play in our individual lives, and how do we want that to look together?',
    'How do we each feel about geographic mobility — could either of us relocate for work?',
    'What are our individual financial goals, and how do they align?',
    'How do we each approach risk — in finances, in career, in life decisions?',
    'What traditions or cultural practices are non-negotiable for each of us?',
    'How do we each envision the role of ambition and career in our future together?',
    'What does emotional support look like when one of us is struggling?',
    'How do we want to handle disagreements about money?',
    'What does our social life look like — and how does each of us recharge?',
    'If we were to face a major financial setback, what would we each need from the other?',
  ],
  disclaimer:
    'This report is generated by an automated compatibility assessment tool for informational and reflective purposes only. It does not constitute professional advice of any kind, including but not limited to psychological, financial, legal, or relationship counseling. Scores and indicators are based on self-reported data and deterministic algorithms; they do not predict relationship success or failure. All insights should be treated as starting points for discussion, not conclusions. For guidance on significant life decisions, we encourage consulting qualified professionals.',
}
