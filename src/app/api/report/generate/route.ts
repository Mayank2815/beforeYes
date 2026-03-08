// src/app/api/report/generate/route.ts
// Internal endpoint — triggered after payment verification
import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb, getAdminStorage } from '@/lib/firebase-admin'
import { generateAINarrative } from '@/lib/ai/explainer'
import { generatePDF } from '@/lib/pdf/generator'
import type { ScoreResult, AINarrative, PartnerAData } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const db = getAdminDb()
    const docRef = db.collection('sessions').doc(sessionId)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const session = doc.data()!

    if (session.paymentStatus !== 'paid') {
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 402 })
    }

    // If already generated, skip
    if (session.aiNarrative && session.pdfUrl) {
      return NextResponse.json({ success: true, alreadyGenerated: true })
    }

    const scores = session.scores as ScoreResult
    const partnerAData = session.partnerAData as PartnerAData

    // Step 1: Generate AI narrative
    let aiNarrative: AINarrative
    try {
      aiNarrative = await generateAINarrative(scores)
    } catch (aiErr) {
      // AI failure handled inside generateAINarrative — it returns fallback
      aiNarrative = await generateAINarrative(scores)
    }

    // Store narrative immediately
    await docRef.update({ aiNarrative })

    // Step 2: Generate PDF
    let pdfUrl: string | null = null
    try {
      const pdfBuffer = await generatePDF(sessionId, scores, aiNarrative, partnerAData)
      const storage = getAdminStorage()
      const bucket = storage.bucket()
      const file = bucket.file(`pdfs/${sessionId}/report.pdf`)

      await file.save(pdfBuffer, {
        metadata: {
          contentType: 'application/pdf',
          cacheControl: 'private, max-age=604800',
        },
      })

      // Generate signed URL valid for 7 days
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      })

      pdfUrl = signedUrl
    } catch (pdfErr) {
      // PDF generation failed — report will still show AI insights
      pdfUrl = null
    }

    await docRef.update({
      pdfUrl,
      status: 'complete',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
