import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { verifyWebhookSignature } from '@/lib/razorpay'

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-razorpay-signature') ?? ''
    const body = await req.text()

    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const db = getAdminDb()

    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity
      const orderId = payment?.order_id
      const paymentId = payment?.id

      if (orderId && paymentId) {
        // Find session by orderId
        const sessionsSnap = await db
          .collection('sessions')
          .where('paymentOrderId', '==', orderId)
          .limit(1)
          .get()

        if (!sessionsSnap.empty) {
          const sessionDoc = sessionsSnap.docs[0]
          const session = sessionDoc.data()
          if (session.paymentStatus !== 'paid') {
            await sessionDoc.ref.update({
              paymentStatus: 'paid',
              paymentId,
              status: 'paid',
            })
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 })
  }
}
