import { cloudinaryRead, cloudinaryReadFresh, cloudinaryWrite } from '@/lib/cloudinaryStore'

const PUBLIC_ID = 'ks-assignments'

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
}

type Store = Record<string, StoredAssignment>

export async function getAllAssignments(): Promise<Store> {
  return cloudinaryRead<Store>(PUBLIC_ID, {})
}

export async function setAssignment(slotId: string, data: StoredAssignment): Promise<void> {
  const store = await cloudinaryRead<Store>(PUBLIC_ID, {})
  // If this publicId was assigned elsewhere, clear the old slot
  for (const [key, val] of Object.entries(store)) {
    if (key !== slotId && val.publicId === data.publicId) delete store[key]
  }
  store[slotId] = data
  await cloudinaryWrite(PUBLIC_ID, store)
}

export async function removeAssignmentByPublicId(publicId: string): Promise<void> {
  const store = await cloudinaryRead<Store>(PUBLIC_ID, {})
  for (const key of Object.keys(store)) {
    if (store[key].publicId === publicId) delete store[key]
  }
  await cloudinaryWrite(PUBLIC_ID, store)
}

export async function swapAssignments(slotA: string, slotB: string): Promise<void> {
  const store = await cloudinaryRead<Store>(PUBLIC_ID, {})
  const a = store[slotA]
  const b = store[slotB]
  if (a) store[slotB] = a; else delete store[slotB]
  if (b) store[slotA] = b; else delete store[slotA]
  await cloudinaryWrite(PUBLIC_ID, store)
}

export async function updateFocalPoint(slotId: string, focalX: number, focalY: number): Promise<void> {
  const store = await cloudinaryReadFresh<Store>(PUBLIC_ID, {})
  console.log('[updateFocalPoint] store keys:', Object.keys(store).length, 'slot exists:', !!store[slotId])
  if (store[slotId]) {
    store[slotId] = { ...store[slotId], focalX, focalY }
    await cloudinaryWrite(PUBLIC_ID, store)
    console.log('[updateFocalPoint] saved', slotId, focalX, focalY)
  } else {
    console.warn('[updateFocalPoint] slot not found:', slotId)
  }
}

export async function updateCopyByPublicId(
  publicId: string,
  copy: Partial<Pick<StoredAssignment, 'title' | 'location' | 'year' | 'camera'>>,
): Promise<void> {
  const store = await cloudinaryRead<Store>(PUBLIC_ID, {})
  for (const key of Object.keys(store)) {
    if (store[key].publicId === publicId) {
      store[key] = { ...store[key], ...copy }
    }
  }
  await cloudinaryWrite(PUBLIC_ID, store)
}
