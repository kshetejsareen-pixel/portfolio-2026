// Phone push for a new enquiry.
//
// The studio already gets an email, but email does not feel urgent and an
// enquiry competes with everything else in the inbox. This pushes a tappable
// notification the moment a lead lands.
//
// ntfy.sh: no account, no SDK, one POST to a topic you subscribe to in the app.
// The topic name is the only secret, so it must be long and unguessable -
// anyone who knows it can both read and post to it.
//
// Entirely optional: with NTFY_TOPIC unset this is a no-op, and every failure
// is swallowed. A notification problem must never cost us the enquiry.

const TOPIC = process.env.NTFY_TOPIC
const TIMEOUT_MS = 4000

// ntfy carries the title and tags as HTTP headers, and Node rejects header
// values outside latin-1. Names routinely contain characters that are not, so
// strip anything unsafe rather than throwing mid-request.
function headerSafe(v: string, max = 120): string {
  return v.replace(/[^\x20-\x7e]/g, '').trim().slice(0, max) || 'New enquiry'
}

export interface LeadAlert {
  name: string
  email: string
  company?: string
  projectType?: string
  budget?: string
  message: string
  sourcePage?: string
}

export async function pushLeadAlert(lead: LeadAlert): Promise<void> {
  if (!TOPIC) return

  const body = [
    lead.company     && `Company: ${lead.company}`,
    lead.projectType && `Type: ${lead.projectType}`,
    lead.budget      && `Budget: ${lead.budget}`,
    lead.sourcePage  && `From: ${lead.sourcePage}`,
    lead.email,
    '',
    lead.message.slice(0, 400),
  ].filter(Boolean).join('\n')

  try {
    await fetch(`https://ntfy.sh/${encodeURIComponent(TOPIC)}`, {
      method: 'POST',
      headers: {
        Title: headerSafe(`New enquiry - ${lead.name}`),
        Priority: 'high',
        Tags: 'camera_flash',
        // Tapping the notification opens the reply straight away.
        Click: `mailto:${headerSafe(lead.email, 200)}`,
      },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (err) {
    console.error('[pushLeadAlert] failed:', err)
  }
}
