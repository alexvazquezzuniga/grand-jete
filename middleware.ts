import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // app.grandjete.mx abre la administración
  if (
    host.startsWith('app.grandjete.mx') &&
    url.pathname === '/'
  ) {
    url.pathname = '/admin'
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}