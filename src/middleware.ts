import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/adminSession'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login + verify pages/APIs through without a session cookie
  if (
    pathname === '/admin/login' ||
    pathname === '/admin/verify' ||
    pathname === '/api/admin/login' ||
    pathname === '/api/admin/verify'
  ) {
    return NextResponse.next()
  }

  // Protect all /admin and /api/admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('admin_token')?.value
    if (!(await verifySessionToken(token))) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
