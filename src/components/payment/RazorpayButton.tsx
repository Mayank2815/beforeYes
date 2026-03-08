'use client'
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface RazorpayButtonProps {
  sessionId: string
  partnerAName: string
}

declare global {
  interface Window {
    Razorpay: new (options: any) => any
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window.Razorpay !== 'undefined') return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
}

export function RazorpayButton({ sessionId, partnerAName }: RazorpayButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePayment() {
    setLoading(true)
    setError('')
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Payment service unavailable. Please try again.')

      const { data } = await axios.post('/api/payment/create-order', { sessionId })

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: 'BeforeYes',
          description: 'Compatibility Intelligence Report',
          order_id: data.orderId,
          handler: async (response: {
            razorpay_order_id: string
            razorpay_payment_id: string
            razorpay_signature: string
          }) => {
            try {
              const verifyRes = await axios.post('/api/payment/verify', {
                sessionId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
              if (verifyRes.data.success) {
                router.push(`/report/${sessionId}`)
                resolve()
              } else {
                reject(new Error('Payment verification failed.'))
              }
            } catch (e) {
              reject(e)
            }
          },
          prefill: { name: partnerAName },
          notes: { sessionId },
          theme: { color: '#B8955A' },
          modal: {
            ondismiss: () => {
              setLoading(false)
              resolve()
            },
          },
        })
        rzp.on('payment.failed', (response: unknown) => {
          const res = response as any
          reject(new Error(res.error?.description ?? 'Payment failed.'))
        })
        rzp.open()
      })
    } catch (err: unknown) {
      const error = err as any
      setError(error.message ?? 'Payment could not be processed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button size="lg" onClick={handlePayment} loading={loading} className="w-full max-w-sm">
        Unlock Full Report — ₹499
      </Button>
      <p className="font-body text-xs text-brand-muted">Secure payment via Razorpay. One-time fee.</p>
      {error && (
        <p className="font-body text-xs text-brand-danger bg-red-50 px-4 py-2 border border-brand-danger max-w-sm text-center">
          {error}
        </p>
      )}
    </div>
  )
}
