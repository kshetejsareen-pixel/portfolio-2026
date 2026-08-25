import '@/lib/firebase'
import { getFirestore, FieldPath, FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { CollectionReference, DocumentReference } from 'firebase-admin/firestore'

const COLLECTION = 'portfolio'

// Every write below replaces a whole document, so a bad save used to be
// unrecoverable — there was nothing to go back to. Each write now files the
// pre-image into a `versions` subcollection first, and the last KEEP of them
// are held. Subcollections are invisible to a document read, so nothing that
// reads `portfolio/<id>` pays for this.
const VERSIONS = 'versions'
const KEEP     = 20

// The id is the timestamp, so lexicographic order is chronological order and
// listing needs no orderBy field and no composite index. The suffix breaks
// ties between two saves inside the same millisecond.
function versionId(): string {
  return `${new Date().toISOString()}_${Math.random().toString(36).slice(2, 8)}`
}

async function prune(versions: CollectionReference): Promise<void> {
  const all = await versions.orderBy(FieldPath.documentId(), 'desc').select().get()
  const stale = all.docs.slice(KEEP)
  if (!stale.length) return
  const batch = getFirestore().batch()
  stale.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}

// Never allowed to fail a save. A snapshot is insurance; losing the insurance
// is worth a log line, not a failed publish.
async function snapshot(docId: string, previous: unknown, reason: string): Promise<void> {
  if (previous === undefined) return  // first ever write — no pre-image to keep
  try {
    const versions = getFirestore().collection(COLLECTION).doc(docId).collection(VERSIONS)
    await versions.doc(versionId()).set({ data: previous, savedAt: Timestamp.now(), reason })
    await prune(versions)
  } catch (err) {
    console.error('[firestoreStore] snapshot failed for', docId, err)
  }
}

async function preImage(ref: DocumentReference): Promise<unknown> {
  try {
    const snap = await ref.get()
    return snap.exists ? snap.data()?.data : undefined
  } catch (err) {
    console.error('[firestoreStore] pre-image read failed for', ref.id, err)
    return undefined
  }
}

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
  const ref = getFirestore().collection(COLLECTION).doc(docId)
  const previous = await preImage(ref)
  await ref.set({ data })
  await snapshot(docId, previous, 'write')
}

// Atomically removes a single nested field (data.<fieldKey>) without touching
// the rest of the document — eliminates the read-modify-write race condition.
export async function firestoreDeleteNestedField(docId: string, fieldKey: string): Promise<void> {
  const ref = getFirestore().collection(COLLECTION).doc(docId)
  const previous = await preImage(ref)
  await ref.update(new FieldPath('data', fieldKey), FieldValue.delete())
  await snapshot(docId, previous, `delete:${fieldKey}`)
}

// Transaction wrapper for read-modify-write operations that must be atomic.
export async function firestoreTransaction<T>(
  docId: string,
  fallback: T,
  updater: (current: T) => T,
): Promise<void> {
  const db     = getFirestore()
  const docRef = db.collection(COLLECTION).doc(docId)
  // The transaction already reads the document, so the pre-image is free here.
  // A retried transaction reassigns this; the final attempt is the true one.
  let previous: unknown
  await db.runTransaction(async (tx) => {
    const snap    = await tx.get(docRef)
    previous      = snap.exists ? snap.data()?.data : undefined
    const current = (snap.exists ? (snap.data()?.data ?? fallback) : fallback) as T
    const next    = updater(current)
    tx.set(docRef, { data: next })
  })
  await snapshot(docId, previous, 'transaction')
}

export type VersionMeta = { id: string; savedAt: string; reason: string }

// Every document that has ever been written, straight from Firestore, so the
// restore UI never drifts from a hardcoded list of doc ids.
export async function listStoreDocs(): Promise<string[]> {
  const refs = await getFirestore().collection(COLLECTION).listDocuments()
  return refs.map((r) => r.id).sort()
}

export async function listVersions(docId: string): Promise<VersionMeta[]> {
  const snap = await getFirestore()
    .collection(COLLECTION).doc(docId).collection(VERSIONS)
    .orderBy(FieldPath.documentId(), 'desc').limit(KEEP).get()
  return snap.docs.map((d) => {
    const v = d.data()
    return {
      id:      d.id,
      savedAt: v.savedAt?.toDate?.().toISOString() ?? d.id.split('_')[0],
      reason:  typeof v.reason === 'string' ? v.reason : 'write',
    }
  })
}

export async function readVersion(docId: string, version: string): Promise<unknown> {
  const snap = await getFirestore()
    .collection(COLLECTION).doc(docId).collection(VERSIONS).doc(version).get()
  return snap.exists ? snap.data()?.data : undefined
}

// Restoring goes back through firestoreWrite, so the state being replaced is
// itself snapshotted — an accidental restore is as undoable as anything else.
export async function restoreVersion(docId: string, version: string): Promise<boolean> {
  const data = await readVersion(docId, version)
  if (data === undefined) return false
  await firestoreWrite(docId, data)
  return true
}
