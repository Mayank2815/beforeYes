import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { verifyPaymentSignature } from '@/lib/razorpay'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json()

    if (!sessionId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    let signatureValid: boolean
    try {
      signatureValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
    } catch {
      return NextResponse.json({ error: 'Signature verification failed.' }, { status: 400 })
    }

    if (!signatureValid) {
      return NextResponse.json({ error: 'Invalid payment signature.' }, { status: 400 })
    }

    const db = getAdminDb()
    const sessionRef = db.collection('sessions').doc(sessionId)

    await sessionRef.update({
      paymentStatus: 'paid',
      paymentId: razorpayPaymentId,
      status: 'paid',
    })

    // Trigger report generation asynchronously (fire and forget)
    const appBase = process.env.NEXT_PUBLIC_APP_BASE_URL ?? ''
    if (appBase) {
      fetch(`${appBase}/api/report/${sessionId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {
        // Non-blocking — generation continues in background
      })
    }

    return NextResponse.json({
      success: true,
      reportUrl: `/report/${sessionId}`,
    })
  } catch (err) {
    console.error('Payment verify error:', err)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
