import * as functions from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import Anthropic from '@anthropic-ai/sdk'
import puppeteer from 'puppeteer'
import type { Session, AINarrative, ClientSession } from '../../src/types'
import { buildReportHTML } from './pdf/template'

if (admin.apps.length === 0) {
  admin.initializeApp()
}

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

function getLevel(score: number): string {
  if (score >= 80) return 'strong'
  if (score >= 65) return 'good'
  if (score >= 50) return 'moderate'
  if (score >= 35) return 'needs-attention'
  return 'significant-gaps'
}

const FALLBACK: AINarrative = {
  summary: 'Your compatibility assessment has been processed. The patterns captured reflect dimensions across emotional, financial, and foundational alignment.',
  emotionalInsights: 'Emotional compatibility indicators have been captured. These provide a foundation for meaningful conversations about connection and communication.',
  financialInsights: 'Financial compatibility patterns have been assessed across debt, savings, spending, and resilience dimensions.',
  foundationalInsights: 'Foundational alignment reflects your compatibility on life-structure dimensions including career, location, family, and planning timelines.',
  redFlagContext: 'Any identified risk indicators represent patterns worth exploring in conversation — not predictions of outcomes.',
  discussionQuestions: [
    'How do we each define financial security?',
    'When we disagree, what does resolution look like?',
    'How do we handle stress and how do we want to support each other?',
    'What does an ideal week look like five years from now?',
    'How do we imagine dividing household and financial responsibilities?',
    'What role does extended family play in our lives?',
    'How do we feel about geographic mobility?',
    'What are our individual financial goals?',
    'How do we approach risk in finances and life decisions?',
    'What traditions or cultural practices are non-negotiable?',
    'How do we envision career and ambition in our future together?',
    'What does emotional support look like when one of us is struggling?',
    'How do we want to handle disagreements about money?',
    'What does our social life look like and how does each of us recharge?',
    'If we faced a financial setback, what would we each need from the other?',
  ],
  disclaimer: 'This report is for informational and reflective purposes only. It does not constitute professional advice of any kind. Scores are algorithmic indicators derived from self-reported data.',
}

export const generateReport = functions.onRequest(
  { timeoutSeconds: 300, memory: '2GiB' },
  async (req, res) => {
    const { sessionId } = req.body ?? {}
    if (!sessionId || typeof sessionId !== 'string') {
      res.status(400).json({ error: 'Missing sessionId.' })
      return
    }

    const db = admin.firestore()
    const storage = admin.storage()
    const sessionRef = db.collection('sessions').doc(sessionId)

    try {
      const sessionDoc = await sessionRef.get()
      if (!sessionDoc.exists) {
        res.status(404).json({ error: 'Session not found.' })
        return
      }

      const session = sessionDoc.data() as Session
      if (session.paymentStatus !== 'paid') {
        res.status(403).json({ error: 'Payment required.' })
        return
      }

      if (!session.scores) {
        res.status(400).json({ error: 'Scores not available.' })
        return
      }

      // Generate AI narrative
      let narrative: AINarrative
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
        const eb = session.scores.sectionBreakdown.emotional
        const fb = session.scores.sectionBreakdown.financial

        const prompt = `Analyze this compatibility assessment data and return a JSON object with the structure:
{ "summary", "emotionalInsights", "financialInsights", "foundationalInsights", "redFlagContext", "discussionQuestions" (array of exactly 15 strings), "disclaimer" }

Input data:
- Overall Score Level: ${getLevel(session.scores.overall)}
- Emotional: ${getLevel(session.scores.emotional)} | coreValues=${getLevel(eb.coreValues)}, conflictStyle=${getLevel(eb.conflictStyle)}, stability=${getLevel(eb.emotionalStability)}, vision=${getLevel(eb.lifestyleVision)}
- Financial: ${getLevel(session.scores.financial)} | dti=${getLevel(fb.dtiScore)}, incomeBalance=${getLevel(fb.incomeBalanceScore)}, savings=${getLevel(fb.savingsBufferScore)}, spending=${getLevel(fb.spendingCompatScore)}, risk=${getLevel(fb.riskCompatScore)}, stress=${getLevel(fb.stressSimScore)}
- Foundational: ${getLevel(session.scores.foundational)}
- Risk Flags: ${session.scores.riskFlags.map(f => `${f.id}(${f.severity})`).join(', ') || 'none'}
- Engagement: ${getLevel(session.scores.engagementIndex)}

Do not reference specific numbers. Interpret patterns only.
Each insight section: 80-120 words. Discussion questions: practical, open-ended. Disclaimer: one paragraph.
Return ONLY valid JSON.`

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 2000,
          temperature: 0,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
        })

        const text = response.content[0].type === 'text' ? response.content[0].text : ''
        narrative = JSON.parse(text.replace(/```json|```/g, '').trim()) as AINarrative
      } catch (aiErr) {
        functions.logger.error('AI generation failed:', aiErr)
        narrative = FALLBACK
      }

      await sessionRef.update({ aiNarrative: narrative })

      // Build client session for PDF
      const clientSession: ClientSession = {
        ...session,
        createdAt: (session.createdAt as any).toDate().toISOString(),
        expiresAt: (session.expiresAt as any).toDate().toISOString(),
        aiNarrative: narrative,
      }

      // Generate PDF
      let pdfUrl: string | null = null
      try {
        const browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        })
        const page = await browser.newPage()
        const html = buildReportHTML(clientSession)
        await page.setContent(html, { waitUntil: 'networkidle0' })
        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '0', right: '0', bottom: '0', left: '0' },
        })
        await browser.close()

        // Upload to Firebase Storage
        const bucket = storage.bucket()
        const filePath = `pdfs/${sessionId}/report.pdf`
        const file = bucket.file(filePath)
        await file.save(Buffer.from(pdfBuffer), {
          metadata: { contentType: 'application/pdf' },
        })

        // Generate signed URL (7 days)
        const [signedUrl] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        })
        pdfUrl = signedUrl
      } catch (pdfErr) {
        functions.logger.error('PDF generation failed:', pdfErr)
        pdfUrl = null
      }

      await sessionRef.update({
        pdfUrl: pdfUrl ?? null,
        status: 'complete',
      })

      res.json({ success: true, pdfUrl })
    } catch (err) {
      functions.logger.error('generateReport error:', err)
      res.status(500).json({ error: 'An error occurred.' })
    }
  }
)
