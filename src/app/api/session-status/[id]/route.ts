// src/app/api/session-status/[id]/route.ts
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

    return NextResponse.json({
      sessionId: session.sessionId,
      status: session.status,
      paymentStatus: session.paymentStatus,
      partnerAName: session.partnerAData?.personal?.name || 'Partner A',
      expiresAt: session.expiresAt?.toDate()?.toISOString(),
      hasPartnerB: !!session.partnerBData,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
