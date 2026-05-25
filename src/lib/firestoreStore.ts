import '@/lib/firebase'
import { getFirestore } from 'firebase-admin/firestore'

const COLLECTION = 'portfolio'

export async function firestoreRead<T>(docId: string, fallback: T): Promise<T> {
  try {
    const db   = getFirestore()
    const snap = await db.collection(COLLECTION).doc(docId).get()
    if (!snap.exists) return fallback
    return (snap.data()?.data ?? fallback) as T
  } catch (err) {
    console.error('[firestoreRead] failed for', docId, err)
    return fallback
  }
}

export async function firestoreWrite<T>(docId: string, data: T): Promise<void> {
  const db = getFirestore()
  await db.collection(COLLECTION).doc(docId).set({ data })
}
