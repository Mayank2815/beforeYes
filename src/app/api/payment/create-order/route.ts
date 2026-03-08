import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { createRazorpayOrder } from '@/lib/razorpay'

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()
    
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Invalid session ID.' }, { status: 400 })
    }

    const db = getAdminDb()
    const sessionRef = db.collection('sessions').doc(sessionId)
    const sessionDoc = await sessionRef.get()

    if (!sessionDoc.exists) {
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 })
    }

    const session = sessionDoc.data()!

    if (session.status !== 'preview') {
      return NextResponse.json({ error: 'Session not ready for payment.' }, { status: 400 })
    }

    // Reuse existing order if present (payment retry)
    if (session.paymentOrderId) {
      return NextResponse.json({
        orderId: session.paymentOrderId,
        amount: 49900,
        currency: 'INR',
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      })
    }

    const order = await createRazorpayOrder(49900, sessionId)

    await sessionRef.update({ paymentOrderId: order.id })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('Create order error:', err)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
