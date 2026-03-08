import crypto from 'crypto'

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET!
const RAZORPAY_BASE = 'https://api.razorpay.com/v1'

function authHeader(): string {
  return 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_SECRET}`).toString('base64')
}

export async function createRazorpayOrder(
  amountPaise: number,
  receipt: string
): Promise<{ id: string; amount: number; currency: string }> {
  const res = await fetch(`${RAZORPAY_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Razorpay order creation failed: ${err}`)
  }
  return res.json()
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const payload = `${orderId}|${paymentId}`
  const expected = crypto
    .createHmac('sha256', RAZORPAY_SECRET)
    .update(payload)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', RAZORPAY_SECRET)
    .update(body)
    .digest('hex')
  return expected === signature
}
