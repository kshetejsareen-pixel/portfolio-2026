import { firestoreRead, firestoreWrite, firestoreDeleteNestedField, firestoreTransaction } from '@/lib/firestoreStore'

const DOC_ID = 'ks-assignments'

export interface StoredAssignment {
  publicId: string
  url: string
  mobileUrl: string
  title: string
  location: string
  year: string
  camera: string
  focalX?: number
  focalY?: number
  angle?: 0 | 90 | 180 | 270
  flipH?: boolean
  flipV?: boolean
}

type Store = Record<string, StoredAssignment>

export async function getAllAssignments(): Promise<Store> {
  return firestoreRead<Store>(DOC_ID, {})
}

// Alias for public routes — identical with Firestore (no CDN caching issue)
export const getAllAssignmentsPublic = getAllAssignments

// Dedup only within the same slot "family" so the same image can appear on
// both the landing page and a category gallery page without either being erased.
function slotFamily(id: string): 'landing' | 'gallery' {
  return id.startsWith('landing-') ? 'landing' : 'gallery'
}

export async function setAssignment(slotId: string, data: StoredAssignment): Promise<void> {
  // Run inside a transaction so the dedup read and subsequent write are atomic —
  // a concurrent assign on another serverless instance cannot cause lost assignments.
  await firestoreTransaction<Store>(DOC_ID, {}, (store) => {
    const family = slotFamily(slotId)
    for (const [key, val] of Object.entries(store)) {
      if (key !== slotId && slotFamily(key) === family && val.publicId === data.publicId) {
        delete store[key]
      }
    }
    store[slotId] = data
    return store
  })
}

export async function removeAssignment(slotId: string): Promise<void> {
  // Atomic single-field delete — zero read-modify-write, cannot touch any other slot.
  await firestoreDeleteNestedField(DOC_ID, slotId)
}

// Removes every slot that holds this publicId — use only when truly purging an image.
export async function removeAssignmentByPublicId(publicId: string): Promise<void> {
  await firestoreTransaction<Store>(DOC_ID, {}, (store) => {
    for (const key of Object.keys(store)) {
      if (store[key].publicId === publicId) delete store[key]
    }
    return store
  })
}

export async function swapAssignments(slotA: string, slotB: string): Promise<void> {
  await firestoreTransaction<Store>(DOC_ID, {}, (store) => {
    const a = store[slotA]
    const b = store[slotB]
    if (a) store[slotB] = a; else delete store[slotB]
    if (b) store[slotA] = b; else delete store[slotA]
    return store
  })
}

export async function updateTransform(
  slotId: string,
  angle: 0 | 90 | 180 | 270,
  flipH: boolean,
  flipV: boolean,
): Promise<void> {
  await firestoreTransaction<Store>(DOC_ID, {}, (store) => {
    if (store[slotId]) store[slotId] = { ...store[slotId], angle, flipH, flipV }
    return store
  })
}

export async function updateFocalPoint(slotId: string, focalX: number, focalY: number): Promise<void> {
  await firestoreTransaction<Store>(DOC_ID, {}, (store) => {
    if (store[slotId]) store[slotId] = { ...store[slotId], focalX, focalY }
    return store
  })
}

export async function updateCopyByPublicId(
  publicId: string,
  copy: Partial<Pick<StoredAssignment, 'title' | 'location' | 'year' | 'camera'>>,
): Promise<void> {
  await firestoreTransaction<Store>(DOC_ID, {}, (store) => {
    for (const key of Object.keys(store)) {
      if (store[key].publicId === publicId) store[key] = { ...store[key], ...copy }
    }
    return store
  })
}
