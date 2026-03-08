import * as functions from 'firebase-functions/v2/firestore'
import * as admin from 'firebase-admin'
import type { PartnerAData, PartnerBData } from '../../src/types'

// Import scoring from a local copy or shared module
// In production, copy the scoring module into functions/src/scoring/
// For brevity, we inline the calculateScores call here using a shared path
// In practice: symlink or copy src/lib/scoring/* to functions/src/scoring/*

// Firestore trigger: backup scoring in case API route fails
export const onQuizComplete = functions.onDocumentUpdated(
  'sessions/{sessionId}',
  async (event) => {
    const before = event.data?.before?.data()
    const after = event.data?.after?.data()

    if (!before || !after) return
    if (before.status === after.status) return
    if (after.status !== 'scoring') return

    const db = admin.firestore()
    const sessionId = event.params.sessionId
    const sessionRef = db.collection('sessions').doc(sessionId)

    try {
      functions.logger.info(`Backup scoring triggered for session ${sessionId}`)

      // Re-validate scoring hasn't already been done
      const fresh = await sessionRef.get()
      const freshData = fresh.data()
      if (freshData?.status !== 'scoring') {
        functions.logger.info(`Session ${sessionId} already processed, skipping backup scoring`)
        return
      }

      // Import scoring engine
      const { calculateScores } = await import('./scoring/index')
      const scores = calculateScores(
        freshData.partnerAData as PartnerAData,
        freshData.partnerBData as PartnerBData
      )

      await sessionRef.update({
        scores,
        status: 'preview',
      })
      functions.logger.info(`Backup scoring complete for session ${sessionId}`)
    } catch (err) {
      functions.logger.error(`Backup scoring failed for session ${sessionId}:`, err)
    }
  }
)
