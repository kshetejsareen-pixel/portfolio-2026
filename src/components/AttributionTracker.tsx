'use client'

import { useEffect } from 'react'
import { captureFirstTouch } from '@/lib/attribution'

// Renders nothing. Mounted once in the root layout so the first page of every
// session is stamped, including the service landing pages that are otherwise
// server-rendered with no client code of their own.
export function AttributionTracker() {
  useEffect(() => {
    captureFirstTouch()
  }, [])

  return null
}
