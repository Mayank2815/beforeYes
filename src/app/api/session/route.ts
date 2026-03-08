import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { partnerASchema } from '@/lib/validation'
import { generateSessionId, getExpiresAt } from '@/lib/utils'
import { Timestamp } from 'firebase-admin/firestore'

// Simple IP-based rate limiting using Firestore
async function checkRateLimit(ip: string): Promise<boolean> {
  const db = getAdminDb()
  const now = new Date()
  const windowStart = new Date(now.getTime() - 60 * 60 * 1000) // 1 hour ago

  const rateLimitRef = db.collection('rateLimits').doc(`session_${ip}`)
  
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(rateLimitRef)
    const data = doc.data()
    
    let requests: number[] = data?.requests ?? []
    // Filter to only requests within the window
    requests = requests.filter((ts: number) => ts > windowStart.getTime())
    
    if (requests.length >= 10) return false
    
    requests.push(now.getTime())
    tx.set(rateLimitRef, { requests, ip })
    return true
  })
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
    
    const allowed = await checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const parsed = partnerASchema.safeParse(body.partnerAData)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const sessionId = generateSessionId()
    const now = Timestamp.now()
    const expiresAt = Timestamp.fromDate(getExpiresAt())

    const db = getAdminDb()
    await db.collection('sessions').doc(sessionId).set({
      sessionId,
      createdAt: now,
      expiresAt,
      partnerAData: parsed.data,
      paymentStatus: 'pending',
      status: 'waiting_b',
    })

    const appBase = process.env.NEXT_PUBLIC_APP_BASE_URL ?? ''
    return NextResponse.json({
      sessionId,
      quizUrl: `${appBase}/quiz/${sessionId}`,
    })
  } catch (err) {
    console.error('Session creation error:', err)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
