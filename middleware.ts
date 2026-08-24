import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // El subdominio app muestra internamente /admin
  if (host.startsWith('app.grandjete.mx')) {
    if (
      !url.pathname.startsWith('/admin') &&
      !url.pathname.startsWith('/_next') &&
      !url.pathname.startsWith('/favicon')
    ) {
      url.pathname = '/admin'
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}