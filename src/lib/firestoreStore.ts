import '@/lib/firebase'
import { getFirestore, FieldPath, FieldValue } from 'firebase-admin/firestore'

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

// Atomically removes a single nested field (data.<fieldKey>) without touching
// the rest of the document — eliminates the read-modify-write race condition.
export async function firestoreDeleteNestedField(docId: string, fieldKey: string): Promise<void> {
  const db = getFirestore()
  await db.collection(COLLECTION).doc(docId).update(
    new FieldPath('data', fieldKey),
    FieldValue.delete(),
  )
}

// Transaction wrapper for read-modify-write operations that must be atomic.
export async function firestoreTransaction<T>(
  docId: string,
  fallback: T,
  updater: (current: T) => T,
): Promise<void> {
  const db     = getFirestore()
  const docRef = db.collection(COLLECTION).doc(docId)
  await db.runTransaction(async (tx) => {
    const snap    = await tx.get(docRef)
    const current = (snap.exists ? (snap.data()?.data ?? fallback) : fallback) as T
    const next    = updater(current)
    tx.set(docRef, { data: next })
  })
}
