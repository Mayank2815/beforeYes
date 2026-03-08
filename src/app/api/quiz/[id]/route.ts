import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { partnerBSchema } from '@/lib/validation'
import { calculateScores } from '@/lib/scoring'
import { Timestamp } from 'firebase-admin/firestore'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    const db = getAdminDb()
    const sessionRef = db.collection('sessions').doc(sessionId)
    const sessionDoc = await sessionRef.get()

    if (!sessionDoc.exists) {
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 })
    }

    const session = sessionDoc.data()!

    // Check expiry
    const expiresAt = session.expiresAt as Timestamp
    if (expiresAt.toDate() < new Date()) {
      return NextResponse.json({ error: 'This session has expired.' }, { status: 410 })
    }

    // Idempotency check
    if (session.status !== 'waiting_b') {
      return NextResponse.json(
        { error: 'Quiz already submitted for this session.' },
        { status: 409 }
      )
    }

    const body = await req.json()
    const parsed = partnerBSchema.safeParse(body.partnerBData)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Run scoring server-side
    const scores = calculateScores(session.partnerAData, parsed.data)

    await sessionRef.update({
      partnerBData: parsed.data,
      scores,
      status: 'preview',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Quiz submission error:', err)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
