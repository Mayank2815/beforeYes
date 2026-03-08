import * as scheduledFunctions from 'firebase-functions/v2/scheduler'
import * as admin from 'firebase-admin'
import { logger } from 'firebase-functions/v2'

if (admin.apps.length === 0) {
  admin.initializeApp()
}

export const cleanupSessions = scheduledFunctions.onSchedule(
  { schedule: 'every 6 hours', timeZone: 'Asia/Kolkata' },
  async () => {
    const db = admin.firestore()
    const now = admin.firestore.Timestamp.now()

    const expiredSnap = await db
      .collection('sessions')
      .where('expiresAt', '<', now)
      .where('paymentStatus', '==', 'pending')
      .get()

    if (expiredSnap.empty) {
      logger.info('No expired sessions to clean up.')
      return
    }

    const batch = db.batch()
    expiredSnap.docs.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()

    // Also clean up rate limit entries older than 2 hours
    const twoHoursAgo = admin.firestore.Timestamp.fromMillis(Date.now() - 2 * 60 * 60 * 1000)
    const rateLimitSnap = await db.collection('rateLimits').get()
    const rlBatch = db.batch()
    rateLimitSnap.docs.forEach((doc) => {
      const requests: number[] = doc.data().requests ?? []
      const fresh = requests.filter(ts => ts > twoHoursAgo.toMillis())
      if (fresh.length === 0) {
        rlBatch.delete(doc.ref)
      } else {
        rlBatch.update(doc.ref, { requests: fresh })
      }
    })
    await rlBatch.commit()

    logger.info(`Deleted ${expiredSnap.size} expired sessions.`)
  }
)
