import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { generateNarrative, FALLBACK_NARRATIVE } from '@/lib/ai/explainer'
import { generatePDF } from '@/lib/pdf/generator'
import type { Session, ClientSession } from '@/types'

// This internal route is called by the Preview page's "View Full Report" button
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id
  const db = getAdminDb()

  try {
    const sessionDoc = await db.collection('sessions').doc(sessionId).get()
    if (!sessionDoc.exists) return NextResponse.json({ error: 'Not found.' }, { status: 404 })

    const session = sessionDoc.data() as Session
    // TODO: Re-enable Razorpay payment gate before going live
    // if (session.paymentStatus !== 'paid') {
    //   return NextResponse.json({ error: 'Not paid.' }, { status: 403 })
    // }

    if (!session.scores) {
      return NextResponse.json({ error: 'No scores.' }, { status: 400 })
    }

    // If already fully generated, return immediately
    if (session.aiNarrative && session.pdfUrl) {
      return NextResponse.json({ success: true, pdfUrl: session.pdfUrl })
    }

    // Step 1: Generate AI narrative (or use existing)
    let narrative = session.aiNarrative
    if (!narrative) {
      try {
        narrative = await generateNarrative(session.scores)
      } catch (aiErr) {
        console.error('AI generation failed, using fallback:', aiErr)
        narrative = FALLBACK_NARRATIVE
      }
      await db.collection('sessions').doc(sessionId).update({ aiNarrative: narrative })
    }

    // Step 2: Generate PDF via Puppeteer
    let pdfUrl: string | null = null
    try {
      // Build the ClientSession object Puppeteer's template needs
      const clientSession: ClientSession = {
        ...session,
        sessionId,
        aiNarrative: narrative,
        createdAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
      }

      const pdfBuffer = await generatePDF(clientSession)

      // Try to upload to Firebase Storage if configured
      const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      if (storageBucket) {
        try {
          const { getAdminStorage } = await import('@/lib/firebase-admin')
          const storage = getAdminStorage()
          const bucket = storage.bucket()
          const file = bucket.file(`pdfs/${sessionId}/report.pdf`)

          await file.save(pdfBuffer, {
            metadata: {
              contentType: 'application/pdf',
              cacheControl: 'private, max-age=604800',
            },
          })

          const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
          })
          pdfUrl = signedUrl
        } catch (storageErr) {
          console.error('Firebase Storage upload failed, falling back to inline data URL:', storageErr)
        }
      }

      // Fallback: return PDF as base64 data URL (works without Firebase Storage)
      if (!pdfUrl) {
        pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`
      }
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr)
      // Return what we have — the client gets AI narrative at minimum
      return NextResponse.json({ success: true, pdfUrl: null })
    }

    // Persist pdfUrl to Firestore only if it's not a data URL (too large to store)
    if (pdfUrl && !pdfUrl.startsWith('data:')) {
      await db.collection('sessions').doc(sessionId).update({
        pdfUrl,
        status: 'complete',
      })
    }

    return NextResponse.json({ success: true, pdfUrl })
  } catch (err) {
    console.error('Generate report error:', err)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
