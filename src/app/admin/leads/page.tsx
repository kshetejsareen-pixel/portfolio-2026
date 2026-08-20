// Read-only view of every enquiry the contact form has stored.
//
// The form's own delivery path is email + phone push; this page exists for the
// case those fail silently, and as a searchable history of where leads came
// from. Access is gated by the same middleware that protects /admin.

import Link from 'next/link'
import { listLeads, type StoredLead } from '@/lib/leads'

export const dynamic = 'force-dynamic'   // never cache someone's enquiries
export const metadata = { title: 'Leads · KS Admin', robots: { index: false, follow: false } }

const IST = 'Asia/Kolkata'

function when(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: IST,
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

// The whole point of storing attribution is being able to read it at a glance,
// so flatten it into labelled chips rather than a nested blob.
function attributionChips(lead: StoredLead): [string, string][] {
  const a = lead.attribution ?? {}
  const pairs: [string, string | undefined][] = [
    ['Landed on', a.sourcePage],
    ['Sent from', a.submittedFrom],
    ['Referrer', a.referrer],
    ['Source', a.utmSource],
    ['Medium', a.utmMedium],
    ['Campaign', a.utmCampaign],
    ['Term', a.utmTerm],
    ['Content', a.utmContent],
    ['Google Ads', a.gclid ? 'yes' : undefined],
    ['Country', lead.country],
  ]
  return pairs.filter((p): p is [string, string] => Boolean(p[1]))
}

export default async function LeadsPage() {
  const leads  = await listLeads()
  const failed = leads.filter((l) => l.delivery === 'failed').length

  return (
    <div className="lead-root">
      <style>{CSS}</style>

      <header className="lead-head">
        <div>
          <div className="lead-logo">KS · Leads</div>
          <div className="lead-count">
            {leads.length === 0
              ? 'No enquiries stored yet'
              : `${leads.length} enquir${leads.length === 1 ? 'y' : 'ies'}`}
            {failed > 0 && <span className="lead-warn"> · {failed} email failed to send</span>}
          </div>
        </div>
        <Link href="/admin" className="lead-back">← Admin</Link>
      </header>

      {leads.length === 0 ? (
        <p className="lead-empty">
          Every contact-form submission is stored here automatically. Nothing has come in yet.
        </p>
      ) : (
        <ul className="lead-list">
          {leads.map((lead) => (
            <li key={lead.id} className={`lead-card lead-card--${lead.delivery}`}>
              <div className="lead-row">
                <div className="lead-who">
                  <span className="lead-name">{lead.name}</span>
                  <a href={`mailto:${lead.email}`} className="lead-email">{lead.email}</a>
                  {lead.company && <span className="lead-company">{lead.company}</span>}
                </div>
                <div className="lead-meta">
                  <span className={`lead-badge lead-badge--${lead.delivery}`}>{lead.delivery}</span>
                  <time className="lead-time">{when(lead.createdAt)}</time>
                </div>
              </div>

              {(lead.projectType || lead.timeline || lead.budget) && (
                <div className="lead-brief">
                  {lead.projectType && <span><b>Type</b> {lead.projectType}</span>}
                  {lead.timeline    && <span><b>Timeline</b> {lead.timeline}</span>}
                  {lead.budget      && <span><b>Budget</b> {lead.budget}</span>}
                </div>
              )}

              <p className="lead-message">{lead.message}</p>

              <div className="lead-attr">
                {attributionChips(lead).map(([k, v]) => (
                  <span key={k} className="lead-chip"><b>{k}</b> {v}</span>
                ))}
              </div>

              {lead.delivery === 'failed' && lead.error && (
                <p className="lead-error">Email failed — reply manually. {lead.error}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const CSS = `
.lead-root { min-height:100vh; background:#0c0c0c; color:#e8e8e0;
  font-family:var(--font-mono), ui-monospace, monospace; padding:28px 24px 80px; }
.lead-head { display:flex; align-items:flex-start; justify-content:space-between;
  gap:16px; border-bottom:1px solid #1e1e1e; padding-bottom:18px; margin-bottom:24px; }
.lead-logo { font-size:13px; letter-spacing:.16em; text-transform:uppercase; }
.lead-count { font-size:11px; color:#8a8a82; margin-top:6px; letter-spacing:.06em; }
.lead-warn { color:#e0a355; }
.lead-back { font-size:11px; color:#8a8a82; text-decoration:none; letter-spacing:.1em;
  border:1px solid #1e1e1e; padding:7px 12px; }
.lead-back:hover { color:#e8e8e0; border-color:#3a3a3a; }
.lead-empty { font-size:12px; color:#8a8a82; line-height:1.7; max-width:52ch; }
.lead-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:14px; }
.lead-card { border:1px solid #1e1e1e; border-left:2px solid #2a2a2a; padding:16px 18px; background:#101010; }
.lead-card--failed { border-left-color:#c2603f; }
.lead-card--sent   { border-left-color:#3f7d55; }
.lead-row { display:flex; align-items:baseline; justify-content:space-between; gap:16px; flex-wrap:wrap; }
.lead-who { display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; }
.lead-name { font-size:14px; }
.lead-email { font-size:12px; color:#9fb4c9; text-decoration:none; }
.lead-email:hover { text-decoration:underline; }
.lead-company { font-size:11px; color:#8a8a82; }
.lead-meta { display:flex; align-items:center; gap:12px; }
.lead-time { font-size:11px; color:#6f6f68; white-space:nowrap; }
.lead-badge { font-size:9px; letter-spacing:.14em; text-transform:uppercase;
  padding:3px 7px; border:1px solid #2a2a2a; color:#8a8a82; }
.lead-badge--sent   { color:#7fb894; border-color:#2f4f3b; }
.lead-badge--failed { color:#e0855f; border-color:#5a3125; }
.lead-brief { display:flex; gap:18px; flex-wrap:wrap; margin-top:12px; font-size:11px; color:#a8a8a0; }
.lead-brief b { color:#6f6f68; font-weight:400; margin-right:5px; }
.lead-message { margin:12px 0 0; font-size:12.5px; line-height:1.75; color:#d4d4cc; white-space:pre-wrap; }
.lead-attr { display:flex; gap:8px; flex-wrap:wrap; margin-top:14px; }
.lead-chip { font-size:10px; color:#8a8a82; border:1px solid #1e1e1e; padding:3px 8px;
  max-width:46ch; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.lead-chip b { color:#5f5f58; font-weight:400; margin-right:5px; }
.lead-error { margin:12px 0 0; font-size:11px; color:#e0855f; line-height:1.6; }
`
