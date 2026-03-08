import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getStorage, Storage } from 'firebase-admin/storage'

let adminApp: App
let adminDb: Firestore
let adminStorage: Storage

function getAdminApp(): App {
  if (adminApp) return adminApp
  const existing = getApps().find((a) => a.name === 'admin')
  if (existing) {
    adminApp = existing
    return adminApp
  }
  adminApp = initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    },
    'admin'
  )
  return adminApp
}

export function getAdminDb(): Firestore {
  if (adminDb) return adminDb
  adminDb = getFirestore(getAdminApp())
  return adminDb
}

export function getAdminStorage(): Storage {
  if (adminStorage) return adminStorage
  adminStorage = getStorage(getAdminApp())
  return adminStorage
}
