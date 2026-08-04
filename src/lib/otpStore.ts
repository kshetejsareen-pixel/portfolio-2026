import '@/lib/firebase'
import { getFirestore } from 'firebase-admin/firestore'
import { randomInt } from 'node:crypto'

const COLLECTION = 'portfolio'
const DOC_ID     = 'admin-otp'
const OTP_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

interface OtpEntry {
  code: string
  expiresAt: number
  attempts: number
}

export async function generateOtp(_key: string): Promise<string> {
  // randomInt, not Math.random: this is a second auth factor, and Math.random
  // is a predictable PRNG.
  const code = randomInt(100_000, 1_000_000).toString()
  const entry: OtpEntry = { code, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 }
  await getFirestore().collection(COLLECTION).doc(DOC_ID).set(entry)
  return code
}

export async function verifyOtp(
  _key: string,
  input: string,
): Promise<'ok' | 'expired' | 'wrong' | 'locked'> {
  const db     = getFirestore()
  const docRef = db.collection(COLLECTION).doc(DOC_ID)

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(docRef)
    if (!snap.exists) return 'expired'

    const entry = snap.data() as OtpEntry
    if (Date.now() > entry.expiresAt) { tx.delete(docRef); return 'expired' }
    if (entry.attempts >= MAX_ATTEMPTS) return 'locked'

    if (input !== entry.code) {
      tx.update(docRef, { attempts: entry.attempts + 1 })
      return 'wrong'
    }

    tx.delete(docRef)
    return 'ok'
  })
}

export async function clearOtp(_key: string): Promise<void> {
  await getFirestore().collection(COLLECTION).doc(DOC_ID).delete()
}
