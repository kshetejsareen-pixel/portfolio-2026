// Durable record of every contact-form enquiry.
//
// The form used to be fire-and-forget: it handed the message to Resend and kept
// nothing. A bounced mail, a spam-foldered mail, or a Resend outage meant the
// enquiry vanished with no trace that it had ever arrived. Every submission now
// lands here first, so the studio can recover a lead even when delivery fails.
//
// Writes are best-effort by design — see recordLead. Losing the audit row must
// never cost us the email.

import '@/lib/firebase'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const COLLECTION = 'leads'

export interface LeadAttribution {
  // First page of the visitor's session — the page that actually earned the
  // lead, which is rarely /contact.
  sourcePage?: string
  // Page they submitted from.
  submittedFrom?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  // Google Ads click id, so a future paid test is measurable from day one.
  gclid?: string
}

export interface LeadInput {
  name: string
  email: string
  company?: string
  projectType?: string
  timeline?: string
  budget?: string
  message: string
  attribution?: LeadAttribution
  // Derived server-side from Vercel's edge headers.
  country?: string
  userAgent?: string
}

export type LeadDeliveryStatus = 'pending' | 'sent' | 'failed'

// Firestore rejects `undefined` values, and the attribution object is mostly
// optional fields, so strip empties rather than writing nulls everywhere.
function compact<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '') out[k as keyof T] = v as T[keyof T]
  }
  return out
}

// Returns the new document id, or null if the write failed.
//
// Never throws: the caller is in the middle of handling a real enquiry, and a
// Firestore problem must not stop that enquiry being emailed.
export async function recordLead(lead: LeadInput): Promise<string | null> {
  try {
    const db  = getFirestore()
    const ref = db.collection(COLLECTION).doc()
    await ref.set({
      ...compact(lead),
      attribution: compact(lead.attribution ?? {}),
      delivery:    'pending' satisfies LeadDeliveryStatus,
      createdAt:   Timestamp.now(),
    })
    return ref.id
  } catch (err) {
    console.error('[recordLead] failed to store lead:', err)
    return null
  }
}

// Records whether the notification email actually went out. Also best-effort:
// by this point the lead is already safely stored, and the caller's response to
// the visitor does not depend on the outcome.
export async function markLeadDelivery(
  id: string,
  status: LeadDeliveryStatus,
  detail?: { emailId?: string; error?: string },
): Promise<void> {
  try {
    await getFirestore().collection(COLLECTION).doc(id).update({
      delivery: status,
      ...compact(detail ?? {}),
      deliveredAt: Timestamp.now(),
    })
  } catch (err) {
    console.error('[markLeadDelivery] failed for', id, err)
  }
}

export interface StoredLead extends LeadInput {
  id: string
  delivery: LeadDeliveryStatus
  createdAt: string          // ISO — Timestamp is not serialisable into a client component
  deliveredAt?: string
  emailId?: string
  error?: string
}

// Newest first. Returns [] rather than throwing so the admin page still renders
// (with an empty table) if Firestore is unreachable — the same best-effort
// contract as the write path.
export async function listLeads(limit = 200): Promise<StoredLead[]> {
  try {
    const snap = await getFirestore()
      .collection(COLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()

    return snap.docs.map((doc) => {
      const d = doc.data()
      const iso = (v: unknown) =>
        v instanceof Timestamp ? v.toDate().toISOString() : undefined
      return {
        ...(d as LeadInput),
        id:          doc.id,
        delivery:    (d.delivery ?? 'pending') as LeadDeliveryStatus,
        createdAt:   iso(d.createdAt) ?? '',
        deliveredAt: iso(d.deliveredAt),
        emailId:     d.emailId,
        error:       d.error,
      }
    })
  } catch (err) {
    console.error('[listLeads] failed:', err)
    return []
  }
}
