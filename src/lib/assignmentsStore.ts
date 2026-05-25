import { firestoreRead, firestoreWrite } from '@/lib/firestoreStore'

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

export async function setAssignment(slotId: string, data: StoredAssignment): Promise<void> {
  const store = await firestoreRead<Store>(DOC_ID, {})
  for (const [key, val] of Object.entries(store)) {
    if (key !== slotId && val.publicId === data.publicId) delete store[key]
  }
  store[slotId] = data
  await firestoreWrite(DOC_ID, store)
}

export async function removeAssignmentByPublicId(publicId: string): Promise<void> {
  const store = await firestoreRead<Store>(DOC_ID, {})
  for (const key of Object.keys(store)) {
    if (store[key].publicId === publicId) delete store[key]
  }
  await firestoreWrite(DOC_ID, store)
}

export async function swapAssignments(slotA: string, slotB: string): Promise<void> {
  const store = await firestoreRead<Store>(DOC_ID, {})
  const a = store[slotA]
  const b = store[slotB]
  if (a) store[slotB] = a; else delete store[slotB]
  if (b) store[slotA] = b; else delete store[slotA]
  await firestoreWrite(DOC_ID, store)
}

export async function updateTransform(
  slotId: string,
  angle: 0 | 90 | 180 | 270,
  flipH: boolean,
  flipV: boolean,
): Promise<void> {
  const store = await firestoreRead<Store>(DOC_ID, {})
  if (store[slotId]) {
    store[slotId] = { ...store[slotId], angle, flipH, flipV }
    await firestoreWrite(DOC_ID, store)
  }
}

export async function updateFocalPoint(slotId: string, focalX: number, focalY: number): Promise<void> {
  const store = await firestoreRead<Store>(DOC_ID, {})
  if (store[slotId]) {
    store[slotId] = { ...store[slotId], focalX, focalY }
    await firestoreWrite(DOC_ID, store)
  }
}

export async function updateCopyByPublicId(
  publicId: string,
  copy: Partial<Pick<StoredAssignment, 'title' | 'location' | 'year' | 'camera'>>,
): Promise<void> {
  const store = await firestoreRead<Store>(DOC_ID, {})
  for (const key of Object.keys(store)) {
    if (store[key].publicId === publicId) {
      store[key] = { ...store[key], ...copy }
    }
  }
  await firestoreWrite(DOC_ID, store)
}
