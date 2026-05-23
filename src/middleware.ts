import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow the login page and login API through
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next()
  }

  // Protect all /admin and /api/admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('admin_token')?.value
    if (token !== process.env.ADMIN_PASSWORD) {
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
