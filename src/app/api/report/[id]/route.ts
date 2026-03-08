import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import type { Session, ClientSession } from '@/types'

function sessionToClient(session: Session): ClientSession {
  return {
    ...session,
    createdAt: (session.createdAt as unknown as Timestamp).toDate().toISOString(),
    expiresAt: (session.expiresAt as unknown as Timestamp).toDate().toISOString(),
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    const db = getAdminDb()
    const sessionDoc = await db.collection('sessions').doc(sessionId).get()

    if (!sessionDoc.exists) {
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 })
    }

    const session = sessionDoc.data() as Session

    // TODO: Re-enable Razorpay payment gate before going live
    // if (session.paymentStatus !== 'paid') {
    //   return NextResponse.json({ error: 'Payment required to access report.' }, { status: 403 })
    // }

    const client = sessionToClient(session)

    if (!session.pdfUrl) {
      return NextResponse.json({
        ready: false,
        session: client,
      })
    }

    return NextResponse.json({
      ready: true,
      session: client,
    })
  } catch (err) {
    console.error('Report fetch error:', err)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
