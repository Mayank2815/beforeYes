// src/app/api/preview/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id
    const db = getAdminDb()
    const doc = await db.collection('sessions').doc(sessionId).get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const session = doc.data()!

    if (!['preview', 'paid', 'complete'].includes(session.status)) {
      return NextResponse.json({ error: 'Scores not ready yet' }, { status: 404 })
    }

    return NextResponse.json({
      scores: session.scores
        ? {
            overall: session.scores.overall,
            emotional: session.scores.emotional,
            financial: session.scores.financial,
            foundational: session.scores.foundational,
            riskFlags: session.scores.riskFlags,
            engagementIndex: session.scores.engagementIndex,
          }
        : null,
      paymentStatus: session.paymentStatus,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
