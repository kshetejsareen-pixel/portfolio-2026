'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { VisualEditor } from '@/components/VisualEditor'

// Derive a stable pageId from the URL path
function pathToPageId(path: string): string {
  if (path === '/') return 'home'
  return path.replace(/^\//, '').replace(/\//g, '-') || 'home'
}

export function VisualEditorRoot() {
  const pathname = usePathname()
  const pageId = pathToPageId(pathname)

  // Toggle body class so page content shifts left of the inspector panel
  useEffect(() => {
    // The VisualEditor component handles this via its own state;
    // we expose a global event for it to toggle the body class.
  }, [])

  return <VisualEditor pageId={pageId} />
}
